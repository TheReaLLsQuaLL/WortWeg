import type { AiMode } from './schemas';

const DEFAULT_MAIN_MODEL = 'gemini-3.5-flash';
const DEFAULT_CHEAP_MODEL = 'gemini-3.1-flash-lite';

const mainModes: ReadonlySet<AiMode> = new Set([
  'chat',
  'exam_feedback',
  'writing_feedback',
  'speaking_feedback',
]);

export const getMainModel = () =>
  process.env.GEMINI_MODEL?.trim() || DEFAULT_MAIN_MODEL;

export const getCheapModel = () =>
  process.env.GEMINI_CHEAP_MODEL?.trim() || DEFAULT_CHEAP_MODEL;

export const getModelForMode = (mode: AiMode) =>
  mainModes.has(mode) ? getMainModel() : getCheapModel();

export const getModelTierForMode = (mode: AiMode) =>
  mainModes.has(mode) ? 'main' : 'cheap';

// TODO: Add provider routing here when migrating to OpenAI, Anthropic, or a
// Supabase Edge Function wrapper. The mobile contract should not change.
