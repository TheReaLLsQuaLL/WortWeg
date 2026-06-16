import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '../data/constants';
import { createLearningPlan, getDailyGoalXp, getGoalLabel } from '../services/planService';
import type { DailyMinutes, LearningPlan, LearningPlanInput, StartLevelId, TargetLevelId, UserGoalId } from '../types/learningPlan';
import type { OnboardingProfile, UserState } from '../types/userState';
import { getLocalDateKey, updateStudyStreak } from './date';

const defaultPlanInput: LearningPlanInput = {
  userGoal: 'daily_life',
  startLevel: 'zero',
  targetLevel: 'A1',
  dailyMinutes: 10,
  prioritySkill: 'speaking',
  studyStyle: 'balanced',
};

const normalizeDailyMinutes = (minutes?: number): DailyMinutes => {
  if (minutes === 5 || minutes === 10 || minutes === 15 || minutes === 20) {
    return minutes;
  }

  return minutes && minutes >= 20 ? 20 : 10;
};

const normalizeGoal = (profile?: OnboardingProfile): UserGoalId => {
  if (profile?.goalId) {
    return profile.goalId;
  }

  const goal = profile?.goal?.toLocaleLowerCase('tr-TR') ?? '';

  if (goal.includes('sınav')) {
    return 'exam';
  }

  if (goal.includes('iş') || goal.includes('kariyer')) {
    return 'work';
  }

  if (goal.includes('seyahat')) {
    return 'travel';
  }

  if (goal.includes('kelime')) {
    return 'daily_life';
  }

  return 'daily_life';
};

const normalizeStartLevel = (profile?: OnboardingProfile): StartLevelId => {
  if (profile?.startLevel) {
    return profile.startLevel;
  }

  if (profile?.level === 'a2') {
    return 'A2';
  }

  if (profile?.level === 'a1') {
    return 'A1';
  }

  return 'zero';
};

const normalizeTargetLevel = (profile?: OnboardingProfile): TargetLevelId => {
  if (profile?.targetLevel) {
    return profile.targetLevel;
  }

  return normalizeGoal(profile) === 'exam' ? 'A1' : 'A2';
};

export const createDefaultLearningPlan = (profile?: OnboardingProfile): LearningPlan => {
  const input: LearningPlanInput = {
    ...defaultPlanInput,
    userGoal: normalizeGoal(profile),
    startLevel: normalizeStartLevel(profile),
    targetLevel: normalizeTargetLevel(profile),
    dailyMinutes: normalizeDailyMinutes(profile?.dailyGoalMinutes),
    examDate: profile?.examDate,
    prioritySkill: profile?.prioritySkill ?? (normalizeGoal(profile) === 'exam' ? 'exam' : 'speaking'),
    studyStyle: profile?.studyStyle ?? (normalizeGoal(profile) === 'exam' ? 'exam_heavy' : 'balanced'),
  };

  return createLearningPlan(input);
};

export const defaultUserState: UserState = {
  hasOnboarded: false,
  xp: 0,
  todayXp: 0,
  streak: 0,
  completedLessons: [],
  lessonProgress: {},
  reviewCards: [],
  mistakes: [],
  chatMessages: [],
  examHistory: [],
  learningPlan: createDefaultLearningPlan(),
};

const isLearningPlanLike = (plan: unknown): plan is LearningPlan => {
  if (!plan || typeof plan !== 'object') {
    return false;
  }

  const candidate = plan as Partial<LearningPlan>;

  return Boolean(
    candidate.id &&
      candidate.titleTr &&
      candidate.userGoal &&
      candidate.startLevel &&
      candidate.targetLevel &&
      candidate.dailyMinutes &&
      candidate.selectedTrack &&
      candidate.currentLevel &&
      candidate.currentModuleId &&
      Array.isArray(candidate.weeklySchedule) &&
      Array.isArray(candidate.milestones) &&
      Array.isArray(candidate.recommendedNextActions),
  );
};

const migrateUserState = (state: UserState): UserState => {
  const profile = state.profile;
  const baseLearningPlan = isLearningPlanLike(state.learningPlan)
    ? state.learningPlan
    : createDefaultLearningPlan(profile);
  const placementResult = state.placementResult ?? baseLearningPlan.placementResult;
  const learningPlan = placementResult && !baseLearningPlan.placementResult
    ? { ...baseLearningPlan, placementResult }
    : baseLearningPlan;

  return {
    ...state,
    profile: profile
      ? {
          ...profile,
          goalId: profile.goalId ?? learningPlan.userGoal,
          startLevel: profile.startLevel ?? learningPlan.startLevel,
          targetLevel: profile.targetLevel ?? learningPlan.targetLevel,
          prioritySkill: profile.prioritySkill ?? 'speaking',
          studyStyle: profile.studyStyle ?? 'balanced',
          dailyGoalXp: profile.dailyGoalXp ?? getDailyGoalXp(normalizeDailyMinutes(profile.dailyGoalMinutes)),
          goal: profile.goal || getGoalLabel(learningPlan.userGoal),
        }
      : profile,
    learningPlan,
    placementResult,
  };
};

export const loadUserState = async (): Promise<UserState> => {
  const rawState = await AsyncStorage.getItem(STORAGE_KEYS.userState);

  if (!rawState) {
    return defaultUserState;
  }

  try {
    const parsedState = {
      ...defaultUserState,
      ...JSON.parse(rawState),
    };

    const reviewCards = Array.isArray(parsedState.reviewCards)
      ? parsedState.reviewCards.map(
          (card: UserState['reviewCards'][number]) => ({
            ...card,
            box: card.box ?? Math.min(4, card.repetitions ?? 0),
            right: card.right ?? 0,
            wrong: card.wrong ?? card.lapses ?? 0,
          }),
        )
      : [];

    return migrateUserState({
      ...parsedState,
      completedLessons: Array.isArray(parsedState.completedLessons) ? parsedState.completedLessons : [],
      lessonProgress: parsedState.lessonProgress && typeof parsedState.lessonProgress === 'object' ? parsedState.lessonProgress : {},
      mistakes: Array.isArray(parsedState.mistakes) ? parsedState.mistakes : [],
      chatMessages: Array.isArray(parsedState.chatMessages) ? parsedState.chatMessages : [],
      todayXp:
        parsedState.lastStudyDate === getLocalDateKey()
          ? parsedState.todayXp
          : 0,
      reviewCards,
      examHistory: Array.isArray(parsedState.examHistory) ? parsedState.examHistory : [],
    });
  } catch {
    return defaultUserState;
  }
};

export const saveUserState = async (state: UserState) => {
  await AsyncStorage.setItem(STORAGE_KEYS.userState, JSON.stringify(state));
};

export const updateUserState = async (
  updater: (state: UserState) => UserState,
): Promise<UserState> => {
  const currentState = await loadUserState();
  const nextState = updater(currentState);
  await saveUserState(nextState);
  return nextState;
};

export const markStudyActivity = (state: UserState): UserState => {
  const streakUpdate = updateStudyStreak(state.streak, state.lastStudyDate);

  return {
    ...state,
    todayXp:
      streakUpdate.lastStudyDate === state.lastStudyDate ? state.todayXp : 0,
    streak: streakUpdate.streak,
    lastStudyDate: streakUpdate.lastStudyDate,
  };
};

export const awardXpForStudy = (state: UserState, xpEarned: number): UserState => {
  const streakUpdate = updateStudyStreak(state.streak, state.lastStudyDate);
  const sameStudyDay = state.lastStudyDate === streakUpdate.lastStudyDate;

  return {
    ...state,
    xp: state.xp + xpEarned,
    todayXp: (sameStudyDay ? state.todayXp : 0) + xpEarned,
    streak: streakUpdate.streak,
    lastStudyDate: streakUpdate.lastStudyDate,
  };
};

export const resetUserState = async () => {
  await AsyncStorage.removeItem(STORAGE_KEYS.userState);
};

// TODO: Supabase auth will replace anonymous local-only identity.
// TODO: Supabase progress sync should mirror this local state after auth.
