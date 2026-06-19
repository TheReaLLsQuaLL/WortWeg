import {
  curriculumLevelOrder,
  curriculumModules,
  getModuleById,
  getModulesForLevel,
  getTrackById,
} from '../data/curriculum';
import { DAILY_GOALS } from '../data/constants';
import type { CurriculumLevelId, CurriculumModule, SkillKey, SkillWeights, TrackId } from '../types/curriculum';
import type {
  DailyMinutes,
  LearningPlan,
  LearningPlanInput,
  LearningProgressSnapshot,
  PlanMilestone,
  PrioritySkillId,
  RecommendedAction,
  StartLevelId,
  StudyStyleId,
  TargetLevelId,
  UserGoalId,
  WeeklyScheduleItem,
} from '../types/learningPlan';

const dayLabels = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const privateAlphaMaxPlayableStartLevel: StartLevelId = 'A2';

const goalLabels: Record<UserGoalId, string> = {
  exam: 'Sınav',
  daily_life: 'Günlük yaşam',
  work: 'İş/Kariyer',
  travel: 'Seyahat',
  family: 'Aile/Almanya’da yaşam',
  university: 'Üniversite/okul',
  curiosity: 'Sadece merak',
};

const priorityLabels: Record<PrioritySkillId, string> = {
  speaking: 'Konuşma',
  exam: 'Sınav',
  vocabulary: 'Kelime',
  grammar: 'Gramer',
  listening: 'Dinleme',
  writing: 'Yazma',
};

const styleLabels: Record<StudyStyleId, string> = {
  fast: 'hızlı plan',
  balanced: 'dengeli plan',
  review_heavy: 'tekrar ağırlıklı plan',
  speaking_heavy: 'konuşma ağırlıklı plan',
  exam_heavy: 'sınav ağırlıklı plan',
};

const skillFromPriority: Partial<Record<PrioritySkillId, SkillKey>> = {
  speaking: 'speaking',
  vocabulary: 'vocabulary',
  grammar: 'grammar',
  listening: 'listening',
  writing: 'writing',
};

const planTitlesByTrack: Record<TrackId, string> = {
  exam_a1: 'A1 Sınav Planı',
  exam_b1: 'B1 Sınav Modülü Planı',
  daily_life: 'Daily Life Starter Plan',
  speaking_confidence: 'Speaking Confidence Plan',
  work_german: 'Work German Plan',
  travel: 'Travel German Plan',
  family_reunion: 'Family/Reunion German Plan',
  university: 'University German Plan',
  fast_track: 'Fast Track A1-B1 Plan',
  balanced: 'Balanced CEFR Plan',
};

const normalizeStartLevel = (startLevel: StartLevelId): CurriculumLevelId => {
  if (startLevel === 'zero') {
    return 'A0';
  }

  if (startLevel === 'some') {
    return 'A1';
  }

  return startLevel;
};

const getPrivateAlphaPlayableStartLevel = (startLevel: StartLevelId): StartLevelId =>
  startLevel === 'B1' ? privateAlphaMaxPlayableStartLevel : startLevel;

const levelIndex = (levelId: CurriculumLevelId) => curriculumLevelOrder.indexOf(levelId);

const getLevelsInRange = (startLevel: CurriculumLevelId, targetLevel: TargetLevelId) => {
  const start = Math.max(0, levelIndex(startLevel));
  const target = Math.max(start, levelIndex(targetLevel));

  return curriculumLevelOrder.slice(start, target + 1).filter((level) => level !== 'C1' && level !== 'C2');
};

const clampWeights = (weights: SkillWeights): SkillWeights => {
  const next = { ...weights };

  (Object.keys(next) as SkillKey[]).forEach((key) => {
    next[key] = Math.max(0.5, Math.min(1.8, Number(next[key].toFixed(2))));
  });

  return next;
};

const daysUntil = (dateText?: string) => {
  if (!dateText) {
    return undefined;
  }

  const parsed = new Date(dateText);

  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  const now = new Date();
  const diff = parsed.getTime() - now.getTime();

  return Math.ceil(diff / (24 * 60 * 60 * 1000));
};

export const recommendTrack = (input: LearningPlanInput): TrackId => {
  if (input.studyStyle === 'fast') {
    return 'fast_track';
  }

  if (input.studyStyle === 'speaking_heavy' || input.prioritySkill === 'speaking') {
    return 'speaking_confidence';
  }

  if (input.studyStyle === 'exam_heavy' || input.userGoal === 'exam' || input.prioritySkill === 'exam') {
    return input.targetLevel === 'A1' || input.targetLevel === 'A2' ? 'exam_a1' : 'exam_b1';
  }

  if (input.userGoal === 'work') {
    return 'work_german';
  }

  if (input.userGoal === 'travel') {
    return 'travel';
  }

  if (input.userGoal === 'family') {
    return 'family_reunion';
  }

  if (input.userGoal === 'university') {
    return 'university';
  }

  if (input.userGoal === 'daily_life') {
    return 'daily_life';
  }

  return 'balanced';
};

export const getSkillWeightsForGoal = (goal: UserGoalId): SkillWeights => {
  const trackId = recommendTrack({
    userGoal: goal,
    startLevel: 'zero',
    targetLevel: goal === 'exam' ? 'A1' : 'B1',
    dailyMinutes: 10,
    prioritySkill: goal === 'exam' ? 'exam' : 'speaking',
    studyStyle: goal === 'exam' ? 'exam_heavy' : 'balanced',
  });

  return getTrackById(trackId).skillWeights;
};

const buildSkillWeights = (input: LearningPlanInput, trackId: TrackId): SkillWeights => {
  const weights = { ...getTrackById(trackId).skillWeights };
  const prioritySkill = skillFromPriority[input.prioritySkill];

  if (prioritySkill) {
    weights[prioritySkill] += 0.25;
  }

  if (input.prioritySkill === 'exam') {
    weights.reading += 0.15;
    weights.listening += 0.15;
    weights.writing += 0.15;
    weights.speaking += 0.15;
  }

  if (input.studyStyle === 'review_heavy') {
    weights.vocabulary += 0.2;
    weights.grammar += 0.15;
  }

  if (input.studyStyle === 'speaking_heavy') {
    weights.speaking += 0.25;
    weights.pronunciation += 0.25;
    weights.listening += 0.15;
  }

  if (input.studyStyle === 'exam_heavy') {
    weights.reading += 0.2;
    weights.listening += 0.2;
    weights.writing += 0.2;
    weights.speaking += 0.15;
  }

  const daysToExam = daysUntil(input.examDate);

  if (daysToExam !== undefined && daysToExam <= 45) {
    weights.reading += 0.2;
    weights.listening += 0.2;
    weights.writing += 0.2;
    weights.speaking += 0.2;
    weights.vocabulary += 0.1;
  }

  return clampWeights(weights);
};

export const estimateWeeklyProgress = (input: Pick<LearningPlanInput, 'dailyMinutes' | 'studyStyle' | 'examDate'>) => {
  const weeklyMinutes = input.dailyMinutes * 6;
  const intensity = input.studyStyle === 'fast' ? 1.25 : input.studyStyle === 'review_heavy' ? 0.85 : 1;
  const examPressure = (daysUntil(input.examDate) ?? 999) <= 45 ? 1.15 : 1;

  return {
    weeklyMinutes,
    estimatedModulesPerWeek: Math.max(0.25, Number(((weeklyMinutes / 120) * intensity * examPressure).toFixed(2))),
  };
};

const getCandidateModules = (input: LearningPlanInput, trackId: TrackId) => {
  const startLevel = normalizeStartLevel(input.startLevel);
  const levels = getLevelsInRange(startLevel, input.targetLevel);
  const track = getTrackById(trackId);

  return levels
    .flatMap(getModulesForLevel)
    .sort((a, b) => {
      const levelDelta = levelIndex(a.level) - levelIndex(b.level);

      if (levelDelta !== 0) {
        return levelDelta;
      }

      const boostDelta = (b.trackBoosts[track.id] ?? 0) - (a.trackBoosts[track.id] ?? 0);

      if (Math.abs(boostDelta) >= 3 && input.studyStyle === 'fast') {
        return boostDelta;
      }

      return a.order - b.order;
    });
};

const buildWeeklySchedule = (input: LearningPlanInput, trackId: TrackId): WeeklyScheduleItem[] => {
  const track = getTrackById(trackId);
  const closeExam = (daysUntil(input.examDate) ?? 999) <= 45;
  const baseActionsByMinutes: Record<DailyMinutes, string[]> = {
    5: ['1 mikro ders', '1 SRS tekrar'],
    10: ['1 kısa ders', '1 SRS tekrar', '1 konuşma promptu'],
    15: ['1 ders', '1 SRS tekrar', '1 dinleme veya konuşma görevi', '1 mini yazma'],
    20: ['1 ders', '1 SRS tekrar', '1 konuşma/dinleme', '1 yazma veya sınav tarzı pratik'],
  };

  return dayLabels.map((day, index) => {
    const actions = [...baseActionsByMinutes[input.dailyMinutes]];
    const templateHint = track.weeklyPlanTemplate[index % track.weeklyPlanTemplate.length];

    if (templateHint) {
      actions.push(templateHint);
    }

    if (closeExam && (index === 2 || index === 5)) {
      actions.push('Yakın sınav: ek mini tekrar veya sınav tarzı pratik');
    }

    if (input.studyStyle === 'review_heavy' && index % 2 === 0) {
      actions.push('Ek artikel/kelime tekrarı');
    }

    if (input.studyStyle === 'speaking_heavy') {
      actions.push('Sesli tekrar veya kısa konuşma kaydı');
    }

    return {
      day,
      focusTr: index === 6 ? 'Hafif tekrar ve kontrol' : templateHint ?? 'Dengeli çalışma',
      actions: actions.slice(0, input.dailyMinutes <= 5 ? 3 : 5),
      estimatedMinutes: input.dailyMinutes,
    };
  });
};

const buildMilestones = (modules: CurriculumModule[], weeklyProgress: ReturnType<typeof estimateWeeklyProgress>): PlanMilestone[] => {
  const milestones: PlanMilestone[] = [];
  const byLevel = modules.reduce<Record<string, CurriculumModule[]>>((acc, module) => {
    acc[module.level] = [...(acc[module.level] ?? []), module];
    return acc;
  }, {});

  Object.entries(byLevel).forEach(([level, levelModules]) => {
    const first = levelModules[0];
    const last = levelModules[levelModules.length - 1];

    if (!first || !last) {
      return;
    }

    milestones.push({
      id: 'milestone-' + level.toLowerCase(),
      titleTr: level + ' temel hedefleri',
      descriptionTr: first.titleTr + ' ile başlayıp ' + last.titleTr + ' modülüne kadar ana can-do hedeflerini tamamla.',
      targetLevel: level as CurriculumLevelId,
      moduleIds: levelModules.map((module) => module.id),
      estimatedWeek: Math.max(1, Math.ceil(levelModules.length / weeklyProgress.estimatedModulesPerWeek)),
    });
  });

  return milestones;
};

const actionForModule = (module: CurriculumModule, dailyMinutes: DailyMinutes): RecommendedAction => ({
  id: 'lesson-' + module.id,
  type: 'lesson',
  titleTr: module.titleTr,
  descriptionTr: module.goalTr,
  estimatedMinutes: Math.min(dailyMinutes, Math.max(5, Math.round(module.estimatedMinutes / 8))),
  targetId: module.id,
});

export const getNextModule = (
  plan: LearningPlan,
  progress: LearningProgressSnapshot = {},
): CurriculumModule | undefined => {
  const completed = new Set(progress.completedModuleIds ?? []);
  const startLevel = normalizeStartLevel(plan.startLevel);
  const levels = getLevelsInRange(startLevel, plan.targetLevel);
  const current = getModuleById(plan.currentModuleId);

  if (current && !completed.has(current.id)) {
    return current;
  }

  return levels
    .flatMap(getModulesForLevel)
    .find((module) => !completed.has(module.id));
};

export const getTodayRecommendedActions = (
  plan: LearningPlan,
  progress: LearningProgressSnapshot = {},
): RecommendedAction[] => {
  const nextModule = getNextModule(plan, progress);
  const dueReviewCount = progress.dueReviewCount ?? 0;
  const actions: RecommendedAction[] = [];

  if (nextModule) {
    actions.push(actionForModule(nextModule, plan.dailyMinutes));
  }

  actions.push({
    id: 'srs-review',
    type: 'srs',
    titleTr: dueReviewCount > 0 ? String(dueReviewCount) + ' kelime tekrarı' : 'Kelime ve artikel tekrarı',
    descriptionTr: 'der/die/das renkleri ve zor kelimeleri kısa turla pekiştir.',
    estimatedMinutes: plan.dailyMinutes === 5 ? 2 : 4,
  });

  if (plan.dailyMinutes >= 10 || plan.selectedTrack === 'speaking_confidence') {
    actions.push({
      id: 'speaking-prompt',
      type: 'speaking',
      titleTr: 'Günün konuşma cümlesi',
      descriptionTr: 'Kısa Almanca cümleyi dinle, kaydet ve hedef cümleyle karşılaştır.',
      estimatedMinutes: 3,
    });
  }

  if (plan.dailyMinutes >= 15) {
    actions.push({
      id: 'listening-writing-rotation',
      type: plan.skillWeights.listening >= plan.skillWeights.writing ? 'listening' : 'writing',
      titleTr: plan.skillWeights.listening >= plan.skillWeights.writing ? 'Mini dinleme odağı' : 'Mini yazma odağı',
      descriptionTr: 'Bugünkü modülden kısa bir beceri görevi ekle.',
      estimatedMinutes: 5,
    });
  }

  const examSoon = (daysUntil(plan.examDate) ?? 999) <= 45;
  const examRelevant = plan.selectedTrack === 'exam_a1' || plan.selectedTrack === 'exam_b1' || examSoon;

  if (examRelevant && plan.dailyMinutes >= 10) {
    actions.push({
      id: 'exam-style-practice',
      type: 'exam',
      titleTr: plan.selectedTrack === 'exam_b1' ? 'B1 sınav modülü' : 'A1 sınav tarzı pratik',
      descriptionTr: examSoon ? 'Sınav yakın: kısa beceri seti ve hata tekrarı yap.' : 'Okuma, dinleme, yazma veya konuşmadan bir mini set çöz.',
      estimatedMinutes: plan.dailyMinutes >= 20 ? 8 : 5,
    });
  }

  return actions.slice(0, plan.dailyMinutes === 5 ? 2 : plan.dailyMinutes === 10 ? 3 : 4);
};

export const estimateTargetDate = (plan: LearningPlan) => {
  const date = new Date(plan.createdAt);
  date.setDate(date.getDate() + plan.estimatedWeeks * 7);

  return date.toISOString().slice(0, 10);
};

export const adjustPlanAfterProgress = (
  plan: LearningPlan,
  progress: LearningProgressSnapshot = {},
): LearningPlan => {
  const nextModule = getNextModule(plan, progress);
  const now = new Date().toISOString();
  const basePlan = {
    ...plan,
    currentLevel: nextModule?.level ?? plan.currentLevel,
    currentModuleId: nextModule?.id ?? plan.currentModuleId,
    updatedAt: now,
  };

  return {
    ...basePlan,
    recommendedNextActions: getTodayRecommendedActions(basePlan, progress),
  };
};

export const createLearningPlan = (input: LearningPlanInput): LearningPlan => {
  const placementStartLevel = input.usePlacementRecommendation && input.placementResult
    ? input.placementResult.recommendedStartLevel
    : undefined;
  const selectedStartLevel = placementStartLevel ?? input.startLevel;
  const effectiveInput: LearningPlanInput = {
    ...input,
    startLevel: getPrivateAlphaPlayableStartLevel(selectedStartLevel),
    selfSelectedLevel: input.selfSelectedLevel ?? input.startLevel,
  };
  const trackId = recommendTrack(effectiveInput);
  const candidateModules = getCandidateModules(effectiveInput, trackId);
  const firstModule = candidateModules[0] ?? curriculumModules[0]!;
  const weeklyProgress = estimateWeeklyProgress(effectiveInput);
  const totalMinutes = candidateModules.reduce((sum, module) => sum + module.estimatedMinutes, 0);
  const estimatedWeeks = Math.max(
    1,
    Math.ceil(totalMinutes / Math.max(30, weeklyProgress.weeklyMinutes)),
  );
  const now = new Date().toISOString();
  const skillWeights = buildSkillWeights(effectiveInput, trackId);
  const planDraft: LearningPlan = {
    id: 'plan-' + now.replace(/[^0-9]/g, '').slice(0, 14),
    titleTr: planTitlesByTrack[trackId],
    userGoal: effectiveInput.userGoal,
    startLevel: effectiveInput.startLevel,
    selfSelectedLevel: effectiveInput.selfSelectedLevel,
    targetLevel: effectiveInput.targetLevel,
    dailyMinutes: effectiveInput.dailyMinutes,
    examDate: effectiveInput.examDate?.trim() || undefined,
    selectedTrack: trackId,
    placementResult: effectiveInput.placementResult,
    placementUsed: Boolean(input.usePlacementRecommendation && input.placementResult),
    weeklySchedule: buildWeeklySchedule(effectiveInput, trackId),
    currentLevel: firstModule.level,
    currentModuleId: firstModule.id,
    milestones: buildMilestones(candidateModules, weeklyProgress),
    recommendedNextActions: [],
    skillWeights,
    estimatedWeeks,
    createdAt: now,
    updatedAt: now,
  };

  return {
    ...planDraft,
    recommendedNextActions: getTodayRecommendedActions(planDraft),
  };
};

export const getGoalLabel = (goal: UserGoalId) => goalLabels[goal];
export const getPrioritySkillLabel = (skill: PrioritySkillId) => priorityLabels[skill];
export const getStudyStyleLabel = (style: StudyStyleId) => styleLabels[style];
export const getDailyGoalXp = (dailyMinutes: DailyMinutes) =>
  DAILY_GOALS.find((goal) => goal.minutes === dailyMinutes)?.xp ?? 20;
