import {
  AudioModule,
  RecordingPresets,
  createAudioPlayer,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  type AudioRecorder,
} from 'expo-audio';
import { Platform } from 'react-native';

import { compareTranscripts, type TranscriptComparison } from '../lib/transcriptCompare';
import { trackLocalEvent } from './localEventLog';

export type MicrophonePermissionResult = {
  granted: boolean;
  status: string;
  canAskAgain: boolean;
};

export type RecordingResult = {
  uri: string;
  durationMs: number;
};

export type TranscriptionResult = {
  transcript: string;
  language?: string;
  confidence: number;
  provider?: string;
  modelUsed?: string;
  fallback?: boolean;
  durationMs?: number;
  fallbackReason?: string;
};

export type WordPronunciationFeedback = {
  word: string;
  issue: string;
  suggestionTr: string;
};

export type PronunciationScore = {
  pronunciationScore: number;
  isMock: boolean;
  provider: 'mock';
  comparison: TranscriptComparison;
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  feedbackTr: string;
  wordFeedback: WordPronunciationFeedback[];
};

type RecorderStatusSnapshot = {
  isRecording: boolean;
  durationMs: number;
};

let activeRecorder: AudioRecorder | null = null;
let activeStopPromise: Promise<RecordingResult> | null = null;
let isStarting = false;

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const isDevelopment = process.env.NODE_ENV !== 'production';
const DEFAULT_SPEECH_TIMEOUT_MS = 45_000;

const getSpeechBackendUrl = () =>
  process.env.EXPO_PUBLIC_AI_BACKEND_URL?.trim() || '';

const getSpeechTimeoutMs = () => {
  const rawTimeout = process.env.EXPO_PUBLIC_SPEECH_TIMEOUT_MS?.trim();
  const parsedTimeout = rawTimeout ? Number(rawTimeout) : DEFAULT_SPEECH_TIMEOUT_MS;

  return Number.isFinite(parsedTimeout) && parsedTimeout > 0
    ? parsedTimeout
    : DEFAULT_SPEECH_TIMEOUT_MS;
};

const logSpeechDebug = (
  message: string,
  details?: Record<string, string | number | boolean | undefined>,
) => {
  if (!isDevelopment) {
    return;
  }

  console.log('[WortWeg Speech]', message, details ?? {});
};

const getAudioExtension = (audioUri: string) => {
  const cleanUri = audioUri.split('?')[0] ?? audioUri;
  const extension = cleanUri.split('.').pop()?.toLowerCase();

  if (!extension || extension.length > 5) {
    return 'm4a';
  }

  return extension;
};

const getAudioMimeType = (extension: string) => {
  switch (extension) {
    case 'mp3':
    case 'mpeg':
    case 'mpga':
      return 'audio/mpeg';
    case 'wav':
      return 'audio/wav';
    case 'webm':
      return 'audio/webm';
    case 'mp4':
      return 'audio/mp4';
    case 'm4a':
    default:
      return 'audio/m4a';
  }
};

const makeMockTranscription = (audioUri: string, fallbackReason?: string): TranscriptionResult => ({
  transcript: audioUri ? 'Ich heiße Toprak und ich wohne in Istanbul.' : '',
  language: 'de',
  confidence: audioUri ? 0.92 : 0,
  provider: 'mock',
  modelUsed: fallbackReason ? 'mock:' + fallbackReason : 'mock:local',
  fallback: true,
  durationMs: 0,
  fallbackReason,
});

type SpeechBackendResponse = {
  transcript: string;
  language?: string;
  confidence: number | null;
  provider: string;
  modelUsed: string;
  fallback: boolean;
  durationMs: number;
};

const isSpeechBackendResponse = (value: unknown): value is SpeechBackendResponse => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const response = value as SpeechBackendResponse;
  return (
    typeof response.transcript === 'string' &&
    (typeof response.confidence === 'number' || response.confidence === null) &&
    typeof response.provider === 'string' &&
    typeof response.modelUsed === 'string' &&
    typeof response.fallback === 'boolean' &&
    typeof response.durationMs === 'number'
  );
};

const getFallbackEventSeverity = (reason: string) =>
  reason === 'missing-backend-url' ? 'warning' : 'error';

const logAndroidAudio = (message: string, details?: Record<string, unknown>) => {
  if (Platform.OS !== 'android' || process.env.NODE_ENV === 'production') {
    return;
  }

  console.log('[WortWeg Audio]', message, details ?? {});
};

const setPlaybackMode = async () => {
  await setAudioModeAsync({
    allowsRecording: false,
    playsInSilentMode: true,
    interruptionMode: 'mixWithOthers',
    shouldPlayInBackground: false,
    shouldRouteThroughEarpiece: false,
  });
};

const setRecordingMode = async () => {
  await setAudioModeAsync({
    allowsRecording: true,
    playsInSilentMode: true,
    interruptionMode: 'doNotMix',
    shouldPlayInBackground: false,
    shouldRouteThroughEarpiece: false,
  });
};

const getRecorderLogId = (recorder: AudioRecorder | null) => {
  if (!recorder) {
    return 'none';
  }

  try {
    return recorder.id;
  } catch {
    return 'released';
  }
};

const releaseRecorder = (recorder: AudioRecorder | null) => {
  if (!recorder) {
    return;
  }

  const recorderId = getRecorderLogId(recorder);

  try {
    recorder.release();
    logAndroidAudio('recorder released', { id: recorderId });
  } catch (error) {
    logAndroidAudio('recorder release ignored', {
      id: recorderId,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
  }
};

const createRecorder = () => {
  const recorder = new AudioModule.AudioRecorder(RecordingPresets.HIGH_QUALITY);
  logAndroidAudio('recorder created', { id: getRecorderLogId(recorder) });
  return recorder;
};

export const requestMicrophonePermission = async (): Promise<MicrophonePermissionResult> => {
  const permission = await requestRecordingPermissionsAsync();

  logAndroidAudio('permission state', {
    status: permission.status,
    granted: permission.granted,
    canAskAgain: permission.canAskAgain,
  });

  return {
    granted: permission.granted,
    status: permission.status,
    canAskAgain: permission.canAskAgain,
  };
};

export const startRecording = async (): Promise<void> => {
  if (isStarting) {
    throw new Error('Kayıt zaten başlatılıyor.');
  }

  if (activeRecorder || activeStopPromise) {
    throw new Error('Devam eden bir kayıt işlemi var.');
  }

  isStarting = true;
  let recorder: AudioRecorder | null = null;

  try {
    await setRecordingMode();
    recorder = createRecorder();
    await recorder.prepareToRecordAsync();
    recorder.record();
    activeRecorder = recorder;
    logAndroidAudio('recording started', { id: getRecorderLogId(recorder) });
  } catch (error) {
    releaseRecorder(recorder);
    await setPlaybackMode().catch(() => undefined);
    logAndroidAudio('recording start error', {
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    throw error;
  } finally {
    isStarting = false;
  }
};

export const getActiveRecordingStatus = (): RecorderStatusSnapshot => {
  const recorder = activeRecorder;

  if (!recorder) {
    return { isRecording: false, durationMs: 0 };
  }

  try {
    const status = recorder.getStatus();
    return {
      isRecording: status.isRecording,
      durationMs: status.durationMillis,
    };
  } catch (error) {
    logAndroidAudio('status read error', {
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    return { isRecording: false, durationMs: 0 };
  }
};

export const stopRecording = async (): Promise<RecordingResult> => {
  if (activeStopPromise) {
    logAndroidAudio('stop already in progress');
    return activeStopPromise;
  }

  const recorder = activeRecorder;

  if (!recorder) {
    throw new Error('Durdurulacak aktif kayıt yok.');
  }

  activeStopPromise = (async () => {
    const recorderId = getRecorderLogId(recorder);

    activeRecorder = null;
    logAndroidAudio('stop requested', { id: recorderId });

    try {
      const statusBeforeStop = recorder.getStatus();
      const stopResult = (await recorder.stop()) as unknown as {
        durationMillis?: number;
        url?: string | null;
      };
      const uri = stopResult?.url ?? statusBeforeStop.url ?? '';
      const durationMs =
        stopResult?.durationMillis ?? statusBeforeStop.durationMillis ?? 0;

      if (!uri) {
        throw new Error('Recording finished but no audio file URI was returned.');
      }

      logAndroidAudio('stop completed', {
        id: recorderId,
        durationMs,
        audioUri: uri,
      });

      return { uri, durationMs };
    } catch (error) {
      logAndroidAudio('stop error', {
        id: recorderId,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      throw error;
    } finally {
      activeRecorder = null;
      releaseRecorder(recorder);
      activeStopPromise = null;
      await setPlaybackMode().catch((error) => {
        logAndroidAudio('playback mode restore error', {
          errorMessage: error instanceof Error ? error.message : String(error),
        });
      });
    }
  })();

  return activeStopPromise;
};

export const cleanupRecording = async (): Promise<void> => {
  logAndroidAudio('cleanup requested');

  if (activeStopPromise) {
    await activeStopPromise.catch(() => undefined);
    return;
  }

  const recorder = activeRecorder;
  const recorderId = getRecorderLogId(recorder);
  activeRecorder = null;

  if (!recorder) {
    await setPlaybackMode().catch(() => undefined);
    logAndroidAudio('cleanup completed', { hadRecorder: false });
    return;
  }

  try {
    if (recorder.isRecording) {
      await recorder.stop();
    }
  } catch (error) {
    logAndroidAudio('cleanup stop ignored', {
      id: recorderId,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
  } finally {
    releaseRecorder(recorder);
    await setPlaybackMode().catch(() => undefined);
    logAndroidAudio('cleanup completed', { hadRecorder: true });
  }
};

export const replayRecording = async (audioUri: string): Promise<void> => {
  if (!audioUri) {
    throw new Error('No audio recording is available to replay.');
  }

  try {
    await setPlaybackMode();
    const player = createAudioPlayer({ uri: audioUri });
    logAndroidAudio('replay started', { audioUri });
    player.play();

    setTimeout(() => {
      try {
        player.remove();
        logAndroidAudio('replay player removed');
      } catch (error) {
        logAndroidAudio('replay remove ignored', {
          errorMessage: error instanceof Error ? error.message : String(error),
        });
      }
    }, 30_000);
  } catch (error) {
    logAndroidAudio('replay error', {
      audioUri,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};

export const transcribeGerman = async (
  audioUri: string,
  expectedText?: string,
): Promise<TranscriptionResult> => {
  const backendUrl = getSpeechBackendUrl();
  const timeoutMs = getSpeechTimeoutMs();
  const startedAt = Date.now();

  if (!audioUri) {
    return makeMockTranscription('', 'missing-audio-uri');
  }

  if (!backendUrl) {
    trackLocalEvent({
      type: 'speech_transcription_fallback',
      screen: 'SpeakingPractice',
      metadata: { provider: 'mock', modelUsed: 'mock:missing-backend-url', fallback: true },
      severity: 'warning',
    });
    return makeMockTranscription(audioUri, 'missing-backend-url');
  }

  const endpoint = backendUrl.replace(/\/+$/, '') + '/speech/transcribe';
  const extension = getAudioExtension(audioUri);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  trackLocalEvent({
    type: 'speech_transcription_started',
    screen: 'SpeakingPractice',
    metadata: { provider: 'backend', fallback: false },
  });

  logSpeechDebug('upload started', { endpoint, timeoutMs });

  try {
    const formData = new FormData();
    formData.append('audio', {
      uri: audioUri,
      name: 'wortweg-speaking.' + extension,
      type: getAudioMimeType(extension),
    } as unknown as Blob);
    formData.append('language', 'de');

    if (expectedText?.trim()) {
      formData.append('expectedText', expectedText.trim());
      formData.append('prompt', expectedText.trim());
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    const responseTimeMs = Date.now() - startedAt;

    if (!response.ok) {
      throw new Error('http-' + response.status);
    }

    const body = (await response.json()) as unknown;

    if (!isSpeechBackendResponse(body)) {
      throw new Error('invalid-response');
    }

    const transcriptResult: TranscriptionResult = {
      transcript: body.transcript,
      language: body.language || 'de',
      confidence: typeof body.confidence === 'number' ? body.confidence : 0,
      provider: body.provider,
      modelUsed: body.modelUsed,
      fallback: body.fallback,
      durationMs: body.durationMs,
    };

    const comparisonForEvent = expectedText?.trim()
      ? compareTranscripts(expectedText, body.transcript)
      : undefined;

    trackLocalEvent({
      type: body.fallback ? 'speech_transcription_fallback' : 'speech_transcription_completed',
      screen: 'SpeakingPractice',
      metadata: {
        provider: body.provider,
        modelUsed: body.modelUsed,
        fallback: body.fallback,
        durationMs: responseTimeMs,
        similarityBucket: comparisonForEvent?.similarityBucket,
      },
      severity: body.fallback ? 'warning' : 'info',
    });

    logSpeechDebug('upload completed', {
      provider: body.provider,
      modelUsed: body.modelUsed,
      fallback: body.fallback,
      responseTimeMs,
      hasTranscript: Boolean(body.transcript),
      transcriptLength: body.transcript.length,
    });

    return transcriptResult;
  } catch (error) {
    const reason = error instanceof Error && error.name === 'AbortError'
      ? 'timeout'
      : error instanceof Error
        ? error.message
        : 'upload-failed';

    trackLocalEvent({
      type: 'speech_transcription_error',
      screen: 'SpeakingPractice',
      metadata: { provider: 'mock', modelUsed: 'mock:' + reason, fallback: true },
      severity: getFallbackEventSeverity(reason),
    });
    trackLocalEvent({
      type: 'speech_transcription_fallback',
      screen: 'SpeakingPractice',
      metadata: { provider: 'mock', modelUsed: 'mock:' + reason, fallback: true },
      severity: getFallbackEventSeverity(reason),
    });

    logSpeechDebug('upload fallback', { reason, timeoutMs });

    return makeMockTranscription(audioUri, reason);
  } finally {
    clearTimeout(timeout);
  }
};

export const scorePronunciation = async (
  audioUri: string,
  expectedText: string,
  transcript?: string,
): Promise<PronunciationScore> => {
  // TODO: pronunciation scoring should call Azure Pronunciation Assessment via backend.
  await wait(850);

  const comparison = compareTranscripts(expectedText, transcript ?? '');

  if (!audioUri || !expectedText) {
    return {
      pronunciationScore: 0,
      isMock: true,
      provider: 'mock',
      comparison,
      accuracyScore: 0,
      fluencyScore: 0,
      completenessScore: 0,
      feedbackTr: 'Ses kaydı veya hedef cümle bulunamadı.',
      wordFeedback: [],
    };
  }

  const hasMissingWords = comparison.missingWords.length > 0;
  const hasExtraWords = comparison.extraWords.length > 0;
  const isHighSimilarity = comparison.similarityScore >= 80;
  const isLowSimilarity = comparison.similarityScore < 50;
  const feedbackTr = isHighSimilarity
    ? 'Cümlen hedefe çok yakın. Şimdi daha akıcı söylemeyi dene.'
    : hasMissingWords
      ? 'Bazı kelimeler eksik duyuldu: ' + comparison.missingWords.slice(0, 4).join(', ') + '.'
      : hasExtraWords
        ? 'Ekstra kelimeler duyuldu: ' + comparison.extraWords.slice(0, 4).join(', ') + '.'
        : 'Cümle hedef cümleden farklı duyuldu. Yavaşça tekrar dene.';
  const pronunciationScore = isHighSimilarity
    ? 88
    : isLowSimilarity
      ? 58
      : 74;
  const wordFeedback: WordPronunciationFeedback[] = [];

  if (hasMissingWords) {
    wordFeedback.push({
      word: 'Eksik',
      issue: comparison.missingWords.slice(0, 4).join(', '),
      suggestionTr: 'Bu kelimeleri cümlede net söylemeye çalış.',
    });
  }

  if (hasExtraWords) {
    wordFeedback.push({
      word: 'Ekstra',
      issue: comparison.extraWords.slice(0, 4).join(', '),
      suggestionTr: 'Hedef cümleyi kısa ve aynı sırayla tekrar oku.',
    });
  }

  if (wordFeedback.length === 0) {
    wordFeedback.push({
      word: 'Akıcılık',
      issue: 'Bu bölüm gerçek telaffuz analizi değil, hedef-transcript karşılaştırmasına dayalı mock geri bildirimdir.',
      suggestionTr: 'Cümleyi bir kez daha daha doğal hızda söyle.',
    });
  }

  return {
    pronunciationScore,
    isMock: true,
    provider: 'mock',
    comparison,
    accuracyScore: Math.max(40, comparison.similarityScore),
    fluencyScore: isHighSimilarity ? 82 : 70,
    completenessScore: hasMissingWords ? Math.max(45, 100 - comparison.missingWords.length * 18) : 92,
    feedbackTr,
    wordFeedback,
  };
};
