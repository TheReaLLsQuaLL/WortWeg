import type { ExamQuestion } from '../data/exam.a1';
import type { AnswerResult } from '../types/exercise';
import { getChoiceText, normalizeChoices } from './choiceUtils';
import { normalizeAnswer } from './exerciseBuilder';

export const scoreChoiceQuestion = (
  question: ExamQuestion,
  answer: string,
): AnswerResult => {
  const normalizedChoices = normalizeChoices(question);
  const selectedChoiceText = getChoiceText(question.choices, answer);
  const expected = normalizedChoices.correctChoiceId
    ? getChoiceText(question.choices, normalizedChoices.correctChoiceId) ?? question.correctAnswer ?? ''
    : question.correctAnswer ?? '';
  const correct = selectedChoiceText
    ? answer === normalizedChoices.correctChoiceId
    : normalizeAnswer(answer) === normalizeAnswer(expected);

  return {
    correct,
    expected,
    feedback: correct
      ? `Doğru. ${question.explanationTr}`
      : `Doğru cevap: ${expected}. ${question.explanationTr}`,
    xpEarned: correct ? question.xp : 0,
  };
};

export const estimateWritingScore = (answer: string, maxScore = 15) => {
  const words = answer.trim().split(/\s+/).filter(Boolean);
  const hasGermanStarter =
    /\b(ich|mein|meine|komme|wohne|lerne|heiße|heisse)\b/i.test(answer);
  const score = Math.min(maxScore, (words.length >= 8 ? 8 : 4) + (hasGermanStarter ? 5 : 0));

  return Math.max(1, score);
};
