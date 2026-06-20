import type { SpeakingLevelStats, SpeakingStats, SpeakingStatsLevelId } from '../types/userState';

const SCORE_SUCCESS_THRESHOLD = 50;
const MAX_PRACTICED_SENTENCES = 80;

export const speakingStatsLevelOrder: SpeakingStatsLevelId[] = ['A0', 'A1', 'A2', 'B1_PREVIEW', 'OTHER'];

const emptyLevelStats = (): SpeakingLevelStats => ({
  attempts: 0,
  successfulAttempts: 0,
  practicedSentenceIds: [],
});

export const defaultSpeakingStats: SpeakingStats = {
  totalAttempts: 0,
  successfulAttempts: 0,
  practicedSentenceIds: [],
  levelBreakdown: {},
};

const toSafeCount = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;

const toSafeScore = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value)
    ? Math.min(100, Math.max(0, Math.round(value)))
    : undefined;

const toSafeString = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value.trim().slice(0, 120) : undefined;

const uniqueCapped = (values: unknown[] = []) => {
  const unique = values.reduce<string[]>((items, value) => {
    const safeValue = toSafeString(value);

    if (safeValue && !items.includes(safeValue)) {
      items.push(safeValue);
    }

    return items;
  }, []);

  return unique.slice(-MAX_PRACTICED_SENTENCES);
};

const normalizeLevel = (level?: SpeakingStatsLevelId): SpeakingStatsLevelId =>
  level && speakingStatsLevelOrder.includes(level) ? level : 'OTHER';

const normalizeLevelStats = (stats: Partial<SpeakingLevelStats> | undefined): SpeakingLevelStats => ({
  attempts: toSafeCount(stats?.attempts),
  successfulAttempts: toSafeCount(stats?.successfulAttempts),
  bestScorePercent: toSafeScore(stats?.bestScorePercent),
  latestScorePercent: toSafeScore(stats?.latestScorePercent),
  lastPracticedAt: toSafeString(stats?.lastPracticedAt),
  practicedSentenceIds: uniqueCapped(stats?.practicedSentenceIds),
});

export const normalizeSpeakingStats = (stats?: Partial<SpeakingStats> | null): SpeakingStats => {
  if (!stats || typeof stats !== 'object') {
    return defaultSpeakingStats;
  }

  const levelBreakdown = speakingStatsLevelOrder.reduce<SpeakingStats['levelBreakdown']>((acc, level) => {
    const normalized = normalizeLevelStats(stats.levelBreakdown?.[level]);

    if (normalized.attempts > 0 || normalized.practicedSentenceIds.length > 0) {
      acc[level] = normalized;
    }

    return acc;
  }, {});

  return {
    totalAttempts: toSafeCount(stats.totalAttempts),
    successfulAttempts: toSafeCount(stats.successfulAttempts),
    bestScorePercent: toSafeScore(stats.bestScorePercent),
    latestScorePercent: toSafeScore(stats.latestScorePercent),
    lastPracticedAt: toSafeString(stats.lastPracticedAt),
    practicedSentenceIds: uniqueCapped(stats.practicedSentenceIds),
    levelBreakdown,
  };
};

const appendSentenceId = (ids: string[], sentenceId?: string) => {
  const safeSentenceId = toSafeString(sentenceId);

  if (!safeSentenceId || ids.includes(safeSentenceId)) {
    return ids;
  }

  return [...ids, safeSentenceId].slice(-MAX_PRACTICED_SENTENCES);
};

type SpeakingStatsUpdate = {
  level?: SpeakingStatsLevelId;
  practicedAt?: string;
  scorePercent: number;
  sentenceId?: string;
};

export const updateSpeakingStats = (
  stats: Partial<SpeakingStats> | undefined,
  update: SpeakingStatsUpdate,
): SpeakingStats => {
  const current = normalizeSpeakingStats(stats);
  const scorePercent = toSafeScore(update.scorePercent) ?? 0;
  const successful = scorePercent >= SCORE_SUCCESS_THRESHOLD;
  const practicedAt = toSafeString(update.practicedAt) ?? new Date().toISOString();
  const level = normalizeLevel(update.level);
  const currentLevelStats = normalizeLevelStats(current.levelBreakdown[level]);
  const nextLevelStats: SpeakingLevelStats = {
    attempts: currentLevelStats.attempts + 1,
    successfulAttempts: currentLevelStats.successfulAttempts + (successful ? 1 : 0),
    bestScorePercent: Math.max(currentLevelStats.bestScorePercent ?? 0, scorePercent),
    latestScorePercent: scorePercent,
    lastPracticedAt: practicedAt,
    practicedSentenceIds: appendSentenceId(currentLevelStats.practicedSentenceIds, update.sentenceId),
  };

  return {
    totalAttempts: current.totalAttempts + 1,
    successfulAttempts: current.successfulAttempts + (successful ? 1 : 0),
    bestScorePercent: Math.max(current.bestScorePercent ?? 0, scorePercent),
    latestScorePercent: scorePercent,
    lastPracticedAt: practicedAt,
    practicedSentenceIds: appendSentenceId(current.practicedSentenceIds, update.sentenceId),
    levelBreakdown: {
      ...current.levelBreakdown,
      [level]: nextLevelStats,
    },
  };
};

export const formatSpeakingScorePercent = (score?: number) => {
  const safeScore = toSafeScore(score);

  return safeScore === undefined ? '-' : '%' + safeScore;
};

export const formatSpeakingLastPractice = (dateValue?: string) => {
  const safeDate = toSafeString(dateValue);

  if (!safeDate) {
    return 'Henüz yok';
  }

  const date = new Date(safeDate);

  if (Number.isNaN(date.getTime())) {
    return 'Henüz yok';
  }

  return date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
};
