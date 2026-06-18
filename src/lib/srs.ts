import type { Lesson, VocabItem } from '../types/lesson';
import type { ReviewCard } from '../types/userState';
import { addLocalDays, getLocalDateKey, isDueOnOrBefore } from './date';

export type ReviewQuality = 'again' | 'hard' | 'good' | 'easy';

const INITIAL_EASE = 2.5;
const LEITNER_DAYS = [0, 1, 3, 7, 14];

export const makeReviewCard = (word: VocabItem): ReviewCard => ({
  id: `review-${word.id}`,
  wordId: word.id,
  lessonId: word.lessonId,
  german: word.german,
  turkish: word.turkish,
  article: word.article,
  exampleDe: word.exampleDe,
  exampleTr: word.exampleTr,
  dueDate: getLocalDateKey(),
  intervalDays: 0,
  easeFactor: INITIAL_EASE,
  repetitions: 0,
  lapses: 0,
  box: 0,
  right: 0,
  wrong: 0,
});

export const createReviewCardsFromLesson = (
  lesson: Lesson,
  existingCards: ReviewCard[],
): ReviewCard[] => {
  const existingWordIds = new Set(existingCards.map((card) => card.wordId));
  const newCards = lesson.vocabulary
    .filter((word) => !existingWordIds.has(word.id))
    .map(makeReviewCard);

  return [...existingCards, ...newCards];
};

export const getDueReviewCards = (
  cards: ReviewCard[],
  dateKey = getLocalDateKey(),
): ReviewCard[] =>
  cards
    .filter((card) => isDueOnOrBefore(card.dueDate, dateKey))
    .sort((a, b) => a.box - b.box);

export const answerReviewCard = (
  card: ReviewCard,
  quality: ReviewQuality,
  nowDateKey = getLocalDateKey(),
): ReviewCard => {
  const currentBox = card.box ?? Math.min(4, card.repetitions);

  if (quality === 'again') {
    return {
      ...card,
      dueDate: addLocalDays(nowDateKey, LEITNER_DAYS[0] ?? 0),
      intervalDays: LEITNER_DAYS[0] ?? 0,
      easeFactor: Math.max(1.3, card.easeFactor - 0.2),
      repetitions: 0,
      lapses: card.lapses + 1,
      box: 0,
      wrong: card.wrong + 1,
      lastReviewedAt: nowDateKey,
    };
  }

  const easeDelta = quality === 'easy' ? 0.15 : quality === 'hard' ? -0.05 : 0;
  const nextEase = Math.max(1.3, card.easeFactor + easeDelta);
  const nextBox =
    quality === 'hard'
      ? Math.min(4, Math.max(1, currentBox))
      : Math.min(4, currentBox + (quality === 'easy' ? 2 : 1));
  const intervalDays = LEITNER_DAYS[nextBox] ?? 14;

  return {
    ...card,
    dueDate: addLocalDays(nowDateKey, intervalDays),
    intervalDays,
    easeFactor: nextEase,
    repetitions: card.repetitions + 1,
    box: nextBox,
    right: card.right + 1,
    lastReviewedAt: nowDateKey,
  };
};

export const replaceReviewCard = (
  cards: ReviewCard[],
  updatedCard: ReviewCard,
): ReviewCard[] =>
  cards.map((card) => (card.id === updatedCard.id ? updatedCard : card));

export const getKnownReviewCardCount = (cards: ReviewCard[]) =>
  cards.filter((card) => card.box >= 2).length;

export const getReviewCoverage = (cards: ReviewCard[]) => {
  if (cards.length === 0) {
    return 0;
  }

  return getKnownReviewCardCount(cards) / cards.length;
};
