import type { Exercise } from './exercise';

export type CEFRLevel = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type Article = 'der' | 'die' | 'das';

export type VocabItem = {
  id: string;
  lessonId: string;
  german: string;
  turkish: string;
  article?: Article;
  plural?: string;
  example: string;
  exampleDe?: string;
  exampleTr: string;
  tags: string[];
};

export type GrammarNote = {
  title: string;
  bodyTr: string;
  examples: Array<{
    german: string;
    turkish: string;
  }>;
};

export type LessonStep =
  | { type: 'intro'; titleTr: string; bodyTr: string }
  | { type: 'vocabulary'; titleTr: string }
  | { type: 'grammar'; titleTr: string }
  | { type: 'dialogue'; titleTr: string }
  | { type: 'speaking'; titleTr: string; promptDe: string; promptTr: string }
  | { type: 'writing'; titleTr: string; promptTr: string }
  | { type: 'review'; titleTr: string; bodyTr: string };

export type SpeakingPrompt = {
  titleTr: string;
  promptDe: string;
  promptTr: string;
};

export type WritingPrompt = {
  titleTr: string;
  promptTr: string;
  sampleAnswerDe?: string;
};

export type Lesson = {
  id: string;
  unit: number;
  cefr: CEFRLevel;
  title: string;
  titleTr?: string;
  titleDe?: string;
  subtitle: string;
  descriptionTr: string;
  goalTr?: string;
  estimatedMinutes: number;
  objectives: string[];
  vocabulary: VocabItem[];
  grammar: GrammarNote[];
  commonMistakeTr?: string;
  speakingPrompt?: SpeakingPrompt;
  writingPrompt?: WritingPrompt;
  reviewSummaryTr?: string;
  steps?: LessonStep[];
  dialog?: Array<{
    speaker: string;
    line: string;
    translationTr: string;
  }>;
  baseExercises: Exercise[];
};
