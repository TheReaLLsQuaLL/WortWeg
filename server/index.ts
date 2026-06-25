import cors from 'cors';
import express from 'express';

import { getBackendConfig, isCorsOriginAllowed } from './config';
import { generateAiTeacherResponse } from './geminiClient';
import { speechRouter } from './speechRoutes';
import { getModelForMode } from './modelRouter';
import { createRateLimitMiddleware } from './rateLimit';
import {
  aiTeacherRequestSchema,
  aiTeacherResponseSchema,
  type AiTeacherResponse,
} from './schemas';

const config = getBackendConfig();
const app = express();
const healthRateLimit = createRateLimitMiddleware('health', config.rateLimitHealthMax);
const aiRateLimit = createRateLimitMiddleware('ai', config.rateLimitAiMax);
const speechRateLimit = createRateLimitMiddleware('speech', config.rateLimitSpeechMax);

console.log('[WortWeg Backend] Startup Diagnostics:', {
  nodeEnv: config.nodeEnv,
  speechAzureEnabled: config.speechAzureEnabled,
  speechScoringProvider: config.speechScoringProvider,
  speechAzureConversionEnabled: config.speechAzureConversionEnabled,
  azureSpeechKeyConfigured: config.azureSpeechKeyConfigured,
  azureSpeechRegionConfigured: Boolean(config.azureSpeechRegion),
  azureSpeechRegion: config.azureSpeechRegion,
  sttProvider: config.sttProvider,
});

const toPublicAiResponse = (data: AiTeacherResponse) => {
  if (config.includeProviderDiagnostics) {
    return data;
  }

  const { modelUsed: _modelUsed, ...publicData } = data;
  return publicData;
};

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, isCorsOriginAllowed(origin));
    },
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use('/speech', speechRateLimit, speechRouter);

app.get('/health', healthRateLimit, (_request, response) => {
  response.json({ ok: true, service: 'wortweg-ai' });
});

app.post('/ai/teacher', aiRateLimit, async (request, response) => {
  const parsedRequest = aiTeacherRequestSchema.safeParse(request.body);

  if (!parsedRequest.success) {
    response.status(400).json({
      error: 'Invalid request body',
      details: config.includeProviderDiagnostics ? parsedRequest.error.flatten() : undefined,
    });
    return;
  }

  const model = getModelForMode(parsedRequest.data.mode);
  const aiResponse = await generateAiTeacherResponse(parsedRequest.data);
  const parsedResponse = aiTeacherResponseSchema.safeParse({
    ...aiResponse,
    modelUsed: aiResponse.modelUsed || model,
  });

  if (!parsedResponse.success) {
    response.status(502).json({
      error: 'AI response failed validation',
      details: config.includeProviderDiagnostics ? parsedResponse.error.flatten() : undefined,
    });
    return;
  }

  response.json(toPublicAiResponse(parsedResponse.data));
});

const server = app.listen(config.port, config.host, () => {
  console.log(`WortWeg AI backend listening on http://${config.host}:${config.port}`);
  console.log(`Expo Go phone URL: http://YOUR_MAC_LAN_IP:${config.port}`);
});

const keepAlive = setInterval(() => {
  // Keep local dev server alive in runtimes that do not retain the HTTP server.
}, 60_000);

const shutdown = () => {
  clearInterval(keepAlive);
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
