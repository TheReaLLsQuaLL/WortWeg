import fs from 'node:fs/promises';
import express from 'express';
import multer from 'multer';

import { getBackendConfig } from './config';
import { transcribeAudio } from './sttClient';
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

    logSpeechDebug('endpoint hit', {
      fileSize: file.size,
      language: requestData.language,
      provider: process.env.STT_PROVIDER || 'openai',
      model: process.env.STT_MODEL || 'gpt-4o-mini-transcribe',
    });

    try {
      const result = await transcribeAudio({
        filePath: file.path,
        originalName: file.originalname,
        mimeType: file.mimetype,
        language: requestData.language || 'de',
        expectedText: requestData.expectedText,
        prompt: requestData.prompt,
      });

      logSpeechDebug('response ready', {
        provider: result.provider,
        model: result.modelUsed,
        fallback: result.fallback,
        durationMs: Date.now() - startedAt,
      });

      response.json(toPublicSpeechResponse({
        ...result,
        durationMs: Math.max(result.durationMs, Date.now() - startedAt),
      }));
    } catch {
      response.status(500).json({ error: 'Speech transcription failed.' });
    } finally {
      await removeTempFile(file);
    }
  });
});
