import type { CurriculumLevelId, SkillWeights, TrackId } from './curriculum';
import type { PlacementResult } from './placement';

export type UserGoalId =
  | 'exam'
  | 'daily_life'
  | 'work'
  | 'travel'
  | 'family'
  | 'university'
  | 'curiosity';

export type StartLevelId = 'zero' | 'some' | 'A0' | 'A1' | 'A2' | 'B1';
export type TargetLevelId = 'A1' | 'A2' | 'B1' | 'B2';
export type DailyMinutes = 5 | 10 | 15 | 20;

export type PrioritySkillId =
  | 'speaking'
  | 'exam'
  | 'vocabulary'
  | 'grammar'
  | 'listening'
  | 'writing';

export type StudyStyleId =
  | 'fast'
  | 'balanced'
  | 'review_heavy'
  | 'speaking_heavy'
  | 'exam_heavy';

export type LearningPlanInput = {
  userGoal: UserGoalId;
  startLevel: StartLevelId;
  selfSelectedLevel?: StartLevelId;
  targetLevel: TargetLevelId;
  dailyMinutes: DailyMinutes;
  examDate?: string;
  prioritySkill: PrioritySkillId;
  studyStyle: StudyStyleId;
  placementResult?: PlacementResult;
  usePlacementRecommendation?: boolean;
};

export type WeeklyScheduleItem = {
  day: string;
  focusTr: string;
  actions: string[];
  estimatedMinutes: number;
};

export type PlanMilestone = {
  id: string;
  titleTr: string;
  descriptionTr: string;
  targetLevel: CurriculumLevelId;
  moduleIds: string[];
  estimatedWeek: number;
};

export type RecommendedAction = {
  id: string;
  type: 'lesson' | 'srs' | 'speaking' | 'listening' | 'writing' | 'exam' | 'review';
  titleTr: string;
  descriptionTr: string;
  estimatedMinutes: number;
  targetId?: string;
};

export type LearningPlan = {
  id: string;
  titleTr: string;
  userGoal: UserGoalId;
  startLevel: StartLevelId;
  selfSelectedLevel?: StartLevelId;
  targetLevel: TargetLevelId;
  dailyMinutes: DailyMinutes;
  examDate?: string;
  selectedTrack: TrackId;
  placementResult?: PlacementResult;
  placementUsed?: boolean;
  weeklySchedule: WeeklyScheduleItem[];
  currentLevel: CurriculumLevelId;
  currentModuleId: string;
  milestones: PlanMilestone[];
  recommendedNextActions: RecommendedAction[];
  skillWeights: SkillWeights;
  estimatedWeeks: number;
  createdAt: string;
  updatedAt: string;
};

export type LearningProgressSnapshot = {
  completedModuleIds?: string[];
  completedLessonIds?: string[];
  dueReviewCount?: number;
  weakSkill?: PrioritySkillId;
};
