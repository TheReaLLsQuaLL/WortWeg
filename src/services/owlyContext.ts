import type { UserState } from '../types/userState';

/**
 * Safely extracts relevant context for the AI coach without exposing raw PII, 
 * full chat histories, or unnecessary heavy data.
 */
export function buildOwlyContext(userState: UserState) {
  // Extract simple themes from recent mistakes rather than full text logs to save tokens
  const recentMistakePrompts = [...userState.mistakes]
    .slice(-5)
    .map((m) => m.prompt);

  return {
    level: userState.profile?.level || 'A1',
    targetLevel: userState.profile?.targetLevel || 'B1',
    completedLessons: userState.completedLessons.length,
    weakPoints: recentMistakePrompts,
    speakingStats: userState.speakingStats ? {
      totalAttempts: userState.speakingStats.totalAttempts,
      latestScorePercent: userState.speakingStats.latestScorePercent,
    } : null
  };
}
