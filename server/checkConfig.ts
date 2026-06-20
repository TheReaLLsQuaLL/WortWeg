import { getBackendConfig } from './config';

const config = getBackendConfig();

console.log('[WortWeg Backend] config ok', {
  allowedOriginsCount: config.allowedOrigins.length,
  geminiApiKeyConfigured: config.geminiApiKeyConfigured,
  host: config.host,
  nodeEnv: config.nodeEnv,
  openAiApiKeyConfigured: config.openAiApiKeyConfigured,
  port: config.port,
  rateLimitAiMax: config.rateLimitAiMax,
  rateLimitEnabled: config.rateLimitEnabled,
  rateLimitHealthMax: config.rateLimitHealthMax,
  rateLimitSpeechMax: config.rateLimitSpeechMax,
  rateLimitWindowMs: config.rateLimitWindowMs,
  speechAzureEnabled: config.speechAzureEnabled,
  speechScoringProvider: config.speechScoringProvider,
  sttProvider: config.sttProvider,
});
