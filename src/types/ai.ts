import type { ExamQuestion } from '../data/exam.a1';

export type TeacherRole = 'user' | 'teacher';

export type ChatMessage = {
  id: string;
  role: TeacherRole;
  text: string;
  createdAt: string;
};

export type TeacherInput = {
  message: string;
  cefrLevel: 'A1' | 'A2' | 'B1';
  recentMessages?: ChatMessage[];
};

export type TeacherReply = {
  text: string;
  corrections: string[];
  suggestions: string[];
};

export type WritingGradeInput = {
  prompt: string;
  answer: string;
  cefrLevel: 'A1';
};

export type WritingGrade = {
  score: number;
  maxScore: number;
  feedbackTr: string;
  corrections: string[];
};

export type SpeakingGradeInput = {
  expectedText: string;
  transcript: string;
  cefrLevel: 'A1';
};

export type SpeakingGrade = {
  score: number;
  maxScore: number;
  feedbackTr: string;
  pronunciationTips: string[];
};

export type GenerateExamQuestionInput = {
  section: ExamQuestion['section'];
  cefrLevel: 'A1';
  topic?: string;
};

export type ExamFeedbackInput = {
  prompt: string;
  userAnswer: string;
  correctAnswer: string;
  examSection: string;
  cefrLevel: 'A1';
  wasCorrect: boolean;
};
