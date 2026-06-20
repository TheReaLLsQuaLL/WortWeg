import { z } from 'zod';

export const aiModeSchema = z.enum([
  'chat',
  'exam_feedback',
  'writing_feedback',
  'speaking_feedback',
  'exercise_explanation',
  'mistake_summary',
  'grammar_tip',
  'vocab_explanation',
]);

export const levelSchema = z.enum(['A1', 'A2', 'B1']);

export const conversationMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().max(2000),
});

export const lessonContextSchema = z.object({
  lessonId: z.string().max(120),
  level: z.enum(['A0', 'A1', 'A2', 'B1']),
  title: z.string().max(160),
  grammarLabels: z.array(z.string().max(120)).max(5).default([]),
  vocabularyHeadwords: z.array(z.string().max(80)).max(5).default([]),
  isB1Preview: z.boolean().default(false),
});

export const aiTeacherRequestSchema = z.object({
  mode: aiModeSchema,
  level: levelSchema.default('A1'),
  userMessage: z.string().max(4000).default(''),
  targetLanguage: z.literal('German').default('German'),
  nativeLanguage: z.literal('Turkish').default('Turkish'),
  conversationHistory: z.array(conversationMessageSchema).max(12).default([]),
  context: z
    .object({
      lessonId: z.string().optional(),
      topic: z.string().optional(),
      expectedAnswer: z.string().optional(),
      transcript: z.string().optional(),
      examSection: z.string().optional(),
      word: z.string().optional(),
      article: z.string().optional(),
      correctAnswer: z.string().optional(),
      lessonContext: lessonContextSchema.optional(),
    })
    .default({}),
});

export const aiMistakeSchema = z.object({
  type: z.enum([
    'grammar',
    'vocabulary',
    'article',
    'word_order',
    'pronunciation',
    'other',
  ]),
  original: z.string(),
  correction: z.string(),
  explanationTr: z.string(),
});

export const aiTeacherResponseSchema = z.object({
  de: z.string(),
  tr: z.string(),
  tip: z.string(),
  score: z.number().min(0).max(100).default(0),
  mistakes: z.array(aiMistakeSchema).default([]),
  nextPrompt: z.string().optional(),
  cefr: levelSchema.default('A1'),
  modelUsed: z.string(),
});

export type AiMode = z.infer<typeof aiModeSchema>;
export type AiTeacherRequest = z.infer<typeof aiTeacherRequestSchema>;
export type AiTeacherResponse = z.infer<typeof aiTeacherResponseSchema>;
export type AiMistake = z.infer<typeof aiMistakeSchema>;
