import fs from 'node:fs/promises';
import path from 'node:path';

import { getBackendConfig } from './config';
import {
  speechTranscribeResponseSchema,
  type SpeechTranscribeResponse,
} from './speechSchemas';

const DEFAULT_STT_MODEL = 'gpt-4o-mini-transcribe';
const DEFAULT_PROVIDER = 'openai';
const OPENAI_TRANSCRIPTIONS_ENDPOINT = 'https://api.openai.com/v1/audio/transcriptions';

type SttInput = {
  filePath: string;
  originalName?: string;
  mimeType?: string;
  language: string;
  expectedText?: string;
  prompt?: string;
};

type OpenAiTranscriptionResponse = {
  text?: string;
};

const isDevelopment = process.env.NODE_ENV !== 'production';

const getProvider = () => (process.env.STT_PROVIDER?.trim() || DEFAULT_PROVIDER).toLowerCase();
const getModel = () => process.env.STT_MODEL?.trim() || DEFAULT_STT_MODEL;

const sanitizeFilename = (filename?: string) => {
  const baseName = filename ? path.basename(filename) : 'wortweg-audio.m4a';
  return baseName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120) || 'wortweg-audio.m4a';
};

const makeFallbackTranscript = (modelUsed: string) =>
  modelUsed.includes('empty-openai-transcript') ? '' : 'Ich heiße Toprak und ich wohne in Istanbul.';

const makeFallbackResponse = (
  input: SttInput,
  modelUsed: string,
  durationMs: number,
): SpeechTranscribeResponse =>
  speechTranscribeResponseSchema.parse({
    transcript: makeFallbackTranscript(modelUsed),
    language: input.language || 'de',
    confidence: null,
    provider: 'mock',
    modelUsed,
    fallback: true,
    durationMs,
  });

const logSttDebug = (message: string, details?: Record<string, string | number | boolean | undefined>) => {
  if (!isDevelopment) {
    return;
  }

  console.log('[WortWeg STT]', message, details ?? {});
};

const callOpenAiTranscription = async (
  input: SttInput,
  apiKey: string,
  model: string,
): Promise<string> => {
  const audioBuffer = await fs.readFile(input.filePath);
  const filename = sanitizeFilename(input.originalName);
  const blob = new Blob([new Uint8Array(audioBuffer)], {
    type: input.mimeType || 'audio/mp4',
  });
  const form = new FormData();

  form.append('file', blob, filename);
  form.append('model', model);
  form.append('language', input.language || 'de');
  form.append('response_format', 'json');

  const prompt = input.prompt?.trim() || input.expectedText?.trim();
  if (prompt) {
    form.append('prompt', prompt);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getBackendConfig().speechProviderTimeoutMs);

  const response = await fetch(OPENAI_TRANSCRIPTIONS_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + apiKey,
    },
    body: form,
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    throw new Error('openai-http-' + response.status);
  }

  const body = (await response.json()) as OpenAiTranscriptionResponse;
  const transcript = body.text?.trim();

  if (!transcript) {
    throw new Error('empty-openai-transcript');
  }

  return transcript;
};

export const transcribeAudio = async (input: SttInput): Promise<SpeechTranscribeResponse> => {
  const startedAt = Date.now();
  const provider = getProvider();
  const model = getModel();
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  logSttDebug('transcription requested', {
    provider,
    model,
    language: input.language,
  });

  if (provider !== 'openai') {
    const durationMs = Date.now() - startedAt;
    logSttDebug('fallback', { reason: 'unsupported-provider', provider, durationMs });
    return makeFallbackResponse(input, 'mock:unsupported-provider-' + provider + ':' + model, durationMs);
  }

  if (!apiKey) {
    const durationMs = Date.now() - startedAt;
    logSttDebug('fallback', { reason: 'missing-openai-key', provider: 'mock', durationMs });
    return makeFallbackResponse(input, 'mock:missing-openai-key', durationMs);
  }

  try {
    const transcript = await callOpenAiTranscription(input, apiKey, model);
    const durationMs = Date.now() - startedAt;

    logSttDebug('transcription completed', {
      provider: 'openai',
      model,
      durationMs,
    });

    return speechTranscribeResponseSchema.parse({
      transcript,
      language: input.language || 'de',
      confidence: null,
      provider: 'openai',
      modelUsed: model,
      fallback: false,
      durationMs,
    });
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const reason = error instanceof Error && error.name === 'AbortError'
      ? 'openai-timeout'
      : error instanceof Error
        ? error.message
        : 'openai-error';
    const quotaNote = reason === 'openai-http-429'
      ? 'OpenAI rejected the request because of account/project quota or billing. WortWeg remains usable with mock fallback.'
      : undefined;

    logSttDebug('fallback', {
      reason,
      quotaNote,
      provider: 'mock',
      model,
      durationMs,
    });

    return makeFallbackResponse(input, 'mock:' + reason + ':' + model, durationMs);
  }
};
