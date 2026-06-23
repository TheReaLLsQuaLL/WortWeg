import fs from 'node:fs';

import { getBackendConfig } from './config.js';

export type AzurePronunciationResult = {
  transcript: string;
  confidence: number;
  pronunciationScore: number;
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
};

export const assessPronunciation = async (
  filePath: string,
  referenceText: string,
  mimetype: string,
  timeoutMs: number,
): Promise<AzurePronunciationResult> => {
  const config = getBackendConfig();

  if (!config.speechAzureEnabled) {
    throw new Error('Azure speech is not enabled in config');
  }

  if (!config.azureSpeechKeyConfigured || !config.azureSpeechRegion) {
    throw new Error('Azure speech key or region missing');
  }

  const endpoint = `https://${config.azureSpeechRegion}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=de-DE&format=detailed`;

  const pronunciationHeaderJson = JSON.stringify({
    ReferenceText: referenceText,
    GradingSystem: 'HundredMark',
    Granularity: 'Word',
    Dimension: 'Comprehensive',
    EnableMiscue: 'True',
  });
  const pronunciationHeaderBase64 = Buffer.from(pronunciationHeaderJson).toString('base64');

  const fileData = await fs.promises.readFile(filePath);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.AZURE_SPEECH_KEY || '',
        'Pronunciation-Assessment': pronunciationHeaderBase64,
        'Content-Type': mimetype,
        'Accept': 'application/json',
      },
      body: fileData,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Azure HTTP error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;

    if (data.RecognitionStatus !== 'Success') {
      throw new Error(`Azure recognition failed: ${data.RecognitionStatus}`);
    }

    const bestResult = data.NBest?.[0];
    if (!bestResult) {
      throw new Error('Azure response missing NBest[0] result');
    }

    const pronunciationAssessment = bestResult.PronunciationAssessment;
    if (!pronunciationAssessment) {
      throw new Error('Azure response missing PronunciationAssessment');
    }

    return {
      transcript: bestResult.Display || bestResult.Lexical || '',
      confidence: typeof bestResult.Confidence === 'number' ? bestResult.Confidence : 1,
      pronunciationScore: pronunciationAssessment.PronScore || 0,
      accuracyScore: pronunciationAssessment.AccuracyScore || 0,
      fluencyScore: pronunciationAssessment.FluencyScore || 0,
      completenessScore: pronunciationAssessment.CompletenessScore || 0,
    };
  } catch (error) {
    const reason = error instanceof Error && error.name === 'AbortError' ? 'timeout' : error instanceof Error ? error.message : 'azure-unknown-error';
    throw new Error(reason);
  } finally {
    clearTimeout(timeoutId);
  }
};
