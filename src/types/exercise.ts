import type { Article } from './lesson';

export type Choice = {
  id: string;
  text: string;
};

export type ExerciseKind =
  | 'multipleChoice'
  | 'article'
  | 'translation'
  | 'listening'
  | 'fillBlank'
  | 'sentenceBuild';

export type ExerciseSkill =
  | 'vocabulary'
  | 'grammar'
  | 'reading'
  | 'listening'
  | 'writing';

export type Exercise = {
  id: string;
  lessonId: string;
  type: ExerciseKind;
  skill: ExerciseSkill;
  prompt: string;
  question: string;
  options?: string[];
  choices?: Choice[];
  correctAnswer: string;
  correctChoiceId?: string;
  acceptedAnswers?: string[];
  explanation: string;
  xp: number;
  article?: Article;
  speechText?: string;
  buildWords?: string[];
  targetTranslation?: string;
  isRetry?: boolean;
};

export type AnswerResult = {
  correct: boolean;
  expected: string;
  feedback: string;
  xpEarned: number;
};

export type ExerciseAttempt = {
  exerciseId: string;
  answer: string;
  result: AnswerResult;
  answeredAt: string;
};
