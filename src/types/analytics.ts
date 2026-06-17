export type LocalEventSeverity = 'info' | 'warning' | 'error';

export type LocalEventType =
  | 'app_opened'
  | 'app_boot_decision'
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'onboarding_skipped_if_applicable'
  | 'placement_started'
  | 'placement_completed'
  | 'plan_created'
  | 'plan_repaired'
  | 'route_reset_to_home'
  | 'home_viewed'
  | 'lesson_started'
  | 'exercise_answered'
  | 'lesson_completed'
  | 'srs_opened'
  | 'srs_completed'
  | 'mistakes_opened'
  | 'curriculum_opened'
  | 'ai_chat_opened'
  | 'ai_chat_backend_fallback'
  | 'speaking_opened'
  | 'recording_started'
  | 'recording_stopped'
  | 'recording_error'
  | 'feedback_opened'
  | 'dev_reset_used'
  | 'navigation_error'
  | 'boot_storage_error'
  | 'storage_migration_error';

export type LocalEventMetadata = Partial<{
  lessonId: string;
  level: string;
  moduleId: string;
  exerciseType: string;
  result: 'correct' | 'incorrect';
  durationMs: number;
  routeName: string;
  routeChosen: string;
  fallbackReason: string;
  repairedPlan: boolean;
  hasCompletedOnboarding: boolean;
  hasOnboarded: boolean;
  hasProfile: boolean;
  hasLearningPlan: boolean;
}>;

export type LocalEvent = {
  id: string;
  timestamp: string;
  type: LocalEventType;
  screen?: string;
  action?: string;
  metadata?: LocalEventMetadata;
  appVersion?: string;
  sessionId: string;
  severity: LocalEventSeverity;
};

export type TrackLocalEventInput = {
  type: LocalEventType;
  screen?: string;
  action?: string;
  metadata?: LocalEventMetadata;
  severity?: LocalEventSeverity;
};
