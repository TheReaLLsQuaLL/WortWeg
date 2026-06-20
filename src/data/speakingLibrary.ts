import { isB1PreviewLessonId, playableLessons } from './lessons';
import type { CEFRLevel } from '../types/lesson';

export type SpeakingLibrarySentence = {
  id: string;
  level: CEFRLevel;
  topicTitle: string;
  german: string;
  meaningTr: string;
  sourceLessonId: string;
  isB1Preview: boolean;
};

export const speakingLibrarySentences: SpeakingLibrarySentence[] = playableLessons
  .filter((lesson) => Boolean(lesson.speakingPrompt))
  .map((lesson) => ({
    id: 'speaking-library-' + lesson.id,
    level: lesson.cefr,
    topicTitle: lesson.speakingPrompt?.titleTr ?? lesson.title,
    german: lesson.speakingPrompt?.promptDe ?? '',
    meaningTr: lesson.speakingPrompt?.promptTr ?? '',
    sourceLessonId: lesson.id,
    isB1Preview: isB1PreviewLessonId(lesson.id),
  }));

export const speakingLibraryLevelOrder: Array<'A0' | 'A1' | 'A2' | 'B1_PREVIEW'> = [
  'A0',
  'A1',
  'A2',
  'B1_PREVIEW',
];

export const getSpeakingLibraryGroupLabel = (groupId: 'A0' | 'A1' | 'A2' | 'B1_PREVIEW') =>
  groupId === 'B1_PREVIEW' ? 'B1 Ön İzleme' : groupId;

export const getSpeakingLibraryGroupId = (sentence: SpeakingLibrarySentence) =>
  sentence.isB1Preview ? 'B1_PREVIEW' : sentence.level;
