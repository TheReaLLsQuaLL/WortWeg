export type LocalEventSeverity = 'info' | 'warning' | 'error';

export type LocalEventType =
  | 'app_opened'
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'placement_started'
  | 'placement_completed'
  | 'plan_created'
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
  | 'storage_migration_error';

export type LocalEventMetadata = Partial<{
  lessonId: string;
  level: string;
  moduleId: string;
  exerciseType: string;
  result: 'correct' | 'incorrect';
  durationMs: number;
  routeName: string;
  fallbackReason: string;
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
