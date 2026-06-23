export type LocalEventSeverity = 'info' | 'warning' | 'error';

export type LocalEventType =
  | 'app_opened'
  | 'app_boot_decision'
  | 'onboarding_started'
  | 'onboarding_step_viewed'
  | 'onboarding_option_selected'
  | 'onboarding_demo_card_tapped'
  | 'onboarding_plan_revealed'
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
  | 'lesson_completion_action_selected'
  | 'srs_opened'
  | 'srs_card_reviewed'
  | 'srs_completed'
  | 'mistakes_opened'
  | 'mistakes_item_reviewed'
  | 'curriculum_opened'
  | 'ai_chat_opened'
  | 'ai_chat_backend_fallback'
  | 'speaking_opened'
  | 'speaking_press_started'
  | 'speaking_press_released'
  | 'speaking_cancel_armed'
  | 'speaking_cancelled'
  | 'speaking_too_short'
  | 'speaking_no_voice_detected'
  | 'speech_analysis_started'
  | 'speech_analysis_completed'
  | 'speech_analysis_failed'
  | 'speech_transcription_started'
  | 'speech_transcription_completed'
  | 'speech_transcription_fallback'
  | 'speech_transcription_error'
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
  provider: string;
  modelUsed: string;
  fileSizeBucket: string;
  fallback: boolean;
  similarityBucket: 'high' | 'medium' | 'low';
  repairedPlan: boolean;
  hasCompletedOnboarding: boolean;
  hasOnboarded: boolean;
  hasProfile: boolean;
  hasLearningPlan: boolean;
  stepId: string;
  selectedOptionId: string;
  demoCardId: string;
  userGoal: string;
  selectedLevel: string;
  platform: string;
  audioExtension: string;
  audioMimeType: string;
  source: string;
  actionId: string;
  count: number;
  httpStatus: number;
  timeoutMs: number;
  errorKind: string;
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
