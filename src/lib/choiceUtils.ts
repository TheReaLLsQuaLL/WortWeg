import type { Choice, Exercise } from '../types/exercise';
import type { ExamQuestion } from '../data/exam.a1';

const hashString = (value: string) => {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};

const createRandom = (seed: string) => {
  let state = hashString(seed) || 1;

  return () => {
    state = Math.imul(1664525, state) + 1013904223;
    return ((state >>> 0) / 4294967296);
  };
};

export const createChoiceId = (questionId: string, text: string, index: number) =>
  questionId + ':choice:' + index + ':' + hashString(text).toString(36);

export const shuffleWithSeed = <T,>(items: T[], seed: string) => {
  const shuffled = [...items];
  const random = createRandom(seed);

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = shuffled[index];
    const swap = shuffled[swapIndex];

    if (current !== undefined && swap !== undefined) {
      shuffled[index] = swap;
      shuffled[swapIndex] = current;
    }
  }

  return shuffled;
};

type ChoiceSource = {
  id: string;
  options?: string[];
  choices?: Choice[];
  correctAnswer?: string;
  correctChoiceId?: string;
};

export const normalizeChoices = (source: ChoiceSource) => {
  const existingChoices = source.choices ?? source.options?.map((text, index) => ({
    id: createChoiceId(source.id, text, index),
    text,
  })) ?? [];
  const correctChoiceId = source.correctChoiceId ?? existingChoices.find(
    (choice) => choice.text === source.correctAnswer,
  )?.id;

  return {
    choices: existingChoices,
    correctChoiceId,
  };
};

export const getShuffledChoices = (source: ChoiceSource, seed = 'default') => {
  const normalized = normalizeChoices(source);

  return {
    ...normalized,
    choices: shuffleWithSeed(normalized.choices, source.id + ':' + seed),
  };
};

export const getChoiceText = (choices: Choice[] | undefined, choiceId: string) =>
  choices?.find((choice) => choice.id === choiceId)?.text;

export const isCorrectChoice = (
  source: ChoiceSource,
  selectedChoiceId: string,
) => {
  const { correctChoiceId } = normalizeChoices(source);

  return Boolean(correctChoiceId) && selectedChoiceId === correctChoiceId;
};

export const withShuffledExerciseChoices = (
  exercise: Exercise,
  seed: string,
): Exercise => {
  if (!exercise.options && !exercise.choices) {
    return exercise;
  }

  const { choices, correctChoiceId } = getShuffledChoices(exercise, seed);

  return {
    ...exercise,
    choices,
    correctChoiceId,
    options: choices.map((choice) => choice.text),
  };
};

export const withShuffledExamChoices = (
  question: ExamQuestion,
  seed: string,
): ExamQuestion => {
  if (!question.options && !question.choices) {
    return question;
  }

  const { choices, correctChoiceId } = getShuffledChoices(question, seed);

  return {
    ...question,
    choices,
    correctChoiceId,
    options: choices.map((choice) => choice.text),
  };
};
