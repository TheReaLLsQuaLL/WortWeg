import {
  aiTeacherResponseSchema,
  type AiTeacherRequest,
  type AiTeacherResponse,
} from './schemas';
import { getCheapModel, getModelForMode } from './modelRouter';
import { buildSystemPrompt, buildUserPrompt } from './prompts';

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta';

const makeMockResponse = (
  request: AiTeacherRequest,
  modelUsed: string,
): AiTeacherResponse => {
  const context = request.context;
  const correction = context.correctAnswer ?? context.expectedAnswer ?? '';
  const isPronunciation = request.mode === 'speaking_feedback';
  const isVocab = request.mode === 'vocab_explanation';
  const isB1Preview = request.level === 'B1';

  return {
    de:
      correction ||
      (request.mode === 'chat'
        ? isB1Preview
          ? 'Ich denke, dass der Vorschlag gut ist.'
          : 'Ich lerne Deutsch.'
        : isVocab && context.word
          ? context.word
          : 'Das ist gut.'),
    tr:
      request.mode === 'chat'
        ? isB1Preview
          ? 'Wolli şu anda çevrimdışı. Tam B1 yolu yakında; kısa B1 Ön İzleme içinde görüş bildirme, neden-sonuç, tavsiye-öneri, karşılaştırma-tercih, şikayet-sorun, plan-gelecek ve deneyim-Perfekt cümleleriyle pratik yapabiliriz.'
          : 'Wolli şu anda çevrimdışı. A0/A1/A2 ve kısa B1 Ön İzleme konularında basit pratik yapabiliriz.'
        : 'Yerel geri bildirim: Cevabın A1 düzeyinde kısa ve anlaşılır şekilde değerlendirildi.',
    tip: isPronunciation
      ? 'Bu konuşma geri bildirimi yazıya dökülen cümlen ile hedef cümleyi karşılaştırır; gerçek fonetik ses puanı daha sonra eklenecek.'
      : isB1Preview
        ? 'B1 Ön İzleme sınırlıdır: dass/weil fiil sonu, deshalb/deswegen/darum fiil ikinci sıra; solltest/würde tavsiye, als/wie/lieber tercih-karşılaştırma, leider/Könnten Sie bitte sorun bildirme, vorhaben/planen/werden gelecek planı, haben/sein Perfekt ise deneyim anlatma için kullanılır.'
        : 'Artikel, fiil sırası ve kısa cümle doğruluğuna dikkat et.',
    score:
      request.mode === 'writing_feedback' || request.mode === 'speaking_feedback'
        ? 11
        : correction && request.userMessage.trim() === correction.trim()
          ? 100
          : 0,
    mistakes:
      correction && request.userMessage.trim() !== correction.trim()
        ? [
            {
              type: 'other',
              original: request.userMessage,
              correction,
              explanationTr: 'Beklenen cevapla birebir aynı değil. Anlam ve yapı kontrol edilmeli.',
            },
          ]
        : [],
    nextPrompt: request.mode === 'chat'
      ? isB1Preview
        ? 'Warum lernst du Deutsch?'
        : 'Wie geht es dir?'
      : undefined,
    cefr: request.level,
    modelUsed,
  };
};

export const extractJsonText = (text: string) => {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (fenceMatch?.[1]) {
    return fenceMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
};

export const parseGeminiJson = (
  text: string,
  request: AiTeacherRequest,
  modelUsed: string,
) => {
  const parsed = JSON.parse(extractJsonText(text)) as unknown;
  const parsedRecord = parsed as Record<string, unknown>;
  const response = aiTeacherResponseSchema.parse({
    ...parsedRecord,
    cefr: parsedRecord.cefr ?? request.level,
    modelUsed,
  });

  return response;
};

type GeminiApiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

type GeminiCallResult =
  | { ok: true; response: AiTeacherResponse }
  | { ok: false; reason: string; model: string };

const callGeminiModel = async (
  request: AiTeacherRequest,
  model: string,
  modelUsed: string,
  apiKey: string,
): Promise<GeminiCallResult> => {
  try {
    const response = await fetch(
      GEMINI_ENDPOINT +
        '/models/' +
        encodeURIComponent(model) +
        ':generateContent?key=' +
        encodeURIComponent(apiKey),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: buildSystemPrompt(request) }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: buildUserPrompt(request) }],
            },
          ],
          generationConfig: {
            temperature: request.mode === 'chat' ? 0.5 : 0.2,
            responseMimeType: 'application/json',
          },
        }),
      },
    );

    if (!response.ok) {
      return { ok: false, reason: 'gemini-http-' + response.status, model };
    }

    const body = (await response.json()) as GeminiApiResponse;
    const text = body.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? '')
      .join('')
      .trim();

    if (!text) {
      return { ok: false, reason: 'empty-gemini-response', model };
    }

    return { ok: true, response: parseGeminiJson(text, request, modelUsed) };
  } catch {
    return { ok: false, reason: 'parse-or-network-fallback', model };
  }
};

export const generateAiTeacherResponse = async (
  request: AiTeacherRequest,
): Promise<AiTeacherResponse> => {
  const model = getModelForMode(request.mode);
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    return makeMockResponse(request, 'mock:no-api-key:' + model);
  }

  const primaryResult = await callGeminiModel(request, model, model, apiKey);

  if (primaryResult.ok) {
    return primaryResult.response;
  }

  const cheapModel = getCheapModel();

  if (cheapModel !== model) {
    const fallbackResult = await callGeminiModel(
      request,
      cheapModel,
      cheapModel + ':fallback',
      apiKey,
    );

    if (fallbackResult.ok) {
      return fallbackResult.response;
    }

    return makeMockResponse(
      request,
      'mock:fallback-' + fallbackResult.reason + ':' + cheapModel,
    );
  }

  return makeMockResponse(
    request,
    'mock:' + primaryResult.reason + ':' + primaryResult.model,
  );
};

export const makeFallbackAiTeacherResponse = makeMockResponse;

// TODO: Move this server code to Supabase Edge Functions once auth and progress
// sync are introduced.
// TODO: Add future OpenAI/Deepgram transcription and Azure Pronunciation
// Assessment adapters behind server-side routes. Never expose those keys in app.
