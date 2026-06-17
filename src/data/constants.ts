import type { Article } from '../types/lesson';

export const APP_NAME = 'WortWeg';
export const APP_VERSION = '0.1.0-alpha';

export const STORAGE_KEYS = {
  userState: 'wortweg:user-state:v1',
  localEventLog: 'wortweg:local-event-log:v1',
};

export const XP = {
  exerciseCorrect: 10,
  lessonComplete: 40,
  reviewCorrect: 8,
  examQuestionCorrect: 12,
};

export const ARTICLES: Article[] = ['der', 'die', 'das'];

export const ARTICLE_HINTS: Record<Article, string> = {
  der: 'maskulin',
  die: 'feminin',
  das: 'nötr',
};

export const DAILY_GOALS = [
  { label: '5 dk', minutes: 5, xp: 10 },
  { label: '10 dk', minutes: 10, xp: 20 },
  { label: '15 dk', minutes: 15, xp: 30 },
  { label: '20+ dk', minutes: 20, xp: 50 },
];
