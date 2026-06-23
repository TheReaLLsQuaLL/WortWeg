import path from 'node:path';

import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const DEFAULT_PORT = 3001;
const DEFAULT_HOST = '0.0.0.0';
const DEFAULT_AI_PROVIDER_TIMEOUT_MS = 30_000;
const DEFAULT_SPEECH_PROVIDER_TIMEOUT_MS = 45_000;
const DEFAULT_RATE_LIMIT_WINDOW_MS = 60_000;
const DEFAULT_RATE_LIMIT_AI_MAX = 30;
const DEFAULT_RATE_LIMIT_SPEECH_MAX = 10;
const DEFAULT_RATE_LIMIT_HEALTH_MAX = 120;

const parsePositiveInt = (value: string | undefined, fallback: number) => {
  const parsed = value ? Number(value) : fallback;

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const parseBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined || value.trim() === '') {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();

  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }

  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }

  return fallback;
};

const parseAllowedOrigins = (value: string | undefined) =>
  (value ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const getNodeEnv = () => process.env.NODE_ENV?.trim() || 'development';

const isProductionNodeEnv = (nodeEnv: string) => nodeEnv === 'production';

const getSttProvider = () => (process.env.STT_PROVIDER?.trim() || 'openai').toLowerCase();

const getSpeechScoringProvider = () =>
  (process.env.SPEECH_SCORING_PROVIDER?.trim() || 'transcript').toLowerCase();

export type BackendConfig = {
  aiProviderTimeoutMs: number;
  allowedOrigins: string[];
  azureSpeechKeyConfigured: boolean;
  azureSpeechRegion: string;
  geminiApiKeyConfigured: boolean;
  host: string;
  includeProviderDiagnostics: boolean;
  isProduction: boolean;
  nodeEnv: string;
  openAiApiKeyConfigured: boolean;
  port: number;
  rateLimitAiMax: number;
  rateLimitEnabled: boolean;
  rateLimitHealthMax: number;
  rateLimitSpeechMax: number;
  rateLimitWindowMs: number;
  speechAzureEnabled: boolean;
  speechProviderTimeoutMs: number;
  speechScoringProvider: string;
  sttProvider: string;
};

const buildBackendConfig = (): BackendConfig => {
  const nodeEnv = getNodeEnv();
  const isProduction = isProductionNodeEnv(nodeEnv);
  const sttProvider = getSttProvider();
  const speechScoringProvider = getSpeechScoringProvider();
  const speechAzureEnabled = parseBoolean(process.env.SPEECH_AZURE_ENABLED, false);
  const azureSpeechKey = process.env.AZURE_SPEECH_KEY?.trim() || '';
  const azureSpeechRegion = process.env.AZURE_SPEECH_REGION?.trim() || '';
  const rateLimitEnabled = parseBoolean(process.env.RATE_LIMIT_ENABLED, true);
  const allowedOrigins = parseAllowedOrigins(process.env.ALLOWED_ORIGINS);
  const missing: string[] = [];
  const invalid: string[] = [];

  if (isProduction && allowedOrigins.length === 0) {
    missing.push('ALLOWED_ORIGINS');
  }

  if (isProduction && !process.env.GEMINI_API_KEY?.trim()) {
    missing.push('GEMINI_API_KEY');
  }

  if (isProduction && sttProvider === 'openai' && !process.env.OPENAI_API_KEY?.trim()) {
    missing.push('OPENAI_API_KEY');
  }

  if (isProduction && sttProvider !== 'openai') {
    invalid.push('STT_PROVIDER must be openai until another provider is implemented');
  }

  if (speechScoringProvider !== 'transcript' && speechScoringProvider !== 'azure') {
    invalid.push('SPEECH_SCORING_PROVIDER must be transcript or azure');
  }

  if (speechAzureEnabled) {
    if (!azureSpeechKey) missing.push('AZURE_SPEECH_KEY');
    if (!azureSpeechRegion) missing.push('AZURE_SPEECH_REGION');
  }

  if (speechScoringProvider === 'azure' && !speechAzureEnabled) {
    invalid.push('SPEECH_SCORING_PROVIDER is azure but SPEECH_AZURE_ENABLED is false');
  }

  if (missing.length > 0 || invalid.length > 0) {
    const messages = [
      missing.length > 0 ? 'Missing required environment variables: ' + missing.join(', ') : '',
      invalid.length > 0 ? 'Invalid environment configuration: ' + invalid.join('; ') : '',
    ].filter(Boolean);

    throw new Error(messages.join(' | '));
  }

  return {
    aiProviderTimeoutMs: parsePositiveInt(process.env.AI_PROVIDER_TIMEOUT_MS, DEFAULT_AI_PROVIDER_TIMEOUT_MS),
    allowedOrigins,
    azureSpeechKeyConfigured: Boolean(azureSpeechKey),
    azureSpeechRegion,
    geminiApiKeyConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
    host: process.env.HOST?.trim() || DEFAULT_HOST,
    includeProviderDiagnostics: !isProduction,
    isProduction,
    nodeEnv,
    openAiApiKeyConfigured: Boolean(process.env.OPENAI_API_KEY?.trim()),
    port: parsePositiveInt(process.env.PORT, DEFAULT_PORT),
    rateLimitAiMax: parsePositiveInt(process.env.RATE_LIMIT_AI_MAX, DEFAULT_RATE_LIMIT_AI_MAX),
    rateLimitEnabled,
    rateLimitHealthMax: parsePositiveInt(process.env.RATE_LIMIT_HEALTH_MAX, DEFAULT_RATE_LIMIT_HEALTH_MAX),
    rateLimitSpeechMax: parsePositiveInt(process.env.RATE_LIMIT_SPEECH_MAX, DEFAULT_RATE_LIMIT_SPEECH_MAX),
    rateLimitWindowMs: parsePositiveInt(process.env.RATE_LIMIT_WINDOW_MS, DEFAULT_RATE_LIMIT_WINDOW_MS),
    speechAzureEnabled,
    speechProviderTimeoutMs: parsePositiveInt(process.env.SPEECH_PROVIDER_TIMEOUT_MS, DEFAULT_SPEECH_PROVIDER_TIMEOUT_MS),
    speechScoringProvider,
    sttProvider,
  };
};

const backendConfig = buildBackendConfig();

export const getBackendConfig = () => backendConfig;

const developmentOriginPatterns = [
  /^https?:\/\/localhost(?::\d+)?$/i,
  /^https?:\/\/127\.0\.0\.1(?::\d+)?$/i,
  /^https?:\/\/10\.\d+\.\d+\.\d+(?::\d+)?$/i,
  /^https?:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+(?::\d+)?$/i,
  /^https?:\/\/192\.168\.\d+\.\d+(?::\d+)?$/i,
  /^exp:\/\/.+$/i,
];

export const isCorsOriginAllowed = (origin?: string) => {
  if (!origin) {
    return true;
  }

  const config = getBackendConfig();

  if (config.isProduction) {
    return config.allowedOrigins.includes(origin);
  }

  return (
    config.allowedOrigins.includes(origin) ||
    developmentOriginPatterns.some((pattern) => pattern.test(origin))
  );
};
