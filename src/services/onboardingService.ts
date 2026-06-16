import { getDailyGoalXp, getGoalLabel } from './planService';
import type { LearningPlan, LearningPlanInput, StartLevelId } from '../types/learningPlan';
import type { PlacementResult } from '../types/placement';
import type { OnboardingProfile } from '../types/userState';

export type OnboardingCompletion = {
  profile: OnboardingProfile;
  learningPlan: LearningPlan;
  placementResult?: PlacementResult;
};

const getProfileLevel = (startLevel: StartLevelId): OnboardingProfile['level'] => {
  if (startLevel === 'A2' || startLevel === 'B1') {
    return 'a2';
  }

  if (startLevel === 'A1' || startLevel === 'some') {
    return 'a1';
  }

  return 'a0';
};

export const buildOnboardingCompletion = ({
  input,
  learningPlan,
  name,
  placementResult,
}: {
  input: LearningPlanInput;
  learningPlan: LearningPlan;
  name?: string;
  placementResult?: PlacementResult;
}): OnboardingCompletion => {
  const goalLabel = getGoalLabel(input.userGoal);
  const activeStartLevel = learningPlan.startLevel;

  return {
    profile: {
      name: name?.trim() || 'WortWeg öğrencisi',
      goal: goalLabel,
      goalId: input.userGoal,
      dailyGoalMinutes: input.dailyMinutes,
      dailyGoalXp: getDailyGoalXp(input.dailyMinutes),
      level: getProfileLevel(activeStartLevel),
      reason: goalLabel,
      startLevel: activeStartLevel,
      targetLevel: input.targetLevel,
      examDate: input.examDate?.trim() || undefined,
      prioritySkill: input.prioritySkill,
      studyStyle: input.studyStyle,
    },
    learningPlan,
    placementResult,
  };
};
