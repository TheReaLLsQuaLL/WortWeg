import { XP } from './constants';
import type { Choice, Exercise, ExerciseSkill } from '../types/exercise';
import type { Article, GrammarNote, Lesson, VocabItem } from '../types/lesson';

type WordSeed = {
  id: string;
  german: string;
  turkish: string;
  article?: Article;
  plural?: string;
  exampleDe: string;
  exampleTr: string;
  tags?: string[];
};

type ChoiceSeed = {
  id: string;
  lessonId: string;
  type?: Exercise['type'];
  skill?: ExerciseSkill;
  prompt: string;
  question: string;
  correct: string;
  distractors: string[];
  explanation: string;
  speechText?: string;
  article?: Article;
};

type TextSeed = {
  id: string;
  lessonId: string;
  type?: Exercise['type'];
  skill?: ExerciseSkill;
  prompt: string;
  question: string;
  correct: string;
  accepted?: string[];
  explanation: string;
  speechText?: string;
};

type BuildSeed = {
  id: string;
  lessonId: string;
  prompt?: string;
  question: string;
  correct: string;
  words: string[];
  explanation: string;
  speechText?: string;
};

type LessonSeed = Omit<Lesson, 'title' | 'subtitle' | 'descriptionTr' | 'vocabulary' | 'baseExercises'> & {
  titleTr: string;
  titleDe: string;
  goalTr: string;
  subtitleTr: string;
  descriptionTr: string;
  vocabulary: WordSeed[];
  baseExercises: Exercise[];
};

const suffixes = ['a', 'b', 'c', 'd', 'e', 'f'];

const uniqueTexts = (items: string[]) => Array.from(new Set(items)).slice(0, 4);

const hashText = (value: string) => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(31, hash) + value.charCodeAt(index);
  }

  return Math.abs(hash);
};

const rotateByExerciseId = (exerciseId: string, texts: string[]) => {
  if (texts.length <= 1) {
    return texts;
  }

  const offset = hashText(exerciseId) % texts.length;

  return [...texts.slice(offset), ...texts.slice(0, offset)];
};

export const makeChoices = (exerciseId: string, texts: string[]): Choice[] =>
  rotateByExerciseId(exerciseId, uniqueTexts(texts)).map((text, index) => ({
    id: exerciseId + '-choice-' + (suffixes[index] ?? String(index + 1)),
    text,
  }));

export const choiceExercise = ({
  article,
  correct,
  distractors,
  explanation,
  id,
  lessonId,
  prompt,
  question,
  skill = 'vocabulary',
  speechText,
  type = 'multipleChoice',
}: ChoiceSeed): Exercise => {
  const choices = makeChoices(id, [correct, ...distractors]);

  return {
    id,
    lessonId,
    type,
    skill,
    prompt,
    question,
    options: choices.map((choice) => choice.text),
    choices,
    correctAnswer: correct,
    correctChoiceId: choices.find((choice) => choice.text === correct)?.id,
    explanation,
    xp: XP.exerciseCorrect,
    article,
    speechText,
  };
};

export const articleExercise = ({
  article,
  explanation,
  id,
  lessonId,
  question,
}: {
  id: string;
  lessonId: string;
  question: string;
  article: Article;
  explanation: string;
}): Exercise =>
  choiceExercise({
    id,
    lessonId,
    type: 'article',
    skill: 'grammar',
    prompt: 'Doğru artikeli seç.',
    question,
    correct: article,
    distractors: ['der', 'die', 'das'].filter((item) => item !== article),
    explanation,
    article,
  });

export const textExercise = ({
  accepted,
  correct,
  explanation,
  id,
  lessonId,
  prompt,
  question,
  skill = 'writing',
  speechText,
  type = 'translation',
}: TextSeed): Exercise => ({
  id,
  lessonId,
  type,
  skill,
  prompt,
  question,
  correctAnswer: correct,
  acceptedAnswers: accepted ?? [correct],
  explanation,
  xp: XP.exerciseCorrect,
  speechText,
});

export const buildExercise = ({
  correct,
  explanation,
  id,
  lessonId,
  prompt = 'Cümleyi doğru sıraya koy.',
  question,
  speechText,
  words,
}: BuildSeed): Exercise => ({
  id,
  lessonId,
  type: 'sentenceBuild',
  skill: 'grammar',
  prompt,
  question,
  correctAnswer: correct,
  buildWords: words,
  targetTranslation: question,
  explanation,
  xp: XP.exerciseCorrect,
  speechText,
});

export const makeLesson = (seed: LessonSeed): Lesson => ({
  ...seed,
  title: seed.titleTr,
  subtitle: seed.subtitleTr,
  descriptionTr: seed.descriptionTr,
  vocabulary: seed.vocabulary.map((word) => ({
    id: seed.id + '-' + word.id,
    lessonId: seed.id,
    german: word.german,
    turkish: word.turkish,
    article: word.article,
    plural: word.plural,
    example: word.exampleDe,
    exampleDe: word.exampleDe,
    exampleTr: word.exampleTr,
    tags: word.tags ?? [],
  } satisfies VocabItem)),
  baseExercises: seed.baseExercises,
});

export const grammarTip = (
  title: string,
  bodyTr: string,
  examples: GrammarNote['examples'],
): GrammarNote => ({ title, bodyTr, examples });
