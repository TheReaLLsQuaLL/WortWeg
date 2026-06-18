import path from 'node:path';

import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import { generateAiTeacherResponse } from './geminiClient';
import { speechRouter } from './speechRoutes';
import { getModelForMode } from './modelRouter';
import {
  aiTeacherRequestSchema,
  aiTeacherResponseSchema,
} from './schemas';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? '0.0.0.0';

app.use(
  cors({
    origin: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use('/speech', speechRouter);

app.get('/health', (_request, response) => {
  response.json({ ok: true, service: 'wortweg-ai' });
});

app.post('/ai/teacher', async (request, response) => {
  const parsedRequest = aiTeacherRequestSchema.safeParse(request.body);

  if (!parsedRequest.success) {
    response.status(400).json({
      error: 'Invalid request body',
      details: parsedRequest.error.flatten(),
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
      details: parsedResponse.error.flatten(),
    });
    return;
  }

  response.json(parsedResponse.data);
});

const server = app.listen(port, host, () => {
  console.log(`WortWeg AI backend listening on http://${host}:${port}`);
  console.log(`Expo Go phone URL: http://YOUR_MAC_LAN_IP:${port}`);
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
