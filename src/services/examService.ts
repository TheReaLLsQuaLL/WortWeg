import { examA1Questions, type ExamQuestion } from '../data/exam.a1';
import { getChoiceText } from '../lib/choiceUtils';
import { scoreChoiceQuestion } from '../lib/scoring';
import type { AnswerResult } from '../types/exercise';
import { generateExamFeedback, gradeSpeaking, gradeWriting } from './aiTeacher';
import { scorePronunciation, transcribeGerman } from './speechService';

export type ExamSubmission =
  | { question: ExamQuestion; answer: string }
  | { question: ExamQuestion; audioUri: string };

export const getExamPracticeQuestions = () => examA1Questions;

export const submitExamAnswer = async (
  submission: ExamSubmission,
): Promise<AnswerResult> => {
  const { question } = submission;

  if (question.section === 'reading' || question.section === 'listening') {
    const answer = 'answer' in submission ? submission.answer : '';
    const displayAnswer = getChoiceText(question.choices, answer) ?? answer;
    const baseResult = scoreChoiceQuestion(question, answer);
    const aiFeedback = await generateExamFeedback({
      prompt: `${question.promptTr}\n${question.text ?? ''}\n${question.questionTr}`,
      userAnswer: displayAnswer,
      correctAnswer: baseResult.expected,
      examSection: question.section,
      cefrLevel: question.cefrLevel,
      wasCorrect: baseResult.correct,
    });

    return {
      ...baseResult,
      feedback: `${baseResult.feedback} ${aiFeedback.text} ${aiFeedback.suggestions.join(' ')}`.trim(),
    };
  }

  if (question.section === 'writing') {
    const answer = 'answer' in submission ? submission.answer : '';
    const grade = await gradeWriting({
      prompt: question.promptTr,
      answer,
      cefrLevel: question.cefrLevel,
    });

    return {
      correct: grade.score >= Math.ceil(grade.maxScore * 0.6),
      expected: question.sampleAnswer ?? '',
      feedback: `${grade.score}/${grade.maxScore}. ${grade.feedbackTr}`,
      xpEarned: grade.score >= Math.ceil(grade.maxScore * 0.6) ? question.xp : 0,
    };
  }

  const audioUri = 'audioUri' in submission ? submission.audioUri : '';
  const transcription = await transcribeGerman(audioUri);
  const pronunciation = await scorePronunciation(
    audioUri,
    question.expectedText ?? '',
  );
  const speakingGrade = await gradeSpeaking({
    expectedText: question.expectedText ?? '',
    transcript: transcription.transcript,
    cefrLevel: question.cefrLevel,
  });

  const passed = pronunciation.pronunciationScore >= 60;

  return {
    correct: passed,
    expected: question.expectedText ?? '',
    feedback: `${pronunciation.pronunciationScore}/100. ${pronunciation.feedbackTr} ${speakingGrade.feedbackTr}`,
    xpEarned: passed ? question.xp : 0,
  };
};
