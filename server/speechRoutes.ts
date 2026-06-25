import fs from 'node:fs/promises';
import express from 'express';
import multer from 'multer';

import { getBackendConfig } from './config';
import { transcribeAudio } from './sttClient';
import { assessPronunciation } from './azureSpeechClient';
import { convertToAzureWav } from './audioConvert';
import { speechTranscribeRequestSchema } from './speechSchemas';
import { getUploadSizeLimitBytes, speechUpload } from './upload';

export const speechRouter = express.Router();

const config = getBackendConfig();
const isDevelopment = !config.isProduction;

const logSpeechDebug = (message: string, details?: Record<string, string | number | boolean | undefined>) => {
  if (!isDevelopment) {
    return;
  }

  console.log('[WortWeg Speech]', message, details ?? {});
};

const removeTempFile = async (file?: Express.Multer.File) => {
  if (!file?.path) {
    return;
  }

  try {
    await fs.unlink(file.path);
  } catch {
    // Temporary upload cleanup should never break the response path.
  }
};

const toPublicSpeechResponse = (result: Awaited<ReturnType<typeof transcribeAudio>>) => {
  if (config.includeProviderDiagnostics) {
    return result;
  }

  const { provider: _provider, modelUsed: _modelUsed, ...publicResult } = result;
  return publicResult;
};

const sendUploadError = (response: express.Response, error: unknown) => {
  if (error instanceof multer.MulterError) {
    const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    response.status(status).json({
      error: error.code === 'LIMIT_FILE_SIZE'
        ? 'Audio file is too large. Maximum upload size is 10MB.'
        : 'Invalid audio upload.',
      details: config.includeProviderDiagnostics ? { code: error.code, maxBytes: getUploadSizeLimitBytes() } : undefined,
    });
    return;
  }

  if (error instanceof Error && error.message === 'unsupported-audio-format') {
    response.status(415).json({
      error: 'Unsupported audio format.',
      details: config.includeProviderDiagnostics ? { allowed: ['m4a', 'mp3', 'mp4', 'wav', 'webm', 'mpeg', 'mpga'] } : undefined,
    });
    return;
  }

  response.status(400).json({ error: 'Invalid multipart upload.' });
};

speechRouter.post('/transcribe', (request, response) => {
  const startedAt = Date.now();

  speechUpload.single('audio')(request, response, async (uploadError) => {
    if (uploadError) {
      sendUploadError(response, uploadError);
      return;
    }

    const file = request.file;

    if (!file) {
      response.status(400).json({ error: 'Audio file is required.' });
      return;
    }

    const parsedBody = speechTranscribeRequestSchema.safeParse({
      language: request.body?.language || 'de',
      expectedText: request.body?.expectedText,
      prompt: request.body?.prompt,
    });

    if (!parsedBody.success) {
      await removeTempFile(file);
      response.status(400).json({
        error: 'Invalid transcription request.',
        details: config.includeProviderDiagnostics ? parsedBody.error.flatten() : undefined,
      });
      return;
    }

    const requestData = parsedBody.data;

    const diag = {
      expectedTextPresent: Boolean(requestData.expectedText),
      expectedTextLength: requestData.expectedText?.length || 0,
      azureEnabled: config.speechAzureEnabled,
      scoringProvider: config.speechScoringProvider,
      azureKeyConfigured: config.azureSpeechKeyConfigured,
      azureRegionConfigured: Boolean(config.azureSpeechRegion),
      azureConversionEnabled: config.speechAzureConversionEnabled,
      azureAttempted: false,
      azureSucceeded: false,
      azureHasPronunciationScore: false,
      azureWordsCount: 0,
      azureError: undefined as string | undefined,
      openaiFallbackUsed: false,
    };

    logSpeechDebug('endpoint hit', {
      fileSize: file.size,
      language: requestData.language,
      provider: process.env.STT_PROVIDER || 'openai',
      model: process.env.STT_MODEL || 'gpt-4o-mini-transcribe',
    });

    try {
      let result;
      let usedAzure = false;

      if (config.speechAzureEnabled && requestData.expectedText) {
        let isSupportedFormat = file.mimetype === 'audio/wav' || file.mimetype === 'audio/ogg';
        const isM4a = file.mimetype === 'audio/mp4' || file.mimetype === 'audio/m4a' || file.mimetype === 'audio/x-m4a' || file.mimetype === 'audio/aac';
        let convertedPath: string | null = null;
        let finalPath = file.path;
        let finalMimeType = file.mimetype;

        try {
          if (!isSupportedFormat && isM4a && config.speechAzureConversionEnabled) {
            try {
              convertedPath = await convertToAzureWav(file.path);
              finalPath = convertedPath;
              finalMimeType = 'audio/wav';
              isSupportedFormat = true;
            } catch (convError) {
              logSpeechDebug('backend conversion failed, falling back to openai', {
                error: convError instanceof Error ? convError.message : String(convError),
              });
            }
          }

          if (isSupportedFormat) {
            diag.azureAttempted = true;
            try {
              const azureResult = await assessPronunciation(
                finalPath,
                requestData.expectedText,
                finalMimeType,
                config.speechProviderTimeoutMs
              );

              diag.azureSucceeded = true;
              diag.azureHasPronunciationScore = typeof azureResult.pronunciationScore === 'number';
              diag.azureWordsCount = azureResult.words?.length || 0;

              result = {
                transcript: azureResult.transcript,
                language: 'de',
                confidence: azureResult.confidence,
                provider: 'azure',
                modelUsed: 'azure-pronunciation-assessment',
                fallback: false,
                durationMs: Date.now() - startedAt,
                pronunciationScore: azureResult.pronunciationScore,
                accuracyScore: azureResult.accuracyScore,
                fluencyScore: azureResult.fluencyScore,
                completenessScore: azureResult.completenessScore,
                words: azureResult.words,
              };
              usedAzure = true;
            } catch (azureError) {
              diag.azureError = azureError instanceof Error ? azureError.message : String(azureError);
              logSpeechDebug('azure failed, falling back to openai', {
                error: diag.azureError,
              });
            }
          } else {
            logSpeechDebug('unsupported-audio-format for azure, falling back to openai', {
              mimetype: file.mimetype,
            });
          }
        } finally {
          if (convertedPath) {
            try {
              await fs.unlink(convertedPath);
            } catch (err) {
              // Ignore cleanup error for converted file
            }
          }
        }
      }

      if (!usedAzure) {
        diag.openaiFallbackUsed = true;
        result = await transcribeAudio({
          filePath: file.path,
          originalName: file.originalname,
          mimeType: file.mimetype,
          language: requestData.language || 'de',
          expectedText: requestData.expectedText,
          prompt: requestData.prompt,
        });
      }

      console.log('[WortWeg Backend] Speech Request Diagnostics:', diag);

      logSpeechDebug('response ready', {
        provider: result!.provider,
        model: result!.modelUsed,
        fallback: result!.fallback,
        durationMs: Date.now() - startedAt,
      });

      response.json(toPublicSpeechResponse({
        ...result!,
        durationMs: Math.max(result!.durationMs, Date.now() - startedAt),
      }));
    } catch {
      response.status(500).json({ error: 'Speech transcription failed.' });
    } finally {
      await removeTempFile(file);
    }
  });
});
