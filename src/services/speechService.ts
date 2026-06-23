import {
  AudioModule,
  RecordingPresets,
  createAudioPlayer,
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  type AudioRecorder,
} from 'expo-audio';
import { Platform } from 'react-native';

import { inferAudioUploadInfo } from '../lib/audioUpload';
import { compareTranscripts, type TranscriptComparison } from '../lib/transcriptCompare';
import { analyzeRecordingVoiceEvidence, type RecordingVoiceEvidence } from '../lib/voiceGate';
import { buildBackendUrl, checkBackendHealth, getBackendConfig } from '../config/backend';
import { trackLocalEvent } from './localEventLog';

export { analyzeRecordingVoiceEvidence, type RecordingVoiceEvidence } from '../lib/voiceGate';

export type MicrophonePermissionResult = {
  granted: boolean;
  status: string;
  canAskAgain: boolean;
};

export type RecordingResult = {
  uri: string;
  durationMs: number;
  voiceEvidence?: RecordingVoiceEvidence;
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
  audioExtension?: string;
  audioMimeType?: string;
  backendReachable?: boolean;
  endpointHost?: string;
  httpStatus?: number;
  backendBaseUrl?: string;
  backendUrlSource?: string;
  backendErrorMessage?: string;
  pronunciationScore?: number;
  accuracyScore?: number;
  fluencyScore?: number;
  completenessScore?: number;
};

export type SpeechProvider = 'openai' | 'ios-native' | 'android-native' | 'mlkit' | 'gemma';

export type NativeSpeechCapability = {
  available: boolean;
  provider: SpeechProvider | null;
  platform: string;
  reason: string;
  requiresDevBuild: boolean;
};

export const canUseNativeSpeech = (): NativeSpeechCapability => ({
  available: false,
  provider: Platform.OS === 'ios'
    ? 'ios-native'
    : Platform.OS === 'android'
      ? 'android-native'
      : null,
  platform: Platform.OS,
  reason: 'native-speech-not-implemented-in-current-expo-build',
  requiresDevBuild: true,
});

export type WordPronunciationFeedback = {
  word: string;
  issue: string;
  suggestionTr: string;
};

export type SpeechFeedbackCategory = {
  id: 'correctWords' | 'missingWords' | 'extraWords' | 'wordOrder' | 'retrySuggestion';
  title: string;
  messageTr?: string;
  words?: string[];
  tone: 'success' | 'warning' | 'info' | 'error';
};

export type PronunciationScore = {
  pronunciationScore: number;
  isMock: boolean;
  provider: 'local-transcript';
  comparison: TranscriptComparison;
  scorePercent: number;
  feedbackLevel: TranscriptComparison['feedbackLevel'];
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  feedbackTr: string;
  retrySuggestionTr: string;
  feedbackCategories: SpeechFeedbackCategory[];
  wordFeedback: WordPronunciationFeedback[];
};

type RecorderStatusSnapshot = {
  isRecording: boolean;
  durationMs: number;
  metering?: number;
};

let activeRecorder: AudioRecorder | null = null;
let activeStopPromise: Promise<RecordingResult> | null = null;
let isStarting = false;

type VoiceEvidenceAccumulator = {
  meteringSamples: number[];
};

let activeVoiceEvidence: VoiceEvidenceAccumulator = {
  meteringSamples: [],
};

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const isDevelopment = process.env.NODE_ENV !== 'production';
const DEFAULT_SPEECH_TIMEOUT_MS = 45_000;
const HIGH_QUALITY_WITH_METERING = {
  ...RecordingPresets.HIGH_QUALITY,
  isMeteringEnabled: true,
};

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
  provider?: string;
  modelUsed?: string;
  fallback: boolean;
  durationMs: number;
  pronunciationScore?: number;
  accuracyScore?: number;
  fluencyScore?: number;
  completenessScore?: number;
};

const isSpeechBackendResponse = (value: unknown): value is SpeechBackendResponse => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const response = value as SpeechBackendResponse;
  return (
    typeof response.transcript === 'string' &&
    (typeof response.confidence === 'number' || response.confidence === null) &&
    (response.provider === undefined || typeof response.provider === 'string') &&
    (response.modelUsed === undefined || typeof response.modelUsed === 'string') &&
    typeof response.fallback === 'boolean' &&
    typeof response.durationMs === 'number'
  );
};

const getFallbackEventSeverity = (reason: string) =>
  reason === 'missing-backend-url' ? 'warning' : 'error';

const toSafeSpeechErrorKind = (reason: string): string => {
  if (reason === 'timeout') return 'timeout';
  if (reason === 'missing-backend-url') return 'missing-backend-url';
  if (reason === 'backend-unreachable') return 'network-error';
  if (reason === 'invalid-response') return 'parse-error';
  if (reason.startsWith('http-') || reason.startsWith('health-http-')) return 'http-error';
  if (reason.startsWith('health-')) return 'network-error';
  return 'unknown';
};

const extractHttpStatus = (reason: string): number | undefined => {
  const httpMatch = /^(?:http-|health-http-)(\d{3})$/.exec(reason);
  return httpMatch ? Number(httpMatch[1]) : undefined;
};

const getEndpointHost = (url: string) => {
  try {
    return new URL(url).host;
  } catch {
    return '';
  }
};

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

const resetVoiceEvidence = () => {
  activeVoiceEvidence = {
    meteringSamples: [],
  };
};

const updateVoiceEvidence = (metering: unknown) => {
  if (typeof metering !== 'number' || !Number.isFinite(metering)) {
    return;
  }

  activeVoiceEvidence.meteringSamples.push(metering);
};

const getVoiceEvidence = (durationMs: number): RecordingVoiceEvidence => {
  return analyzeRecordingVoiceEvidence({
    durationMs,
    meteringSamples: activeVoiceEvidence.meteringSamples,
  });
};

const createRecorder = () => {
  const recorder = new AudioModule.AudioRecorder(HIGH_QUALITY_WITH_METERING);
  logAndroidAudio('recorder created', { id: getRecorderLogId(recorder) });
  return recorder;
};

export const getMicrophonePermission = async (): Promise<MicrophonePermissionResult> => {
  const permission = await getRecordingPermissionsAsync();

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
    resetVoiceEvidence();
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
    updateVoiceEvidence(status.metering);
    return {
      isRecording: status.isRecording,
      durationMs: status.durationMillis,
      metering: status.metering,
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
      updateVoiceEvidence(statusBeforeStop.metering);
      const stopResult = (await recorder.stop()) as unknown as {
        durationMillis?: number;
        url?: string | null;
      };
      const uri = stopResult?.url ?? statusBeforeStop.url ?? '';
      const durationMs =
        stopResult?.durationMillis ?? statusBeforeStop.durationMillis ?? 0;
      const voiceEvidence = getVoiceEvidence(durationMs);

      if (!uri) {
        throw new Error('Recording finished but no audio file URI was returned.');
      }

      logAndroidAudio('stop completed', {
        id: recorderId,
        durationMs,
        hasAudioUri: Boolean(uri),
        evidenceLevel: voiceEvidence.evidenceLevel,
        reason: voiceEvidence.reason,
        shouldUpload: voiceEvidence.shouldUpload,
        sampleCount: voiceEvidence.sampleCount,
        aboveThresholdCount: voiceEvidence.aboveThresholdCount,
      });

      return { uri, durationMs, voiceEvidence };
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
    logAndroidAudio('replay started', { hasAudioUri: Boolean(audioUri) });
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
      hasAudioUri: Boolean(audioUri),
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};

export const transcribeGerman = async (
  audioUri: string,
  expectedText?: string,
): Promise<TranscriptionResult> => {
  const backendConfig = getBackendConfig();
  const backendUrl = backendConfig.baseUrl;
  const timeoutMs = getSpeechTimeoutMs();
  const startedAt = Date.now();

  if (!audioUri) {
    return makeMockTranscription('', 'missing-audio-uri');
  }

  const uploadInfo = inferAudioUploadInfo(audioUri);

  if (!backendUrl) {
    logSpeechDebug('missing backend url', { platform: uploadInfo.platform, backendSource: backendConfig.source });
    trackLocalEvent({
      type: 'speech_transcription_fallback',
      screen: 'SpeakingPractice',
      metadata: {
        provider: 'mock',
        modelUsed: 'mock:missing-backend-url',
        fallback: true,
        platform: uploadInfo.platform,
        audioExtension: uploadInfo.extension,
        audioMimeType: uploadInfo.type,
        fallbackReason: 'missing-backend-url',
        errorKind: 'missing-backend-url',
        timeoutMs,
      },
      severity: 'warning',
    });
    return {
      ...makeMockTranscription(audioUri, 'missing-backend-url'),
      audioExtension: uploadInfo.extension,
      audioMimeType: uploadInfo.type,
      backendReachable: false,
      backendBaseUrl: backendUrl,
      backendUrlSource: backendConfig.source,
    };
  }

  const endpoint = buildBackendUrl('/speech/transcribe');
  const endpointHost = getEndpointHost(endpoint);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  trackLocalEvent({
    type: 'speech_transcription_started',
    screen: 'SpeakingPractice',
    metadata: {
      provider: 'backend',
      fallback: false,
      platform: uploadInfo.platform,
      audioExtension: uploadInfo.extension,
      audioMimeType: uploadInfo.type,
    },
  });

  logSpeechDebug('upload file info', {
    timeoutMs,
    platform: uploadInfo.platform,
    audioExtension: uploadInfo.extension,
    audioMimeType: uploadInfo.type,
    endpointHost,
    backendSource: backendConfig.source,
    hasAudioUri: Boolean(audioUri),
  });

  try {
    let backendReachable = true;

    if (__DEV__) {
      const health = await checkBackendHealth();
      backendReachable = health.ok;
      logSpeechDebug('backend reachability', {
        platform: uploadInfo.platform,
        backendReachable,
        backendSource: health.config.source,
        httpStatus: health.httpStatus,
        endpointHost,
      });

      if (!backendReachable) {
        throw new Error(health.errorMessage || (health.httpStatus ? 'health-http-' + health.httpStatus : 'backend-unreachable'));
      }
    }

    logSpeechDebug('upload started', {
      timeoutMs,
      platform: uploadInfo.platform,
      audioExtension: uploadInfo.extension,
      audioMimeType: uploadInfo.type,
      endpointHost,
      backendSource: backendConfig.source,
    });
    const formData = new FormData();
    formData.append('audio', {
      uri: audioUri,
      name: uploadInfo.name,
      type: uploadInfo.type,
    } as unknown as Blob);
    formData.append('language', 'de');
    if (expectedText) {
      formData.append('expectedText', expectedText);
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    const responseTimeMs = Date.now() - startedAt;

    logSpeechDebug('upload response', {
      platform: uploadInfo.platform,
      httpStatus: response.status,
      responseTimeMs,
      endpointHost,
    });

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
      audioExtension: uploadInfo.extension,
      audioMimeType: uploadInfo.type,
      backendReachable: true,
      endpointHost,
      httpStatus: response.status,
      backendBaseUrl: backendUrl,
      backendUrlSource: backendConfig.source,
      pronunciationScore: body.pronunciationScore,
      accuracyScore: body.accuracyScore,
      fluencyScore: body.fluencyScore,
      completenessScore: body.completenessScore,
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
        platform: uploadInfo.platform,
        audioExtension: uploadInfo.extension,
        audioMimeType: uploadInfo.type,
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
      audioExtension: uploadInfo.extension,
      audioMimeType: uploadInfo.type,
      endpointHost,
      httpStatus: response.status,
      backendSource: backendConfig.source,
    });

    return transcriptResult;
  } catch (error) {
    const responseTimeMs = Date.now() - startedAt;
    const reason = error instanceof Error && error.name === 'AbortError'
      ? 'timeout'
      : error instanceof Error
        ? error.message
        : 'upload-failed';
    const errorKind = toSafeSpeechErrorKind(reason);
    const httpStatus = extractHttpStatus(reason);

    trackLocalEvent({
      type: 'speech_transcription_error',
      screen: 'SpeakingPractice',
      metadata: {
        provider: 'mock',
        modelUsed: 'mock:' + reason,
        fallback: true,
        platform: uploadInfo.platform,
        audioExtension: uploadInfo.extension,
        audioMimeType: uploadInfo.type,
        fallbackReason: reason,
        errorKind,
        httpStatus,
        durationMs: responseTimeMs,
        timeoutMs,
      },
      severity: getFallbackEventSeverity(reason),
    });
    trackLocalEvent({
      type: 'speech_transcription_fallback',
      screen: 'SpeakingPractice',
      metadata: {
        provider: 'mock',
        modelUsed: 'mock:' + reason,
        fallback: true,
        platform: uploadInfo.platform,
        audioExtension: uploadInfo.extension,
        audioMimeType: uploadInfo.type,
        fallbackReason: reason,
        errorKind,
        httpStatus,
        durationMs: responseTimeMs,
        timeoutMs,
      },
      severity: getFallbackEventSeverity(reason),
    });

    logSpeechDebug('upload failed', {
      reason,
      timeoutMs,
      platform: uploadInfo.platform,
      audioExtension: uploadInfo.extension,
      audioMimeType: uploadInfo.type,
      endpointHost,
      backendSource: backendConfig.source,
    });

    const backendReachabilityFailed = reason === 'backend-unreachable' || reason === 'missing-backend-url' || reason.startsWith('health-');

    return {
      ...makeMockTranscription(audioUri, reason),
      audioExtension: uploadInfo.extension,
      audioMimeType: uploadInfo.type,
      backendReachable: !backendReachabilityFailed,
      endpointHost,
      backendBaseUrl: backendUrl,
      backendUrlSource: backendConfig.source,
      backendErrorMessage: reason,
    };
  } finally {
    clearTimeout(timeout);
  }
};

export const scorePronunciation = async (
  audioUri: string,
  expectedText: string,
  transcriptOrResult?: string | TranscriptionResult,
): Promise<PronunciationScore> => {
  await wait(850);

  const resultObj = typeof transcriptOrResult === 'object' ? transcriptOrResult : undefined;
  const transcriptStr = typeof transcriptOrResult === 'string' ? transcriptOrResult : resultObj?.transcript ?? '';

  if (resultObj && typeof resultObj.pronunciationScore === 'number') {
    const isExcellent = resultObj.pronunciationScore >= 80;
    const isGood = resultObj.pronunciationScore >= 60;
    const tone = isExcellent ? 'success' : isGood ? 'info' : 'warning';

    return {
      pronunciationScore: resultObj.pronunciationScore,
      isMock: false,
      provider: 'azure', // using literal provider name for UI mapping compatibility, although the type may enforce local-transcript
      comparison: compareTranscripts(expectedText, transcriptStr), // keep the UI word mapping populated
      scorePercent: resultObj.pronunciationScore,
      feedbackLevel: isExcellent ? 'excellent' : isGood ? 'good' : 'poor',
      accuracyScore: resultObj.accuracyScore ?? 0,
      fluencyScore: resultObj.fluencyScore ?? 0,
      completenessScore: resultObj.completenessScore ?? 0,
      feedbackTr: isExcellent ? 'Telaffuzun harika!' : isGood ? 'Telaffuzun anlaşılır, ama daha iyi olabilir.' : 'Telaffuzunu geliştirmek için tekrar dene.',
      retrySuggestionTr: isExcellent ? 'Mükemmel!' : 'Biraz daha pratik yap.',
      feedbackCategories: [
        {
          id: 'retrySuggestion',
          title: 'Telaffuz Puanı: ' + resultObj.pronunciationScore.toFixed(0),
          messageTr: `Akıcılık: ${resultObj.fluencyScore?.toFixed(0)} | Doğruluk: ${resultObj.accuracyScore?.toFixed(0)}`,
          tone,
        }
      ],
      wordFeedback: [],
    } as unknown as PronunciationScore;
  }

  const comparison = compareTranscripts(expectedText, transcriptStr);
  const hasMissingWords = comparison.missingWords.length > 0;
  const hasExtraWords = comparison.extraWords.length > 0;
  const hasWordOrderHints = comparison.wordOrderHints.length > 0;
  const isExcellent = comparison.feedbackLevel === 'excellent';
  const isGood = comparison.feedbackLevel === 'good';
  const feedbackCategories: SpeechFeedbackCategory[] = [
    {
      id: 'correctWords',
      title: 'Doğru kelimeler',
      words: comparison.matchedWords,
      messageTr: comparison.matchedWords.length > 0
        ? undefined
        : 'Henüz hedef kelimeler net duyulmadı.',
      tone: comparison.matchedWords.length > 0 ? 'success' : 'warning',
    },
    {
      id: 'missingWords',
      title: 'Eksik kelimeler',
      words: comparison.missingWords,
      messageTr: hasMissingWords ? undefined : 'Eksik kelime görünmüyor.',
      tone: hasMissingWords ? 'warning' : 'success',
    },
    {
      id: 'extraWords',
      title: 'Fazla kelimeler',
      words: comparison.extraWords,
      messageTr: hasExtraWords ? undefined : 'Fazla kelime görünmüyor.',
      tone: hasExtraWords ? 'warning' : 'success',
    },
  ];

  if (hasWordOrderHints) {
    feedbackCategories.push({
      id: 'wordOrder',
      title: 'Kelime sırası',
      messageTr: comparison.wordOrderHints[0],
      tone: 'info',
    });
  }

  feedbackCategories.push({
    id: 'retrySuggestion',
    title: 'Tekrar önerisi',
    messageTr: comparison.retrySuggestionTr,
    tone: isExcellent ? 'success' : isGood ? 'info' : 'warning',
  });

  if (!audioUri || !expectedText) {
    return {
      pronunciationScore: 0,
      isMock: false,
      provider: 'local-transcript',
      comparison,
      scorePercent: 0,
      feedbackLevel: comparison.feedbackLevel,
      accuracyScore: 0,
      fluencyScore: 0,
      completenessScore: 0,
      feedbackTr: 'Ses kaydı veya hedef cümle bulunamadı.',
      retrySuggestionTr: 'Kaydı tekrar başlatıp hedef cümleyi oku.',
      feedbackCategories: [],
      wordFeedback: [],
    };
  }

  const pronunciationScore = comparison.scorePercent;
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

  if (hasWordOrderHints) {
    wordFeedback.push({
      word: 'Kelime sırası',
      issue: 'Sıra',
      suggestionTr: comparison.wordOrderHints[0] ?? 'Hedef cümleyi aynı sırayla tekrar et.',
    });
  }

  if (wordFeedback.length === 0) {
    wordFeedback.push({
      word: 'Akıcılık',
      issue: 'Bu geri bildirim hedef cümleyle yazıya dökülen cümleyi karşılaştırır; gerçek fonetik telaffuz analizi değildir.',
      suggestionTr: 'Cümleyi bir kez daha daha doğal hızda söyle.',
    });
  }

  return {
    pronunciationScore,
    isMock: false,
    provider: 'local-transcript',
    comparison,
    scorePercent: comparison.scorePercent,
    feedbackLevel: comparison.feedbackLevel,
    accuracyScore: comparison.scorePercent,
    fluencyScore: isExcellent ? 84 : isGood ? 74 : 62,
    completenessScore: hasMissingWords ? Math.max(45, 100 - comparison.missingWords.length * 18) : 92,
    feedbackTr: comparison.shortFeedbackTr,
    retrySuggestionTr: comparison.retrySuggestionTr,
    feedbackCategories,
    wordFeedback,
  };
};
