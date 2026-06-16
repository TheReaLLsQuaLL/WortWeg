import type { Exercise } from './exercise';

export type CEFRLevel = 'A1';
export type Article = 'der' | 'die' | 'das';

export type VocabItem = {
  id: string;
  lessonId: string;
  german: string;
  turkish: string;
  article?: Article;
  plural?: string;
  example: string;
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

export type Lesson = {
  id: string;
  unit: number;
  cefr: CEFRLevel;
  title: string;
  subtitle: string;
  descriptionTr: string;
  estimatedMinutes: number;
  objectives: string[];
  vocabulary: VocabItem[];
  grammar: GrammarNote[];
  dialog?: Array<{
    speaker: string;
    line: string;
    translationTr: string;
  }>;
  baseExercises: Exercise[];
};
