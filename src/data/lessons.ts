import { lessonsA0 } from './lessons.a0';
import { lessonsA1 } from './lessons.a1';
import type { CurriculumLevelId } from '../types/curriculum';
import type { LearningPlan, StartLevelId, TargetLevelId } from '../types/learningPlan';
import type { Lesson } from '../types/lesson';

export const playableLessons: Lesson[] = [...lessonsA0, ...lessonsA1];

export { lessonsA0, lessonsA1 };

export const playableLevelOrder: Array<'A0' | 'A1'> = ['A0', 'A1'];

export const getLessonById = (lessonId: string) =>
  playableLessons.find((lesson) => lesson.id === lessonId);

export const getPlayableLessonByModuleId = (moduleId: string) =>
  getLessonById(moduleId);

export const getLessonsForLevel = (levelId: CurriculumLevelId) =>
  playableLessons.filter((lesson) => lesson.cefr === levelId);

const normalizeStartLevel = (level?: StartLevelId): 'A0' | 'A1' => {
  if (level === 'zero' || level === 'A0') {
    return 'A0';
  }

  return 'A1';
};

const normalizeTargetLevel = (level?: TargetLevelId): 'A0' | 'A1' => {
  if (!level || level === 'A1') {
    return 'A1';
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

  return playableLessons.filter((lesson) => levels.includes(lesson.cefr));
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
