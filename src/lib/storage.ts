import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '../data/constants';
import { createLearningPlan, getDailyGoalXp, getGoalLabel } from '../services/planService';
import type { DailyMinutes, LearningPlan, LearningPlanInput, StartLevelId, TargetLevelId, UserGoalId } from '../types/learningPlan';
import { trackLocalEvent } from '../services/localEventLog';
import type { OnboardingProfile, UserState } from '../types/userState';
import { getLocalDateKey, updateStudyStreak } from './date';
import { defaultSpeakingStats, normalizeSpeakingStats } from './speakingStats';

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
  hasCompletedOnboarding: false,
  xp: 0,
  todayXp: 0,
  streak: 0,
  completedLessons: [],
  lessonProgress: {},
  reviewCards: [],
  mistakes: [],
  speakingStats: defaultSpeakingStats,
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

export const getHasCompletedOnboarding = (state: UserState): boolean =>
  Boolean(state.hasCompletedOnboarding || state.hasOnboarded || state.profile);

export const shouldShowOnboarding = (state: UserState): boolean =>
  !getHasCompletedOnboarding(state);

type RepairResult = {
  state: UserState;
  wasRepaired: boolean;
  reasons: string[];
};

export type StorageRepairInfo = {
  wasRepaired: boolean;
  reasons: string[];
  repairedPlan: boolean;
  repairedProfile: boolean;
  repairedOnboardingFlag: boolean;
};

let lastStorageRepairInfo: StorageRepairInfo = {
  wasRepaired: false,
  reasons: [],
  repairedPlan: false,
  repairedProfile: false,
  repairedOnboardingFlag: false,
};

const setLastStorageRepairInfo = (reasons: string[]) => {
  lastStorageRepairInfo = {
    wasRepaired: reasons.length > 0,
    reasons,
    repairedPlan: reasons.includes('invalid_learning_plan') || reasons.includes('missing_learning_plan'),
    repairedProfile: reasons.includes('profile_repaired'),
    repairedOnboardingFlag: reasons.includes('completion_flag_repaired') || reasons.includes('legacy_onboarding_flag_repaired'),
  };
};

export const getLastStorageRepairInfo = (): StorageRepairInfo => lastStorageRepairInfo;

const getProfileLevelFromPlan = (level?: StartLevelId): OnboardingProfile['level'] => {
  if (level === 'A2' || level === 'B1') {
    return 'a2';
  }

  if (level === 'A1' || level === 'some') {
    return 'a1';
  }

  return 'a0';
};

export const repairUserStateIfNeeded = (state: UserState): RepairResult => {
  const reasons: string[] = [];
  const inferredCompleted = getHasCompletedOnboarding(state);
  const profile = state.profile;
  const hadInvalidPlan = Boolean(state.learningPlan) && !isLearningPlanLike(state.learningPlan);
  const needsPlanRepair = inferredCompleted && !isLearningPlanLike(state.learningPlan);

  if (hadInvalidPlan) {
    reasons.push('invalid_learning_plan');
    trackLocalEvent({
      type: 'storage_migration_error',
      screen: 'Storage',
      action: 'learning_plan_defaulted',
      severity: 'warning',
    });
  }

  if (needsPlanRepair) {
    if (!state.learningPlan) {
      reasons.push('missing_learning_plan');
    }
    trackLocalEvent({
      type: 'plan_repaired',
      screen: 'Storage',
      action: 'default_plan_created',
      severity: 'warning',
    });
  }

  const baseLearningPlan = isLearningPlanLike(state.learningPlan)
    ? state.learningPlan
    : createDefaultLearningPlan(profile);
  const placementResult = state.placementResult ?? baseLearningPlan.placementResult;
  const learningPlan = placementResult && !baseLearningPlan.placementResult
    ? { ...baseLearningPlan, placementResult }
    : baseLearningPlan;

  if (state.hasCompletedOnboarding !== inferredCompleted) {
    reasons.push('completion_flag_repaired');
  }

  if (state.hasOnboarded !== inferredCompleted) {
    reasons.push('legacy_onboarding_flag_repaired');
  }

  if (inferredCompleted && !state.onboardingCompletedAt) {
    reasons.push('completion_timestamp_repaired');
  }

  const normalizedProfile: OnboardingProfile | undefined = profile
    ? {
        ...profile,
        goalId: profile.goalId ?? learningPlan.userGoal,
        startLevel: profile.startLevel ?? learningPlan.startLevel,
        targetLevel: profile.targetLevel ?? learningPlan.targetLevel,
        prioritySkill: profile.prioritySkill ?? 'speaking',
        studyStyle: profile.studyStyle ?? 'balanced',
        dailyGoalMinutes: normalizeDailyMinutes(profile.dailyGoalMinutes),
        dailyGoalXp: profile.dailyGoalXp ?? getDailyGoalXp(normalizeDailyMinutes(profile.dailyGoalMinutes)),
        goal: profile.goal || getGoalLabel(learningPlan.userGoal),
      }
    : inferredCompleted
      ? {
          name: 'WortWeg öğrencisi',
          goal: getGoalLabel(learningPlan.userGoal),
          goalId: learningPlan.userGoal,
          dailyGoalMinutes: learningPlan.dailyMinutes,
          dailyGoalXp: getDailyGoalXp(learningPlan.dailyMinutes),
          level: getProfileLevelFromPlan(learningPlan.startLevel),
          reason: getGoalLabel(learningPlan.userGoal),
          startLevel: learningPlan.startLevel,
          targetLevel: learningPlan.targetLevel,
          examDate: learningPlan.examDate,
          prioritySkill: 'speaking',
          studyStyle: 'balanced',
        }
      : profile;

  if (inferredCompleted && !profile) {
    reasons.push('profile_repaired');
  }

  const nextState: UserState = {
    ...state,
    hasOnboarded: inferredCompleted,
    hasCompletedOnboarding: inferredCompleted,
    onboardingCompletedAt: inferredCompleted
      ? state.onboardingCompletedAt ?? new Date().toISOString()
      : undefined,
    profile: normalizedProfile,
    learningPlan,
    placementResult,
  };

  return {
    state: nextState,
    wasRepaired: reasons.length > 0,
    reasons,
  };
};

export const loadUserState = async (): Promise<UserState> => {
  const rawState = await AsyncStorage.getItem(STORAGE_KEYS.userState);

  if (!rawState) {
    setLastStorageRepairInfo([]);
    return defaultUserState;
  }

  try {
    const rawParsedState = JSON.parse(rawState) as Partial<UserState>;
    const parsedState = {
      ...defaultUserState,
      ...rawParsedState,
      learningPlan: rawParsedState.learningPlan,
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

    const normalizedState: UserState = {
      ...parsedState,
      hasOnboarded: Boolean(parsedState.hasOnboarded),
      hasCompletedOnboarding: Boolean(parsedState.hasCompletedOnboarding),
      completedLessons: Array.isArray(parsedState.completedLessons) ? parsedState.completedLessons : [],
      lessonProgress: parsedState.lessonProgress && typeof parsedState.lessonProgress === 'object' ? parsedState.lessonProgress : {},
      mistakes: Array.isArray(parsedState.mistakes) ? parsedState.mistakes : [],
      speakingStats: normalizeSpeakingStats(parsedState.speakingStats),
      chatMessages: Array.isArray(parsedState.chatMessages) ? parsedState.chatMessages : [],
      todayXp:
        parsedState.lastStudyDate === getLocalDateKey()
          ? parsedState.todayXp
          : 0,
      reviewCards,
      examHistory: Array.isArray(parsedState.examHistory) ? parsedState.examHistory : [],
    };
    const repaired = repairUserStateIfNeeded(normalizedState);
    setLastStorageRepairInfo(repaired.reasons);

    if (repaired.wasRepaired) {
      await AsyncStorage.setItem(STORAGE_KEYS.userState, JSON.stringify(repaired.state));
    }

    return repaired.state;
  } catch {
    setLastStorageRepairInfo(['parse_failed']);
    trackLocalEvent({
      type: 'boot_storage_error',
      screen: 'Storage',
      action: 'parse_failed',
      severity: 'error',
    });
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
