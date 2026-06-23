import { z } from 'zod';

export const speechLanguageSchema = z.string().trim().min(1).max(12).default('de');

export const speechTranscribeRequestSchema = z.object({
  language: speechLanguageSchema.catch('de'),
  expectedText: z.string().trim().max(500).optional(),
  prompt: z.string().trim().max(500).optional(),
});

export const speechTranscribeResponseSchema = z.object({
  transcript: z.string(),
  language: z.string().default('de'),
  confidence: z.number().min(0).max(1).nullable(),
  provider: z.string(),
  modelUsed: z.string(),
  fallback: z.boolean(),
  durationMs: z.number().int().min(0),
  pronunciationScore: z.number().optional(),
  accuracyScore: z.number().optional(),
  fluencyScore: z.number().optional(),
  completenessScore: z.number().optional(),
});

export const speechErrorResponseSchema = z.object({
  error: z.string(),
  details: z.unknown().optional(),
});

export type SpeechTranscribeRequest = z.infer<typeof speechTranscribeRequestSchema>;
export type SpeechTranscribeResponse = z.infer<typeof speechTranscribeResponseSchema>;
