import type { Choice } from './exercise';
import type { CurriculumLevelId } from './curriculum';

export type PlacementSkill = 'grammar' | 'vocabulary' | 'reading' | 'wordOrder' | 'functional';
export type PlacementLevelSignal = 'A0' | 'A1' | 'A2' | 'B1';
export type PlacementConfidence = 'low' | 'medium' | 'high';

export type PlacementQuestion = {
  id: string;
  levelSignal: PlacementLevelSignal;
  skill: PlacementSkill;
  promptTr: string;
  promptDe?: string;
  choices: Choice[];
  correctChoiceId: string;
  explanationTr: string;
};

export type PlacementSkillBreakdownItem = {
  correct: number;
  total: number;
};

export type PlacementResult = {
  score: number;
  total: number;
  recommendedStartLevel: Extract<CurriculumLevelId, 'A0' | 'A1' | 'A2' | 'B1'>;
  confidence: PlacementConfidence;
  skillBreakdown: Record<PlacementSkill, PlacementSkillBreakdownItem>;
  explanationTr: string;
};
