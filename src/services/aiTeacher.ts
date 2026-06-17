import { examA1Questions, type ExamQuestion } from '../data/exam.a1';
import type {
  ExamFeedbackInput,
  GenerateExamQuestionInput,
  SpeakingGrade,
  SpeakingGradeInput,
  TeacherInput,
  TeacherReply,
  WritingGrade,
  WritingGradeInput,
} from '../types/ai';
import { estimateWritingScore } from '../lib/scoring';
import { trackLocalEvent } from './localEventLog';

type AiBackendMode =
  | 'chat'
  | 'exam_feedback'
  | 'writing_feedback'
  | 'speaking_feedback'
  | 'exercise_explanation'
  | 'mistake_summary'
  | 'grammar_tip'
  | 'vocab_explanation';

type AiBackendResponse = {
  de: string;
  tr: string;
  tip: string;
  score: number;
  mistakes: Array<{
    type:
      | 'grammar'
      | 'vocabulary'
      | 'article'
      | 'word_order'
      | 'pronunciation'
      | 'other';
    original: string;
    correction: string;
    explanationTr: string;
  }>;
  nextPrompt?: string;
  cefr: 'A1' | 'A2' | 'B1';
  modelUsed: string;
};

type AiBackendFallbackReason = {
  mode: AiBackendMode;
  reason:
    | 'missing-backend-url'
    | 'fetch-failed'
    | 'http-error'
    | 'invalid-response'
    | 'timeout';
  backendUrl?: string;
  endpoint?: string;
  status?: number;
  errorMessage?: string;
  timeoutMs?: number;
  responseTimeMs?: number;
};

type AiBackendRequestResult = {
  response: AiBackendResponse | null;
  fallbackReason?: AiBackendFallbackReason;
};

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const isDevelopment = process.env.NODE_ENV !== 'production';
const DEFAULT_AI_TIMEOUT_MS = 30_000;

const getAiTimeoutMs = () => {
  const rawTimeout = process.env.EXPO_PUBLIC_AI_TIMEOUT_MS?.trim();
  const parsedTimeout = rawTimeout ? Number(rawTimeout) : DEFAULT_AI_TIMEOUT_MS;

  return Number.isFinite(parsedTimeout) && parsedTimeout > 0
    ? parsedTimeout
    : DEFAULT_AI_TIMEOUT_MS;
};

const logAiDebug = (
  message: string,
  details?: Record<string, string | number | boolean | undefined>,
) => {
  if (!isDevelopment) {
    return;
  }

  console.log('[WortWeg AI]', message, details ?? {});
};

const getAiBackendUrl = () =>
  process.env.EXPO_PUBLIC_AI_BACKEND_URL?.trim() || '';

const isAiBackendResponse = (value: unknown): value is AiBackendResponse => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const response = value as Partial<AiBackendResponse>;
  return (
    typeof response.de === 'string' &&
    typeof response.tr === 'string' &&
    typeof response.tip === 'string' &&
    typeof response.score === 'number' &&
    Array.isArray(response.mistakes) &&
    typeof response.modelUsed === 'string'
  );
};

const formatFallbackDebug = (reason?: AiBackendFallbackReason) => {
  if (!isDevelopment || !reason) {
    return '';
  }

  return [
    'Dev debug: Mock AI fallback kullanıldı.',
    `Sebep: ${reason.reason}.`,
    `Mode: ${reason.mode}.`,
    reason.endpoint
      ? `Endpoint: ${reason.endpoint}.`
      : reason.backendUrl
        ? `Backend URL: ${reason.backendUrl}.`
        : 'Backend URL eksik.',
    typeof reason.status === 'number' ? `HTTP status: ${reason.status}.` : '',
    typeof reason.timeoutMs === 'number' ? `Timeout: ${reason.timeoutMs}ms.` : '',
    typeof reason.responseTimeMs === 'number'
      ? `Yanıt süresi: ${reason.responseTimeMs}ms.`
      : '',
    reason.errorMessage ? `Hata: ${reason.errorMessage}.` : '',
  ]
    .filter(Boolean)
    .join(' ');
};

const withTeacherReplyDebug = (
  reply: TeacherReply,
  reason?: AiBackendFallbackReason,
): TeacherReply => {
  const debug = formatFallbackDebug(reason);

  if (!debug) {
    return reply;
  }

  return {
    ...reply,
    suggestions: [...reply.suggestions, debug],
  };
};

const withTextDebug = (text: string, reason?: AiBackendFallbackReason) => {
  const debug = formatFallbackDebug(reason);

  return debug ? `${text}\n\n${debug}` : text;
};

const requestAiTeacher = async (
  mode: AiBackendMode,
  input: {
    level?: 'A1' | 'A2' | 'B1';
    userMessage: string;
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
    context?: Record<string, string | undefined>;
  },
): Promise<AiBackendRequestResult> => {
  const baseUrl = getAiBackendUrl();
  const timeoutMs = getAiTimeoutMs();

  if (!baseUrl) {
    const fallbackReason: AiBackendFallbackReason = {
      mode,
      reason: 'missing-backend-url',
      timeoutMs,
    };
    logAiDebug('Fallback/mock used', fallbackReason);
    return { response: null, fallbackReason };
  }

  const endpoint = `${baseUrl.replace(/\/$/, '')}/ai/teacher`;
  const controller = new AbortController();
  const startTime = Date.now();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  logAiDebug('Calling backend', { backendUrl: baseUrl, endpoint, mode, timeoutMs });

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        mode,
        level: input.level ?? 'A1',
        userMessage: input.userMessage,
        targetLanguage: 'German',
        nativeLanguage: 'Turkish',
        conversationHistory: input.conversationHistory ?? [],
        context: input.context ?? {},
      }),
    });

    const responseTimeMs = Date.now() - startTime;

    logAiDebug('Backend HTTP status', {
      endpoint,
      mode,
      status: response.status,
      timeoutMs,
      responseTimeMs,
    });

    if (!response.ok) {
      const fallbackReason: AiBackendFallbackReason = {
        mode,
        reason: 'http-error',
        backendUrl: baseUrl,
        endpoint,
        status: response.status,
        timeoutMs,
        responseTimeMs,
      };
      logAiDebug('Fallback/mock used', fallbackReason);
      return { response: null, fallbackReason };
    }

    const json = (await response.json()) as unknown;

    if (!isAiBackendResponse(json)) {
      const fallbackReason: AiBackendFallbackReason = {
        mode,
        reason: 'invalid-response',
        backendUrl: baseUrl,
        endpoint,
        status: response.status,
        timeoutMs,
        responseTimeMs,
      };
      logAiDebug('Fallback/mock used', fallbackReason);
      return { response: null, fallbackReason };
    }

    logAiDebug('Backend response accepted', {
      endpoint,
      mode,
      modelUsed: json.modelUsed,
      timeoutMs,
      responseTimeMs,
    });

    return { response: json };
  } catch (error) {
    const responseTimeMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isTimeout =
      timedOut || (error instanceof Error && error.name === 'AbortError');
    const fallbackReason: AiBackendFallbackReason = {
      mode,
      reason: isTimeout ? 'timeout' : 'fetch-failed',
      backendUrl: baseUrl,
      endpoint,
      errorMessage,
      timeoutMs,
      responseTimeMs,
    };

    logAiDebug(isTimeout ? 'Request timed out' : 'Fetch error', fallbackReason);
    logAiDebug('Fallback/mock used', fallbackReason);
    return { response: null, fallbackReason };
  } finally {
    clearTimeout(timeout);
  }
};

const mockTeacherReply = (message: string): TeacherReply => ({
  text: `Şu an canlı AI bağlantısı yerine yerel Wolli yanıtı kullanılıyor. A1 seviyesinde kısa cümlelerle ilerleyelim: "${message}" ifadesinden sonra "Ich lerne Deutsch." gibi net bir cümle kurabilirsin.`,
  corrections:
    message.trim().length > 0
      ? ['Cümleni Almanca yazarsan kelime sırası ve artikel için geri bildirim verebilirim.']
      : ['Bir Almanca cümle yaz: Ich heiße ...'],
  suggestions: [
    'Kendini tanıtmak için: Ich heiße ...',
    'Nereden geldiğini söylemek için: Ich komme aus der Türkei.',
  ],
});

export const generateTeacherReply = async (
  input: TeacherInput,
): Promise<TeacherReply> => {
  const { response: backendReply, fallbackReason } = await requestAiTeacher('chat', {
    level: input.cefrLevel,
    userMessage: input.message,
    conversationHistory: input.recentMessages?.map((message) => ({
      role: message.role === 'teacher' ? 'assistant' : 'user',
      content: message.text,
    })),
  });

  if (backendReply) {
    return {
      text: [backendReply.de, backendReply.tr].filter(Boolean).join('\n'),
      corrections: backendReply.mistakes.map(
        (mistake) => `${mistake.correction}: ${mistake.explanationTr}`,
      ),
      suggestions: [backendReply.tip, backendReply.nextPrompt].filter(
        (item): item is string => Boolean(item),
      ),
    };
  }

  if (fallbackReason) {
    trackLocalEvent({
      type: 'ai_chat_backend_fallback',
      screen: 'Chat',
      metadata: { fallbackReason: fallbackReason.reason },
      severity: fallbackReason.reason === 'missing-backend-url' ? 'warning' : 'error',
    });
  }

  await wait(350);
  return withTeacherReplyDebug(mockTeacherReply(input.message), fallbackReason);
};

export const gradeWriting = async (
  input: WritingGradeInput,
): Promise<WritingGrade> => {
  const maxScore = 15;
  const { response: backendReply, fallbackReason } = await requestAiTeacher('writing_feedback', {
    level: input.cefrLevel,
    userMessage: input.answer,
    context: {
      topic: input.prompt,
      expectedAnswer: input.prompt,
    },
  });

  if (backendReply) {
    return {
      score: Math.min(maxScore, Math.max(0, Math.round(backendReply.score))),
      maxScore,
      feedbackTr: `${backendReply.tr} ${backendReply.tip}`.trim(),
      corrections: backendReply.mistakes.map(
        (mistake) => `${mistake.original} -> ${mistake.correction}: ${mistake.explanationTr}`,
      ),
    };
  }

  await wait(300);
  const score = estimateWritingScore(input.answer, maxScore);
  const feedbackTr =
    score >= 11
      ? 'A1 için anlaşılır ve yeterli bir cevap. Kısa cümleleri koru.'
      : 'Cevap anlaşılmaya başlıyor. Ad, ülke, şehir ve öğrenme cümlesini ayrı ayrı yaz.';

  return {
    score,
    maxScore,
    feedbackTr: withTextDebug(feedbackTr, fallbackReason),
    corrections: [
      'Örnek: Ich heiße ...',
      'Örnek: Ich komme aus der Türkei.',
      'Örnek: Ich lerne Deutsch.',
    ],
  };
};

export const gradeSpeaking = async (
  input: SpeakingGradeInput,
): Promise<SpeakingGrade> => {
  const { response: backendReply, fallbackReason } = await requestAiTeacher('speaking_feedback', {
    level: input.cefrLevel,
    userMessage: input.transcript,
    context: {
      expectedAnswer: input.expectedText,
      transcript: input.transcript,
    },
  });
  const maxScore = 15;

  if (backendReply) {
    return {
      score: Math.min(maxScore, Math.max(0, Math.round(backendReply.score))),
      maxScore,
      feedbackTr: `${backendReply.tr} ${backendReply.tip}`.trim(),
      pronunciationTips: backendReply.mistakes.length
        ? backendReply.mistakes.map((mistake) => mistake.explanationTr)
        : [backendReply.tip],
    };
  }

  await wait(300);
  const expectedWords = input.expectedText.toLocaleLowerCase('de-DE').split(/\s+/);
  const transcript = input.transcript.toLocaleLowerCase('de-DE');
  const matchedWords = expectedWords.filter((word) => transcript.includes(word)).length;
  const score = Math.max(1, Math.round((matchedWords / expectedWords.length) * maxScore));

  return {
    score,
    maxScore,
    feedbackTr: withTextDebug(
      'Bu şu an mock konuşma değerlendirmesi. Gerçek sürümde ses kaydı ve telaffuz puanı backend üzerinden gelir.',
      fallbackReason,
    ),
    pronunciationTips: [
      'Ich kelimesindeki ch sesini yumuşak söyle.',
      'Deutsch kelimesinde eu sesi Türkçedeki "oy" sesine yakındır.',
    ],
  };
};

export const generateExamFeedback = async (
  input: ExamFeedbackInput,
): Promise<TeacherReply> => {
  const { response: backendReply, fallbackReason } = await requestAiTeacher('exam_feedback', {
    level: input.cefrLevel,
    userMessage: input.userAnswer,
    context: {
      topic: input.prompt,
      correctAnswer: input.correctAnswer,
      expectedAnswer: input.correctAnswer,
      examSection: input.examSection,
    },
  });

  if (backendReply) {
    return {
      text: backendReply.tr,
      corrections: backendReply.mistakes.map(
        (mistake) => `${mistake.correction}: ${mistake.explanationTr}`,
      ),
      suggestions: [backendReply.tip],
    };
  }

  await wait(250);
  return withTeacherReplyDebug(
    {
      text: input.wasCorrect
        ? 'Doğru. Cevabın A1 sınav pratiği için uygun.'
        : `Doğru cevap: ${input.correctAnswer}.`,
      corrections: [],
      suggestions: ['Sorudaki anahtar kelimeyi bulup cevabı onunla eşleştir.'],
    },
    fallbackReason,
  );
};

export const generateExamQuestion = async (
  input: GenerateExamQuestionInput,
): Promise<ExamQuestion> => {
  await wait(250);

  // TODO: Gemini API backend function should generate original A1 exam-style items here.
  const question =
    examA1Questions.find((item) => item.section === input.section) ??
    examA1Questions[0];

  if (!question) {
    throw new Error('No mock exam question is available.');
  }

  return question;
};
