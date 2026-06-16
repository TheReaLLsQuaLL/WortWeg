export type CurriculumLevelId = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type SkillKey =
  | 'reading'
  | 'listening'
  | 'speaking'
  | 'writing'
  | 'grammar'
  | 'vocabulary'
  | 'pronunciation';

export type SkillGoals = Record<SkillKey, string>;
export type SkillWeights = Record<SkillKey, number>;

export type TrackId =
  | 'exam_a1'
  | 'exam_b1'
  | 'daily_life'
  | 'speaking_confidence'
  | 'work_german'
  | 'travel'
  | 'family_reunion'
  | 'university'
  | 'fast_track'
  | 'balanced';

export type Level = {
  id: CurriculumLevelId;
  titleTr: string;
  titleDe: string;
  descriptionTr: string;
  canDoTr: string[];
  estimatedWeeks: number;
  skillGoals: SkillGoals;
  examRelevance: string;
  isPlaceholder: boolean;
};

export type ModuleUnlockRequirements = {
  moduleIds?: string[];
  minCompletedModules?: number;
};

export type CurriculumModule = {
  id: string;
  level: CurriculumLevelId;
  order: number;
  titleTr: string;
  titleDe: string;
  goalTr: string;
  cefrCanDoTr: string;
  topics: string[];
  grammar: string[];
  vocabularyThemes: string[];
  pronunciationFocus: string[];
  speakingTasks: string[];
  listeningTasks: string[];
  readingTasks: string[];
  writingTasks: string[];
  examTasks: string[];
  turkishLearnerWarnings: string[];
  estimatedMinutes: number;
  unlockRequirements: ModuleUnlockRequirements;
  trackBoosts: Partial<Record<TrackId, number>>;
};

export type Track = {
  id: TrackId;
  titleTr: string;
  descriptionTr: string;
  recommendedLevels: CurriculumLevelId[];
  skillWeights: SkillWeights;
  weeklyPlanTemplate: string[];
  recommendedModuleTags: string[];
};
