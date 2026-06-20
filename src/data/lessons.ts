import { lessonsA0 } from './lessons.a0';
import { lessonsA1 } from './lessons.a1';
import { lessonsA2 } from './lessons.a2';
import { lessonsB1Preview } from './lessons.b1Preview';
import type { CurriculumLevelId } from '../types/curriculum';
import type { LearningPlan, StartLevelId, TargetLevelId } from '../types/learningPlan';
import type { Lesson } from '../types/lesson';

type MainPathLevel = 'A0' | 'A1' | 'A2';
type MainPathLesson = Lesson & { cefr: MainPathLevel };

const mainPathLessons: MainPathLesson[] = [...lessonsA0, ...lessonsA1, ...lessonsA2] as MainPathLesson[];

export const playableLessons: Lesson[] = [...mainPathLessons, ...lessonsB1Preview];

export {
  B1_PREVIEW_LESSON_ID,
  B1_PREVIEW_LESSON_2_ID,
  B1_PREVIEW_LESSON_3_ID,
  B1_PREVIEW_LESSON_4_ID,
  B1_PREVIEW_LESSON_5_ID,
  B1_PREVIEW_LESSON_6_ID,
  B1_PREVIEW_LESSON_7_ID,
  B1_PREVIEW_LESSON_IDS,
  isB1PreviewLessonId,
  lessonsB1Preview,
} from './lessons.b1Preview';
export { lessonsA0, lessonsA1, lessonsA2 };

export const playableLevelOrder: MainPathLevel[] = ['A0', 'A1', 'A2'];

export const getLessonById = (lessonId: string) =>
  playableLessons.find((lesson) => lesson.id === lessonId);

export const getPlayableLessonByModuleId = (moduleId: string) =>
  mainPathLessons.find((lesson) => lesson.id === moduleId);

export const getB1PreviewLessons = () => lessonsB1Preview;

export const getLessonsForLevel = (levelId: CurriculumLevelId) =>
  playableLessons.filter((lesson) => lesson.cefr === levelId);

const normalizeStartLevel = (level?: StartLevelId): MainPathLevel => {
  if (level === 'zero' || level === 'A0') {
    return 'A0';
  }

  if (level === 'A2' || level === 'B1') {
    return 'A2';
  }

  return 'A1';
};

const normalizeTargetLevel = (level?: TargetLevelId): MainPathLevel => {
  if (level === 'A2' || level === 'B1' || level === 'B2') {
    return 'A2';
  }

  return 'A1';
};

export const getPlayableLessonsForPlan = (plan?: LearningPlan) => {
  if (!plan) {
    return lessonsA1;
  }

  const startLevel = normalizeStartLevel(plan.startLevel);
  const targetLevel = normalizeTargetLevel(plan.targetLevel);
  const startIndex = playableLevelOrder.indexOf(startLevel);
  const targetIndex = Math.max(startIndex, playableLevelOrder.indexOf(targetLevel));
  const levels = playableLevelOrder.slice(startIndex, targetIndex + 1);

  return mainPathLessons.filter((lesson) => levels.includes(lesson.cefr));
};

export const getNextPlayableLesson = (
  completedLessonIds: string[],
  plan?: LearningPlan,
) => {
  const lessons = getPlayableLessonsForPlan(plan);

  return lessons.find((lesson, index) => {
    if (completedLessonIds.includes(lesson.id)) {
      return false;
    }

    const previousLessonId = lessons[index - 1]?.id;

    return index === 0 || completedLessonIds.includes(previousLessonId ?? '');
  });
};

export const isLessonUnlocked = (
  lessonId: string,
  completedLessonIds: string[],
  plan?: LearningPlan,
) => {
  const lessons = getPlayableLessonsForPlan(plan);
  const index = lessons.findIndex((lesson) => lesson.id === lessonId);

  if (index < 0) {
    return false;
  }

  if (index === 0 || completedLessonIds.includes(lessonId)) {
    return true;
  }

  return completedLessonIds.includes(lessons[index - 1]?.id ?? '');
};
