import { placementQuestions } from '../data/placementTest';
import { getShuffledChoices } from '../lib/choiceUtils';
import type { StartLevelId } from '../types/learningPlan';
import type {
  PlacementLevelSignal,
  PlacementQuestion,
  PlacementResult,
  PlacementSkill,
  PlacementSkillBreakdownItem,
} from '../types/placement';

const placementSkills: PlacementSkill[] = [
  'grammar',
  'vocabulary',
  'reading',
  'wordOrder',
  'functional',
];

const placementLevelOrder: PlacementLevelSignal[] = ['A0', 'A1', 'A2', 'B1'];
const privateAlphaMaxPlayableLevel: PlacementLevelSignal = 'A2';

export type PlacementAnswerMap = Record<string, string>;

export const getPlacementQuestions = (seed = 'placement-session'): PlacementQuestion[] =>
  placementQuestions.map((question) => {
    const shuffled = getShuffledChoices(question, seed);

    return {
      ...question,
      choices: shuffled.choices,
      correctChoiceId: shuffled.correctChoiceId ?? question.correctChoiceId,
    };
  });

const recommendLevelFromScore = (score: number): PlacementLevelSignal => {
  if (score <= 3) {
    return 'A0';
  }

  if (score <= 6) {
    return 'A1';
  }

  if (score <= 9) {
    return 'A2';
  }

  return 'B1';
};

const applyPrivateAlphaLevelGuard = (level: PlacementLevelSignal): PlacementLevelSignal =>
  level === 'B1' ? privateAlphaMaxPlayableLevel : level;

const normalizeSelfSelectedLevel = (level?: StartLevelId): PlacementLevelSignal => {
  if (level === 'B1') {
    return 'B1';
  }

  if (level === 'A2') {
    return 'A2';
  }

  if (level === 'A1' || level === 'some') {
    return 'A1';
  }

  return 'A0';
};

const levelDistance = (a: PlacementLevelSignal, b: PlacementLevelSignal) =>
  Math.abs(placementLevelOrder.indexOf(a) - placementLevelOrder.indexOf(b));

const createEmptyBreakdown = () =>
  placementSkills.reduce<Record<PlacementSkill, PlacementSkillBreakdownItem>>((acc, skill) => {
    acc[skill] = { correct: 0, total: 0 };
    return acc;
  }, {} as Record<PlacementSkill, PlacementSkillBreakdownItem>);

const getConfidence = (
  score: number,
  total: number,
  selfLevel: PlacementLevelSignal,
  recommendedLevel: PlacementLevelSignal,
): PlacementResult['confidence'] => {
  if (total < placementQuestions.length || levelDistance(selfLevel, recommendedLevel) >= 2) {
    return 'medium';
  }

  if (score === 3 || score === 6 || score === 9) {
    return 'medium';
  }

  return 'high';
};

const buildExplanation = (
  score: number,
  total: number,
  selfLevel: PlacementLevelSignal,
  recommendedLevel: PlacementLevelSignal,
  rawRecommendedLevel: PlacementLevelSignal,
) => {
  if (rawRecommendedLevel === 'B1' && recommendedLevel === 'A2') {
    return 'Sonuç ' + score + '/' + total + '. B1 seviyesine yakın görünüyorsun. B1 yakında; şimdilik A2 pekiştirme planıyla devam edelim.';
  }

  const selfIndex = placementLevelOrder.indexOf(selfLevel);
  const recommendedIndex = placementLevelOrder.indexOf(recommendedLevel);

  if (selfIndex - recommendedIndex >= 2) {
    return 'Sonuç ' + score + '/' + total + '. Temeli sağlam almak için ' + recommendedLevel + ' seviyesinden başlamak daha iyi olabilir. Eksik görünen noktaları hızlı tekrarlarla kapatacağız.';
  }

  if (recommendedIndex - selfIndex >= 1) {
    return 'Sonuç ' + score + '/' + total + '. Seçtiğin seviyeden daha hızlı ilerleyebilirsin; A1 tekrarını kısa tutup ' + recommendedLevel + ' hedeflerine geçebiliriz.';
  }

  return 'Sonuç ' + score + '/' + total + '. Seçtiğin başlangıç seviyesiyle uyumlu görünüyor. Plan temeli koruyup düzenli tekrar ekleyecek.';
};

export const scorePlacementTest = (
  answers: PlacementAnswerMap,
  questions: PlacementQuestion[] = placementQuestions,
  selfSelectedLevel?: StartLevelId,
): PlacementResult => {
  const skillBreakdown = createEmptyBreakdown();
  let score = 0;
  let answeredTotal = 0;

  questions.forEach((question) => {
    const selectedChoiceId = answers[question.id];
    const isCorrect = Boolean(selectedChoiceId) && selectedChoiceId === question.correctChoiceId;

    skillBreakdown[question.skill].total += 1;

    if (selectedChoiceId) {
      answeredTotal += 1;
    }

    if (isCorrect) {
      score += 1;
      skillBreakdown[question.skill].correct += 1;
    }
  });

  const rawRecommendedStartLevel = recommendLevelFromScore(score);
  const recommendedStartLevel = applyPrivateAlphaLevelGuard(rawRecommendedStartLevel);
  const selfLevel = normalizeSelfSelectedLevel(selfSelectedLevel);
  const total = questions.length;

  return {
    score,
    total,
    recommendedStartLevel,
    privateAlphaCappedFrom: rawRecommendedStartLevel === 'B1' ? 'B1' : undefined,
    confidence: getConfidence(score, answeredTotal, selfLevel, recommendedStartLevel),
    skillBreakdown,
    explanationTr: buildExplanation(score, total, selfLevel, recommendedStartLevel, rawRecommendedStartLevel),
  };
};

export const getPlacementLevelLabel = (level: PlacementLevelSignal) => {
  if (level === 'A0') {
    return 'A0 / Pre-A1';
  }

  return level;
};
