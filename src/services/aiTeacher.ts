import { examA1Questions, type ExamQuestion } from '../data/exam.a1';
import type {
  ExamFeedbackInput,
  GenerateExamQuestionInput,
  SpeakingGrade,
  SpeakingGradeInput,
  TeacherInput,
  TeacherReply,
  LessonContext,
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

const normalizeTeacherIntentText = (text: string) =>
  text.toLocaleLowerCase('tr-TR');

const includesAny = (text: string, patterns: string[]) =>
  patterns.some((pattern) => text.includes(pattern));

const isB1PreviewTopicMessage = (message: string) => {
  const text = normalizeTeacherIntentText(message);

  return includesAny(text, [
    'b1 ön',
    'ön izleme',
    'görüş',
    'fikir',
    'düşünce',
    'meiner meinung',
    'ich denke',
    'ich finde',
    'ich bin der meinung',
    'dass',
    'neden',
    'sonuç',
    'sebep',
    'weil',
    'deshalb',
    'deswegen',
    'darum',
    'aus diesem grund',
    'tavsiye',
    'öneri',
    'solltest',
    'würde',
    'wurde',
    'an deiner stelle',
    'es wäre besser',
    'es ware besser',
    'vielleicht könntest',
    'vielleicht konntest',
    'warum versuchst',
    'karşılaştır',
    'karsilastir',
    'tercih',
    'größer',
    'groesser',
    'kleiner',
    'besser als',
    'schlechter als',
    'genauso',
    'lieber',
    'am liebsten',
    'bevorzuge',
    'bevorzugen',
    'je mehr',
    'desto',
    'şikayet',
    'sikayet',
    'sorun',
    'problem',
    'beschwer',
    'leider',
    'könnten sie bitte',
    'koennten sie bitte',
    'rechnung',
    'bestellung',
    'funktioniert nicht',
    'dankbar',
    'ich wäre ihnen dankbar',
    'ich ware ihnen dankbar',
    'plan anlat',
    'gelecek niyet',
    'niyet',
    'vorhaben',
    'ich habe vor',
    'ich plane',
    'ich werde',
    'ich möchte',
    'ich moechte',
    'nächste woche',
    'naechste woche',
    'wenn ich zeit habe',
    'sobald',
    'fertig bin',
    'deneyim',
    'perfekt',
    'partizip',
    'schon einmal',
    'noch nie',
    'letztes jahr',
    'vor zwei wochen',
    'gestern habe',
    'erfahrung',
    'deutschkurs',
    'bewerbungsgespräch',
    'bewerbungsgespraech',
    'gefahren',
    'gegangen',
    'gemacht',
    'geführt',
    'gefuehrt',
    'dabei habe ich gelernt',
  ]);
};

const isB1OrB2ScopeRequest = (message: string) => {
  const text = normalizeTeacherIntentText(message);
  const asksUpperLevel = /\bb\s?[12]\b/.test(text) || includesAny(text, ['tam b1', 'tam b2', 'b1 yolu', 'b2 yolu']);
  const asksAvailability = includesAny(text, [
    'başla',
    'başlay',
    'aç',
    'açık',
    'var mı',
    'ne zaman',
    'ders',
    'yol',
    'modül',
    'tam',
    'kilit',
    'hazır',
  ]);

  return asksUpperLevel && asksAvailability;
};

const getTeacherRequestLevel = (input: TeacherInput): 'A1' | 'A2' | 'B1' => {
  if (isB1PreviewTopicMessage(input.message) || isB1OrB2ScopeRequest(input.message) || input.lessonContext?.level === 'B1') {
    return 'B1';
  }

  if (input.lessonContext?.level === 'A2') {
    return 'A2';
  }

  return input.cefrLevel;
};

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

const withTeacherReplyDebug = (
  reply: TeacherReply,
  reason?: AiBackendFallbackReason,
): TeacherReply => {
  if (reason) {
    logAiDebug('Reply uses local teacher copy', {
      mode: reason.mode,
      reason: reason.reason,
      status: reason.status,
      timeoutMs: reason.timeoutMs,
      responseTimeMs: reason.responseTimeMs,
    });
  }

  return reply;
};

const withTextDebug = (text: string, reason?: AiBackendFallbackReason) => {
  if (reason) {
    logAiDebug('Text feedback uses local copy', {
      mode: reason.mode,
      reason: reason.reason,
      status: reason.status,
      timeoutMs: reason.timeoutMs,
      responseTimeMs: reason.responseTimeMs,
    });
  }

  return text;
};

const requestAiTeacher = async (
  mode: AiBackendMode,
  input: {
    level?: 'A1' | 'A2' | 'B1';
    userMessage: string;
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
    context?: {
      lessonId?: string;
      topic?: string;
      expectedAnswer?: string;
      transcript?: string;
      examSection?: string;
      word?: string;
      article?: string;
      correctAnswer?: string;
      lessonContext?: LessonContext;
    };
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
    logAiDebug('Local response used', fallbackReason);
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
      logAiDebug('Local response used', fallbackReason);
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
      logAiDebug('Local response used', fallbackReason);
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
    logAiDebug('Local response used', fallbackReason);
    return { response: null, fallbackReason };
  } finally {
    clearTimeout(timeout);
  }
};

const lessonContextSummary = (lessonContext: LessonContext) => {
  const grammar = lessonContext.grammarLabels.slice(0, 2).join(', ');
  const vocabulary = lessonContext.vocabularyHeadwords.slice(0, 3).join(', ');
  const parts = [
    lessonContext.title,
    grammar ? 'odak: ' + grammar : '',
    vocabulary ? 'kelimeler: ' + vocabulary : '',
  ].filter(Boolean);

  return parts.join(' · ');
};

const localTeacherReply = (message: string, lessonContext?: LessonContext): TeacherReply => {
  const text = normalizeTeacherIntentText(message);
  const asksB1Scope = isB1OrB2ScopeRequest(message);
  const asksB1Preview = isB1PreviewTopicMessage(message);
  const asksCauseEffect = includesAny(text, ['neden', 'sonuç', 'sebep', 'weil', 'deshalb', 'deswegen', 'darum', 'aus diesem grund']);
  const asksOpinion = includesAny(text, ['görüş', 'fikir', 'düşünce', 'meiner meinung', 'ich denke', 'ich finde', 'ich bin der meinung', 'dass']);
  const asksAdvice = includesAny(text, ['tavsiye', 'öneri', 'solltest', 'würde', 'wurde', 'an deiner stelle', 'es wäre besser', 'es ware besser', 'vielleicht könntest', 'vielleicht konntest', 'warum versuchst']);
  const asksComparison = includesAny(text, ['karşılaştır', 'karsilastir', 'tercih', 'größer', 'groesser', 'kleiner', 'besser als', 'schlechter als', 'genauso', 'lieber', 'am liebsten', 'bevorzuge', 'bevorzugen', 'je mehr', 'desto']);
  const asksComplaint = includesAny(text, ['şikayet', 'sikayet', 'sorun', 'problem', 'beschwer', 'leider', 'könnten sie bitte', 'koennten sie bitte', 'rechnung', 'bestellung', 'funktioniert nicht', 'dankbar', 'ich wäre ihnen dankbar', 'ich ware ihnen dankbar']);
  const asksFuturePlan = includesAny(text, ['plan anlat', 'gelecek niyet', 'niyet', 'vorhaben', 'ich habe vor', 'ich plane', 'ich werde', 'ich möchte', 'ich moechte', 'nächste woche', 'naechste woche', 'wenn ich zeit habe', 'sobald', 'fertig bin']);
  const asksExperience = includesAny(text, ['deneyim', 'perfekt', 'partizip', 'schon einmal', 'noch nie', 'letztes jahr', 'vor zwei wochen', 'gestern habe', 'erfahrung', 'deutschkurs', 'bewerbungsgespräch', 'bewerbungsgespraech', 'gefahren', 'gegangen', 'gemacht', 'geführt', 'gefuehrt', 'dabei habe ich gelernt']);
  const asksEmailMessage = includesAny(text, ['e-posta', 'eposta', 'email', 'mesaj', 'nachricht', 'anmeldung', 'sehr geehrte', 'lieber', 'liebe', 'vielen dank für', 'vielen dank fuer', 'ich schreibe ihnen', 'könnten sie mir bitte', 'koennten sie mir bitte', 'ich freue mich auf ihre antwort', 'viele grüße', 'viele gruesse', 'mit freundlichen grüßen', 'mit freundlichen gruessen']);
  const asksLessonPractice = Boolean(lessonContext) && includesAny(text, ['bu ders', 'bu konu', '3 kelime', 'üç kelime', 'ornek cumle', 'örnek cümle', 'mini pratik', 'kısa konuşma', 'a2’ye bağla', 'a2ye bağla', 'a2’ye bagla', 'a2ye bagla']);

  if (asksLessonPractice && lessonContext) {
    const summary = lessonContextSummary(lessonContext);
    const firstWord = lessonContext.vocabularyHeadwords[0] ?? 'Deutsch';
    const secondWord = lessonContext.vocabularyHeadwords[1] ?? 'der Satz';
    const b1Note = lessonContext.isB1Preview
      ? ' Bu kısa bir B1 Ön İzleme; tam B1 yolu yakında. Ana plan için A2 pekiştirmeye devam edebilirsin.'
      : '';

    return {
      text: 'Wolli şu anda çevrimdışı. ' + summary + ' üzerinden kısa pratik yapabiliriz.' + b1Note,
      corrections: [
        'Kelime 1: ' + firstWord,
        'Kelime 2: ' + secondWord,
      ],
      suggestions: [
        lessonContext.isB1Preview
          ? 'A2 bağlantısı: önce kısa cümle kur, sonra B1 bağlacını veya kalıbı ekle.'
          : 'Mini pratik: Bu kelimelerle bir kısa Almanca cümle yaz.',
      ],
    };
  }

  if (asksB1Scope && !asksB1Preview) {
    return {
      text: 'Wolli şu anda çevrimdışı. Tam B1 yolu yakında. İstersen kısa B1 Ön İzleme konularına bakabiliriz; ana plan için A2 pekiştirmeye devam edelim.',
      corrections: [],
      suggestions: [
        'B1 Ön İzleme: görüş bildirme',
        'B1 Ön İzleme: neden-sonuç anlatma',
        'B1 Ön İzleme: tavsiye ve öneri verme',
        'B1 Ön İzleme: karşılaştırma ve tercih bildirme',
        'B1 Ön İzleme: şikayet ve sorun bildirme',
        'B1 Ön İzleme: plan anlatma ve gelecek niyetleri',
        'B1 Ön İzleme: deneyim anlatma ve Perfekt tekrarı',
        'B1 Ön İzleme: kısa e-posta ve mesaj yazma',
      ],
    };
  }

  if (asksB1Preview && !asksEmailMessage && !asksExperience && !asksFuturePlan && !asksComplaint && !asksComparison && !asksAdvice && !asksCauseEffect && !asksOpinion) {
    return {
      text: 'Wolli şu anda çevrimdışı. B1 Ön İzleme kısa ve isteğe bağlıdır; tam B1 yolu yakında. Şu an sekiz konu var.',
      corrections: [],
      suggestions: [
        'Görüş bildirme: Ich denke, dass...',
        'Neden-sonuç: weil, deshalb, deswegen',
        'Tavsiye: Du solltest..., Ich würde...',
        'Karşılaştırma: leichter als..., genauso ... wie, lieber',
        'Şikayet: Leider..., Könnten Sie bitte...?',
        'Plan: Ich habe vor..., Ich plane...',
        'Deneyim: Ich habe schon einmal..., Ich habe noch nie...',
        'E-posta: Sehr geehrte/r..., Könnten Sie mir bitte...?',
      ],
    };
  }

  if (asksEmailMessage) {
    return {
      text: 'Wolli şu anda çevrimdışı. B1 Ön İzleme içinde kısa e-posta yazarken resmi hitap için Sehr geehrte/r, samimi mesaj için Liebe/r kullanırsın. weil cümlesinde fiil sona gider; Könnten Sie mir bitte ...? kibar bir istektir.',
      corrections: [
        'resmi: Sehr geehrte Frau Müller,',
        'sebep: Ich schreibe Ihnen, weil ich eine Frage zu meiner Anmeldung habe.',
        'istek: Könnten Sie mir bitte die Informationen schicken?',
      ],
      suggestions: ['Kısa kapanış: Ich freue mich auf Ihre Antwort. Mit freundlichen Grüßen'],
    };
  }

  if (asksExperience) {
    return {
      text: 'Wolli şu anda çevrimdışı. B1 Ön İzleme içinde deneyim anlatırken çoğu fiilde haben + Partizip II, hareket fiillerinde sein kullanırsın. schon einmal “daha önce”, noch nie “hiç ... yapmadım” demektir.',
      corrections: [
        'haben: Ich habe letztes Jahr einen Deutschkurs gemacht.',
        'sein: Ich bin vor zwei Wochen nach Berlin gefahren.',
        'noch nie: Ich habe noch nie in Deutschland gearbeitet.',
      ],
      suggestions: ['Kısa pratik: Dabei habe ich gelernt, dass regelmäßige Übung wichtig ist.'],
    };
  }

  if (asksFuturePlan) {
    return {
      text: 'Wolli şu anda çevrimdışı. B1 Ön İzleme içinde gelecek planı anlatırken vorhaben ve planen niyeti, möchte isteği, werde ise gelecek niyetini anlatır. wenn/sobald cümlelerinde fiil sona gider.',
      corrections: [
        'vorhaben: Ich habe vor, jeden Tag Deutsch zu üben.',
        'planen: Ich plane, nächste Woche mehr zu sprechen.',
        'wenn/sobald: Wenn ich Zeit habe, mache ich eine kurze Übung.',
      ],
      suggestions: ['Kısa pratik: Sobald ich fertig bin, höre ich einen Dialog.'],
    };
  }

  if (asksComplaint) {
    return {
      text: 'Wolli şu anda çevrimdışı. B1 Ön İzleme içinde sorun bildirirken leider daha yumuşak, Könnten Sie bitte ...? daha kibar ve resmi bir istek yapar. dass/wenn cümlelerinde fiil sona gider.',
      corrections: [
        'leider: Leider funktioniert die App nicht richtig.',
        'istek: Könnten Sie bitte die Rechnung prüfen?',
        'dass/wenn: Das Problem ist, dass ich keine Antwort bekommen habe.',
      ],
      suggestions: ['Kısa pratik: Ich wäre Ihnen dankbar, wenn Sie mir helfen könnten.'],
    };
  }

  if (asksComparison) {
    return {
      text: 'Wolli şu anda çevrimdışı. B1 Ön İzleme içinde karşılaştırma için als farklılık, genauso ... wie eşitlik anlatır. Tercih için lieber, am liebsten ve ich bevorzuge kullanabilirsin.',
      corrections: [
        'als: Deutsch ist leichter als ich dachte.',
        'wie: Dieser Satz ist genauso wichtig wie der erste Satz.',
        'tercih: Ich lerne lieber am Morgen.',
      ],
      suggestions: ['Kısa pratik: Ich bevorzuge einfache Beispiele.'],
    };
  }

  if (asksAdvice) {
    return {
      text: 'Wolli şu anda çevrimdışı. B1 Ön İzleme içinde tavsiye verirken solltest daha doğrudan, würde ise daha yumuşak öneri yapar. wenn cümlesinde fiil sona gider.',
      corrections: [
        'solltest: Du solltest jeden Tag zehn Minuten Deutsch üben.',
        'würde: An deiner Stelle würde ich langsamer sprechen.',
        'wenn: Es wäre besser, wenn du die Sätze laut liest.',
      ],
      suggestions: ['Kısa pratik: Vielleicht könntest du morgen noch einmal üben.'],
    };
  }

  if (asksCauseEffect) {
    return {
      text: 'Wolli şu anda çevrimdışı. B1 Ön İzleme içinde neden-sonuç için kısa kural: weil cümlesinde fiil sona gider; deshalb, deswegen ve darum sonrasında fiil ikinci sıraya gelir.',
      corrections: [
        'weil: Ich lerne Deutsch, weil ich in Deutschland arbeiten möchte.',
        'deshalb: Ich bin müde, deshalb mache ich eine Pause.',
      ],
      suggestions: ['Kısa pratik: Ich habe keine Zeit, darum komme ich später.'],
    };
  }

  if (asksOpinion) {
    return {
      text: 'Wolli şu anda çevrimdışı. B1 Ön İzleme içinde görüş bildirirken kısa kalıplar kullan: Ich finde..., Meiner Meinung nach..., Ich denke, dass...',
      corrections: [
        'dass cümlesinde fiil sona gider: Ich denke, dass der Vorschlag gut ist.',
        'Meiner Meinung nach sonrası normal cümle sırası gelir: Meiner Meinung nach ist die Lösung einfach.',
      ],
      suggestions: ['Kısa pratik: Ich bin der Meinung, dass die Lösung gut ist.'],
    };
  }

  return {
    text: 'Wolli şu anda çevrimdışı. A0/A1/A2 ve kısa B1 Ön İzleme konularında basit pratik yapabiliriz.',
    corrections:
      message.trim().length > 0
        ? ['Cümleni Almanca yazarsan kelime sırası ve artikel için geri bildirim verebilirim.']
        : ['Bir Almanca cümle yaz: Ich heiße ...'],
    suggestions: [
      'Kendini tanıtmak için: Ich heiße ...',
      'B1 Ön İzleme için: Ich denke, dass der Vorschlag gut ist.',
      'B1 tavsiye için: Du solltest jeden Tag kurz üben.',
      'B1 tercih için: Ich lerne lieber am Morgen.',
      'B1 sorun için: Leider funktioniert die App nicht richtig.',
      'B1 plan için: Ich habe vor, jeden Tag Deutsch zu üben.',
      'B1 deneyim için: Ich habe schon einmal auf Deutsch gesprochen.',
      'B1 e-posta için: Könnten Sie mir bitte die Informationen schicken?',
    ],
  };
};

export const generateTeacherReply = async (
  input: TeacherInput,
): Promise<TeacherReply> => {
  const requestLevel = getTeacherRequestLevel(input);
  const { response: backendReply, fallbackReason } = await requestAiTeacher('chat', {
    level: requestLevel,
    userMessage: input.message,
    conversationHistory: input.recentMessages?.map((message) => ({
      role: message.role === 'teacher' ? 'assistant' : 'user',
      content: message.text,
    })),
    context: input.lessonContext
      ? {
          lessonId: input.lessonContext.lessonId,
          lessonContext: input.lessonContext,
        }
      : undefined,
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
  return withTeacherReplyDebug(localTeacherReply(input.message, input.lessonContext), fallbackReason);
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
      'Bu geri bildirim yazıya dökülen cümle üzerinden hazırlanır. Gerçek fonetik telaffuz puanı daha sonra eklenecek.',
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
    throw new Error('No local exam practice question is available.');
  }

  return question;
};
