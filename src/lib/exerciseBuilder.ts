import type { AnswerResult, Exercise } from '../types/exercise';
import type { Lesson, VocabItem } from '../types/lesson';
import { ARTICLES, XP } from '../data/constants';
import { getChoiceText, normalizeChoices } from './choiceUtils';

const stripArticle = (word: string) =>
  word.replace(/^(der|die|das)\s+/i, '').trim();

export const normalizeAnswer = (answer: string) =>
  answer
    .trim()
    .toLocaleLowerCase('de-DE')
    .replaceAll('ß', 'ss')
    .replace(/[.!?]/g, '')
    .replace(/\s+/g, ' ');

const unique = <T,>(items: T[]) => Array.from(new Set(items));

const buildVocabularyExercise = (
  lesson: Lesson,
  word: VocabItem,
  allWords: VocabItem[],
): Exercise => {
  const distractors = allWords
    .filter((item) => item.id !== word.id)
    .map((item) => item.turkish)
    .slice(0, 3);

  return {
    id: `gen-${word.id}-meaning`,
    lessonId: lesson.id,
    type: 'multipleChoice',
    skill: 'vocabulary',
    prompt: 'Doğru Türkçe anlamı seç.',
    question: word.german,
    options: unique([word.turkish, ...distractors]).slice(0, 4),
    correctAnswer: word.turkish,
    explanation: `"${word.german}" Türkçede "${word.turkish}" demektir.`,
    xp: XP.exerciseCorrect,
  };
};

const buildArticleExercise = (lesson: Lesson, word: VocabItem): Exercise | null => {
  if (!word.article) {
    return null;
  }

  return {
    id: `gen-${word.id}-article`,
    lessonId: lesson.id,
    type: 'article',
    skill: 'grammar',
    prompt: 'Doğru artikeli seç.',
    question: `___ ${stripArticle(word.german)}`,
    options: ARTICLES,
    correctAnswer: word.article,
    explanation: `"${stripArticle(word.german)}" kelimesinin artikeli "${word.article}"dir.`,
    xp: XP.exerciseCorrect,
    article: word.article,
  };
};

export const buildExercisesForLesson = (lesson: Lesson): Exercise[] => {
  const vocabularyExercises = lesson.vocabulary
    .slice(0, 4)
    .map((word) => buildVocabularyExercise(lesson, word, lesson.vocabulary));

  const articleExercises = lesson.vocabulary
    .map((word) => buildArticleExercise(lesson, word))
    .filter((exercise): exercise is Exercise => exercise !== null)
    .slice(0, 3);

  const byId = new Map<string, Exercise>();
  [...lesson.baseExercises, ...vocabularyExercises, ...articleExercises].forEach(
    (exercise) => {
      byId.set(exercise.id, exercise);
    },
  );

  return Array.from(byId.values());
};

export const checkExerciseAnswer = (
  exercise: Exercise,
  answer: string,
): AnswerResult => {
  const normalizedChoices = normalizeChoices(exercise);
  const selectedChoiceText = getChoiceText(exercise.choices, answer);
  const answerText = selectedChoiceText ?? answer;
  const expectedAnswer = normalizedChoices.correctChoiceId
    ? getChoiceText(exercise.choices, normalizedChoices.correctChoiceId) ?? exercise.correctAnswer
    : exercise.correctAnswer;
  const correct = selectedChoiceText
    ? answer === normalizedChoices.correctChoiceId
    : [exercise.correctAnswer, ...(exercise.acceptedAnswers ?? [])]
        .map(normalizeAnswer)
        .includes(normalizeAnswer(answerText));

  return {
    correct,
    expected: expectedAnswer,
    feedback: correct
      ? `Doğru. ${exercise.explanation}`
      : `Henüz değil. Doğru cevap: ${expectedAnswer}. ${exercise.explanation}`,
    xpEarned: correct ? exercise.xp : 0,
  };
};
