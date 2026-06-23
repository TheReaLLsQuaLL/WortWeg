import type { ChatMessage } from './ai';
import type { Article } from './lesson';
import type { ExerciseAttempt } from './exercise';
import type { LearningPlan, PrioritySkillId, StartLevelId, StudyStyleId, TargetLevelId, UserGoalId } from './learningPlan';
import type { PlacementResult } from './placement';

export type OnboardingProfile = {
  name: string;
  goal: string;
  dailyGoalMinutes: number;
  dailyGoalXp?: number;
  level?: 'a0' | 'a1' | 'a2';
  reason?: string;
  goalId?: UserGoalId;
  startLevel?: StartLevelId;
  targetLevel?: TargetLevelId;
  examDate?: string;
  prioritySkill?: PrioritySkillId;
  studyStyle?: StudyStyleId;
};

export type ReviewCard = {
  id: string;
  wordId: string;
  lessonId: string;
  german: string;
  turkish: string;
  article?: Article;
  exampleDe?: string;
  exampleTr?: string;
  dueDate: string;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  lapses: number;
  box: number;
  right: number;
  wrong: number;
  lastReviewedAt?: string;
};

export type Mistake = {
  id: string;
  lessonId: string;
  exerciseId: string;
  prompt: string;
  userAnswer: string;
  expectedAnswer: string;
  feedbackTr: string;
  createdAt: string;
};

export type LessonProgress = {
  lessonId: string;
  completed: boolean;
  correctAnswers: number;
  totalAnswers: number;
  lastStudiedAt: string;
};

export type LessonCheckpoint = {
  lessonId: string;
  currentIndex: number;
  attempts: ExerciseAttempt[];
  timestamp: string;
};

export type SpeakingStatsLevelId = 'A0' | 'A1' | 'A2' | 'B1_PREVIEW' | 'OTHER';

export type SpeakingLevelStats = {
  attempts: number;
  successfulAttempts: number;
  bestScorePercent?: number;
  latestScorePercent?: number;
  lastPracticedAt?: string;
  practicedSentenceIds: string[];
};

export type SpeakingStats = {
  totalAttempts: number;
  successfulAttempts: number;
  bestScorePercent?: number;
  latestScorePercent?: number;
  lastPracticedAt?: string;
  practicedSentenceIds: string[];
  levelBreakdown: Partial<Record<SpeakingStatsLevelId, SpeakingLevelStats>>;
};

export type UserState = {
  hasOnboarded: boolean;
  hasCompletedOnboarding: boolean;
  onboardingCompletedAt?: string;
  profile?: OnboardingProfile;
  learningPlan?: LearningPlan;
  placementResult?: PlacementResult;
  xp: number;
  todayXp: number;
  streak: number;
  lastStudyDate?: string;
  completedLessons: string[];
  lessonProgress: Record<string, LessonProgress>;
  lessonCheckpoint?: LessonCheckpoint;
  reviewCards: ReviewCard[];
  mistakes: Mistake[];
  speakingStats: SpeakingStats;
  chatMessages: ChatMessage[];
  examBestScore?: number;
  examHistory: Array<{
    date: string;
    score: number;
    total: number;
    xpEarned: number;
    mode: 'a1-practice';
  }>;
};
