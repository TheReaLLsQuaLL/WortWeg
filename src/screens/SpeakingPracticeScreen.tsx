import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, Platform, Pressable, StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import { ArrowLeft, CheckCircle2, Mic, MicOff, Play, RotateCcw, Trash2, WifiOff } from 'lucide-react-native';

import { AppButton } from '../components/AppButton';
import { AppScrollView, Screen } from '../components/layout';
import { HalftoneAccent } from '../components/HalftoneAccent';
import { SpeakerButton } from '../components/SpeakerButton';
import { colors, radius, shadows, spacing, typography } from '../data/theme';
import { getSpeakingPromptById, speakingPromptsA1, type SpeakingPrompt } from '../data/speaking.a1';
import type { CommitUserState, RootNavigation, RootStackParamList } from '../navigation/AppNavigator';
import {
  cleanupRecording,
  getActiveRecordingStatus,
  replayRecording,
  requestMicrophonePermission,
  scorePronunciation,
  startRecording,
  stopRecording,
  transcribeGerman,
  type MicrophonePermissionResult,
  type PronunciationScore,
  type RecordingResult,
  type SpeechFeedbackCategory,
  type TranscriptionResult,
} from '../services/speechService';
import { trackLocalEvent } from '../services/localEventLog';
import { normalizeGermanText } from '../lib/transcriptCompare';
import { updateSpeakingStats } from '../lib/speakingStats';

type SpeakingPracticeScreenProps = {
  navigation: RootNavigation;
  onUpdateState: CommitUserState;
  route: RouteProp<RootStackParamList, 'SpeakingPractice'>;
};

type PracticeStatus =
  | 'idle'
  | 'requestingPermission'
  | 'recording'
  | 'cancelArmed'
  | 'cancelling'
  | 'stopping'
  | 'recorded'
  | 'analyzing'
  | 'result'
  | 'tooShort'
  | 'noVoice'
  | 'error';

type ActivePrompt = SpeakingPrompt & { id: string };

type SpeechDebugState = {
  lastStage: string;
  durationMs: number;
  audioExtension: string;
  audioMimeType: string;
  provider: string;
  fallback: boolean;
  hasTranscript: boolean;
  transcriptLength: number;
  lastError: string;
  backendReachable?: boolean;
  endpointHost: string;
  httpStatus?: number;
};

const MIN_RECORDING_MS = 500;
const CANCEL_DRAG_THRESHOLD = 84;
const CANCEL_RESET_THRESHOLD = 42;
const GENERIC_FALLBACK_TRANSCRIPTS = ['Ich heiße Toprak und ich wohne in Istanbul.'];

const formatDuration = (durationMs: number) => {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');

  return minutes + ':' + seconds;
};

const getPermissionText = (permission: MicrophonePermissionResult | null) => {
  if (!permission) {
    return 'Kayda başlarken mikrofon izni istenecek.';
  }

  if (permission.granted) {
    return 'Mikrofon hazır.';
  }

  return permission.canAskAgain
    ? 'Mikrofon izni gerekli.'
    : 'Mikrofon izni kapalı. Telefon ayarlarından izin ver.';
};

const getResultTitle = (result: PronunciationScore) => {
  if (result.comparison.similarityScore >= 80) {
    return 'Çok yakın!';
  }

  if (result.comparison.similarityScore >= 50) {
    return 'Neredeyse oldu';
  }

  return 'Tekrar deneyelim';
};

const getResultColor = (result: PronunciationScore) => {
  if (result.comparison.similarityScore >= 80) {
    return colors.green;
  }

  if (result.comparison.similarityScore >= 50) {
    return '#A66500';
  }

  return colors.red;
};

const isGenericFallbackTranscript = (transcript: string) => {
  const normalizedTranscript = normalizeGermanText(transcript, { looseEszett: true });

  return GENERIC_FALLBACK_TRANSCRIPTS.some(
    (fallbackText) => normalizeGermanText(fallbackText, { looseEszett: true }) === normalizedTranscript,
  );
};

const getTranscriptionIssue = (result: TranscriptionResult): 'none' | 'noVoice' | 'error' => {
  const normalizedTranscript = normalizeGermanText(result.transcript || '', { looseEszett: true });
  const fallbackMarker = [result.fallbackReason, result.modelUsed].filter(Boolean).join(' ').toLocaleLowerCase('en-US');

  if (result.fallbackReason && !fallbackMarker.includes('empty-openai-transcript')) {
    return 'error';
  }

  if (!normalizedTranscript) {
    return 'noVoice';
  }

  if (result.fallback && fallbackMarker.includes('empty-openai-transcript')) {
    return 'noVoice';
  }

  if (result.fallback && isGenericFallbackTranscript(result.transcript)) {
    return 'noVoice';
  }

  if (result.fallback && (result.provider === 'mock' || fallbackMarker.includes('mock:'))) {
    return 'error';
  }

  return 'none';
};

export function SpeakingPracticeScreen({ navigation, onUpdateState, route }: SpeakingPracticeScreenProps) {
  const initialPrompt = getSpeakingPromptById(route.params?.promptId);
  const initialIndex = Math.max(
    0,
    speakingPromptsA1.findIndex((prompt) => prompt.id === initialPrompt.id),
  );
  const [promptIndex, setPromptIndex] = useState(initialIndex === -1 ? 0 : initialIndex);
  const [permission, setPermission] = useState<MicrophonePermissionResult | null>(null);
  const [status, setStatus] = useState<PracticeStatus>('idle');
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState(0);
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null);
  const [pronunciationResult, setPronunciationResult] = useState<PronunciationScore | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);
  const [replaying, setReplaying] = useState(false);
  const [analysisIsSlow, setAnalysisIsSlow] = useState(false);
  const [speechDebugExpanded, setSpeechDebugExpanded] = useState(false);
  const [speechDebug, setSpeechDebug] = useState<SpeechDebugState>({
    lastStage: 'idle',
    durationMs: 0,
    audioExtension: '',
    audioMimeType: '',
    provider: '',
    fallback: false,
    hasTranscript: false,
    transcriptLength: 0,
    lastError: '',
    backendReachable: undefined as boolean | undefined,
    endpointHost: '',
    httpStatus: undefined as number | undefined,
  });
  const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const replayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const analysisTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actionLockedRef = useRef(false);
  const releasePendingRef = useRef(false);
  const pressStartedAtRef = useRef(0);
  const pressStartPageXRef = useRef(0);
  const cancelArmedRef = useRef(false);
  const cancelEventTrackedRef = useRef(false);
  const mountedRef = useRef(true);
  const statusRef = useRef<PracticeStatus>('idle');
  const recordPulseOpacity = useRef(new Animated.Value(0)).current;
  const recordScale = useRef(new Animated.Value(1)).current;
  const waveBars = useRef([
    new Animated.Value(0.45),
    new Animated.Value(0.75),
    new Animated.Value(0.55),
    new Animated.Value(0.9),
    new Animated.Value(0.6),
  ]).current;

  const prompt = useMemo<ActivePrompt>(() => {
    if (route.params?.expectedText) {
      return {
        id: route.params.promptId ?? 'custom-speaking-prompt',
        topicTitle: route.params.topicTitle ?? 'Ders konuşması',
        expectedText: route.params.expectedText,
        meaningTr: route.params.meaningTr ?? 'Cümleyi sesli oku.',
        tipTr: route.params.tipTr ?? 'Yavaş ve net söylemen yeterli.',
      };
    }

    return speakingPromptsA1[promptIndex] ?? speakingPromptsA1[0]!;
  }, [promptIndex, route.params?.expectedText, route.params?.meaningTr, route.params?.promptId, route.params?.tipTr, route.params?.topicTitle]);
  const source = route.params?.source ?? 'speaking_practice';
  const statsLevel = route.params?.level ?? (route.params?.expectedText ? 'OTHER' : 'A1');
  const statsSentenceId = route.params?.sentenceId ?? route.params?.promptId;
  const progressText = route.params?.expectedText
    ? 'Ders cümlesi'
    : String(promptIndex + 1) + '/' + speakingPromptsA1.length;
  const headerKicker = route.params?.expectedText
    ? 'Konuşma pratiği · ' + progressText
    : 'A1 konuşma pratiği · ' + progressText;
  const busyStatuses: PracticeStatus[] = ['requestingPermission', 'recording', 'cancelArmed', 'cancelling', 'stopping', 'analyzing'];
  const canPressRecord = !busyStatuses.includes(status);
  const canReplay = Boolean(audioUri) && !busyStatuses.includes(status);
  const canMovePrompt = !route.params?.expectedText && !busyStatuses.includes(status);

  const clearDurationTimer = () => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
  };

  const clearReplayTimer = () => {
    if (replayTimerRef.current) {
      clearTimeout(replayTimerRef.current);
      replayTimerRef.current = null;
    }
  };

  const clearAnalysisTimer = () => {
    if (analysisTimerRef.current) {
      clearTimeout(analysisTimerRef.current);
      analysisTimerRef.current = null;
    }
  };

  const updateSpeechDebug = (patch: Partial<typeof speechDebug>) => {
    if (!__DEV__ || !mountedRef.current) {
      return;
    }

    setSpeechDebug((current) => ({ ...current, ...patch }));
  };

  const logSpeechUiDebug = (stage: string, details?: Record<string, string | number | boolean | undefined>) => {
    if (!__DEV__) {
      return;
    }

    console.log('[WortWeg Speech UI] ' + stage, details ?? {});
  };

  const setSafeStatus = (nextStatus: PracticeStatus) => {
    statusRef.current = nextStatus;
    updateSpeechDebug({ lastStage: 'state:' + nextStatus });

    if (__DEV__ && ['error', 'idle', 'requestingPermission', 'recording', 'analyzing', 'tooShort', 'noVoice'].includes(nextStatus)) {
      setSpeechDebugExpanded(false);
    }

    if (mountedRef.current) {
      setStatus(nextStatus);
    }
  };

  const setSafeErrorMessage = (message: string | null) => {
    if (mountedRef.current) {
      setErrorMessage(message);
    }
  };

  useEffect(() => {
    trackLocalEvent({
      type: 'speaking_opened',
      screen: 'SpeakingPractice',
      metadata: { source },
    });
  }, [source]);

  useEffect(() => {
    if (status !== 'recording' && status !== 'cancelArmed') {
      recordPulseOpacity.setValue(0);
      recordScale.setValue(1);
      return;
    }

    const pulse = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(recordPulseOpacity, { toValue: 0.28, duration: 520, useNativeDriver: true }),
          Animated.timing(recordPulseOpacity, { toValue: 0, duration: 520, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(recordScale, { toValue: 1.06, duration: 520, useNativeDriver: true }),
          Animated.timing(recordScale, { toValue: 1, duration: 520, useNativeDriver: true }),
        ]),
      ]),
    );
    pulse.start();

    return () => pulse.stop();
  }, [recordPulseOpacity, recordScale, status]);

  useEffect(() => {
    if (status !== 'analyzing') {
      clearAnalysisTimer();
      setAnalysisIsSlow(false);
      return;
    }

    analysisTimerRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setAnalysisIsSlow(true);
      }
    }, 5_000);

    const animation = Animated.loop(
      Animated.stagger(
        90,
        waveBars.map((bar) =>
          Animated.sequence([
            Animated.timing(bar, { toValue: 1, duration: 280, useNativeDriver: true }),
            Animated.timing(bar, { toValue: 0.35, duration: 280, useNativeDriver: true }),
          ]),
        ),
      ),
    );
    animation.start();

    return () => {
      clearAnalysisTimer();
      animation.stop();
    };
  }, [status, waveBars]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      clearDurationTimer();
      clearReplayTimer();
      clearAnalysisTimer();
      void cleanupRecording().catch(() => undefined);
    };
  }, []);

  const clearFeedback = () => {
    setSpeechDebugExpanded(false);
    setAudioUri(null);
    setDurationMs(0);
    setTranscriptionResult(null);
    setPronunciationResult(null);
    setSafeErrorMessage(null);
    setCancelMessage(null);
    setReplaying(false);
    cancelArmedRef.current = false;
    cancelEventTrackedRef.current = false;
    setAnalysisIsSlow(false);
    updateSpeechDebug({
      lastStage: 'idle',
      durationMs: 0,
      audioExtension: '',
      audioMimeType: '',
      provider: '',
      fallback: false,
      hasTranscript: false,
      transcriptLength: 0,
      lastError: '',
      backendReachable: undefined,
      endpointHost: '',
      httpStatus: undefined,
    });
    clearReplayTimer();
    clearAnalysisTimer();
  };

  const analyzeRecording = async (recording: RecordingResult) => {
    const analysisStartedAt = Date.now();
    logSpeechUiDebug('analysis started', {
      platform: Platform.OS,
      durationMs: recording.durationMs,
      hasAudioUri: Boolean(recording.uri),
    });
    updateSpeechDebug({
      lastStage: 'analysis started',
      durationMs: recording.durationMs,
      hasTranscript: false,
      transcriptLength: 0,
      lastError: '',
    });
    setSafeStatus('analyzing');
    trackLocalEvent({
      type: 'speech_analysis_started',
      screen: 'SpeakingPractice',
      metadata: { source, durationMs: recording.durationMs, platform: Platform.OS },
    });

    try {
      const nextTranscriptionResult = await transcribeGerman(recording.uri, prompt.expectedText);

      logSpeechUiDebug('transcription result', {
        provider: nextTranscriptionResult.provider,
        modelUsed: nextTranscriptionResult.modelUsed,
        fallback: nextTranscriptionResult.fallback,
        hasTranscript: Boolean(nextTranscriptionResult.transcript),
        transcriptLength: nextTranscriptionResult.transcript.length,
        audioExtension: nextTranscriptionResult.audioExtension,
        audioMimeType: nextTranscriptionResult.audioMimeType,
        backendReachable: nextTranscriptionResult.backendReachable,
        httpStatus: nextTranscriptionResult.httpStatus,
      });
      updateSpeechDebug({
        lastStage: 'transcription returned',
        audioExtension: nextTranscriptionResult.audioExtension ?? '',
        audioMimeType: nextTranscriptionResult.audioMimeType ?? '',
        provider: nextTranscriptionResult.provider ?? '',
        fallback: Boolean(nextTranscriptionResult.fallback),
        hasTranscript: Boolean(nextTranscriptionResult.transcript),
        transcriptLength: nextTranscriptionResult.transcript.length,
        backendReachable: nextTranscriptionResult.backendReachable,
        endpointHost: nextTranscriptionResult.endpointHost ?? '',
        httpStatus: nextTranscriptionResult.httpStatus,
      });

      const transcriptionIssue = getTranscriptionIssue(nextTranscriptionResult);

      if (transcriptionIssue !== 'none') {
        if (!mountedRef.current) {
          return;
        }

        setAudioUri(null);
        setTranscriptionResult(null);
        setPronunciationResult(null);

        if (transcriptionIssue === 'noVoice') {
          setSafeErrorMessage(null);
          logSpeechUiDebug('analysis state resolved', { state: 'noVoice', platform: Platform.OS });
          updateSpeechDebug({ lastStage: 'resolved:noVoice' });
          setSafeStatus('noVoice');
          trackLocalEvent({
            type: 'speaking_no_voice_detected',
            screen: 'SpeakingPractice',
            metadata: {
              source,
              durationMs: recording.durationMs,
              platform: Platform.OS,
            },
            severity: 'warning',
          });
          return;
        }

        const friendlyError = nextTranscriptionResult.fallbackReason === 'backend-unreachable'
          ? 'Analiz sunucusuna ulaşılamadı. Aynı Wi-Fi’da olduğundan emin ol ve tekrar dene.'
          : 'Analiz tamamlanamadı. Bağlantıyı kontrol edip tekrar deneyelim.';
        setSafeErrorMessage(friendlyError);
        logSpeechUiDebug('analysis state resolved', { state: 'error', platform: Platform.OS, reason: nextTranscriptionResult.fallbackReason });
        updateSpeechDebug({ lastStage: 'resolved:error', lastError: nextTranscriptionResult.fallbackReason ?? 'analysis failed' });
        setSafeStatus('error');
        trackLocalEvent({
          type: 'speech_analysis_failed',
          screen: 'SpeakingPractice',
          metadata: { source, durationMs: recording.durationMs, platform: Platform.OS },
          severity: 'error',
        });
        return;
      }

      const nextPronunciationResult = await scorePronunciation(
        recording.uri,
        prompt.expectedText,
        nextTranscriptionResult.transcript,
      );

      if (!mountedRef.current) {
        return;
      }

      setTranscriptionResult(nextTranscriptionResult);
      setPronunciationResult(nextPronunciationResult);
      try {
        await onUpdateState((state) => ({
          ...state,
          speakingStats: updateSpeakingStats(state.speakingStats, {
            level: statsLevel,
            practicedAt: new Date().toISOString(),
            scorePercent: nextPronunciationResult.scorePercent,
            sentenceId: statsSentenceId,
          }),
        }));
      } catch {
        // Speaking feedback should still render if local stats persistence fails.
      }
      logSpeechUiDebug('analysis state resolved', { state: 'result', platform: Platform.OS });
      updateSpeechDebug({ lastStage: 'resolved:result' });
      setSafeStatus('result');
      trackLocalEvent({
        type: 'speech_analysis_completed',
        screen: 'SpeakingPractice',
        metadata: {
          source,
          durationMs: Date.now() - analysisStartedAt,
          provider: nextTranscriptionResult.provider,
          modelUsed: nextTranscriptionResult.modelUsed,
          fallback: Boolean(nextTranscriptionResult.fallback),
          similarityBucket: nextPronunciationResult.comparison.similarityBucket,
          platform: Platform.OS,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'analysis failed';
      logSpeechUiDebug('analysis state resolved', { state: 'error', platform: Platform.OS, lastError: message });
      updateSpeechDebug({ lastStage: 'resolved:error', lastError: message });
      setSafeStatus('error');
      setSafeErrorMessage('Analiz tamamlanamadı. Bağlantıyı kontrol edip tekrar deneyelim.');
      trackLocalEvent({
        type: 'speech_analysis_failed',
        screen: 'SpeakingPractice',
        metadata: { source, platform: Platform.OS },
        severity: 'error',
      });
    }
  };

  const beginPressRecording = async (event: GestureResponderEvent) => {
    if (!canPressRecord || actionLockedRef.current) {
      return;
    }

    actionLockedRef.current = true;
    logSpeechUiDebug('press started', { platform: Platform.OS });
    updateSpeechDebug({ lastStage: 'press started', lastError: '' });
    releasePendingRef.current = false;
    cancelArmedRef.current = false;
    cancelEventTrackedRef.current = false;
    pressStartedAtRef.current = Date.now();
    pressStartPageXRef.current = event.nativeEvent.pageX;
    clearDurationTimer();
    clearFeedback();
    setSafeStatus('requestingPermission');
    trackLocalEvent({
      type: 'speaking_press_started',
      screen: 'SpeakingPractice',
      metadata: { source, platform: Platform.OS },
    });

    try {
      const nextPermission = await requestMicrophonePermission();

      if (!mountedRef.current) {
        return;
      }

      setPermission(nextPermission);

      if (!nextPermission.granted) {
        setSafeErrorMessage(
          nextPermission.canAskAgain
            ? 'Mikrofon izni olmadan kayıt alamıyoruz. Lütfen izin ver.'
            : 'Mikrofon izni kapalı. Telefon ayarlarından WortWeg için mikrofon iznini aç.',
        );
        setSafeStatus('error');
        return;
      }

      await startRecording();
      trackLocalEvent({
        type: 'recording_started',
        screen: 'SpeakingPractice',
        metadata: { source, platform: Platform.OS },
      });

      if (!mountedRef.current) {
        await cleanupRecording().catch(() => undefined);
        return;
      }

      setDurationMs(0);
      setSafeStatus('recording');
      durationTimerRef.current = setInterval(() => {
        const snapshot = getActiveRecordingStatus();
        setDurationMs(snapshot.durationMs);
      }, 150);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'stop failed';
      clearDurationTimer();
      logSpeechUiDebug('analysis state resolved', { state: 'error', platform: Platform.OS, lastError: message });
      updateSpeechDebug({ lastStage: 'resolved:error', lastError: message });
      setSafeStatus('error');
      trackLocalEvent({
        type: 'recording_error',
        screen: 'SpeakingPractice',
        action: 'start_recording',
        metadata: { source, platform: Platform.OS },
        severity: 'error',
      });
      setSafeErrorMessage('Mikrofon izni veya kayıt başlatma sırasında sorun oldu. Lütfen tekrar dene.');
    } finally {
      actionLockedRef.current = false;

      if (releasePendingRef.current && mountedRef.current) {
        releasePendingRef.current = false;
        void finishPressRecording();
      }
    }
  };

  const handleRecordDrag = (dragX: number) => {
    const currentStatus = statusRef.current;

    if (currentStatus !== 'recording' && currentStatus !== 'cancelArmed') {
      return;
    }

    if (dragX <= -CANCEL_DRAG_THRESHOLD && !cancelArmedRef.current) {
      cancelArmedRef.current = true;
      setSafeStatus('cancelArmed');

      if (!cancelEventTrackedRef.current) {
        cancelEventTrackedRef.current = true;
        trackLocalEvent({
          type: 'speaking_cancel_armed',
          screen: 'SpeakingPractice',
          metadata: { source, durationMs: Math.max(0, Date.now() - pressStartedAtRef.current), platform: Platform.OS },
          severity: 'warning',
        });
      }

      return;
    }

    if (dragX > -CANCEL_RESET_THRESHOLD && cancelArmedRef.current) {
      cancelArmedRef.current = false;
      setSafeStatus('recording');
    }
  };

  const finishPressRecording = async () => {
    const currentStatus = statusRef.current;

    logSpeechUiDebug('release received', {
      platform: Platform.OS,
      state: currentStatus,
      durationMs: Math.max(0, Date.now() - pressStartedAtRef.current),
      cancelArmed: cancelArmedRef.current,
    });
    updateSpeechDebug({ lastStage: 'release received' });

    if (currentStatus === 'requestingPermission' || actionLockedRef.current) {
      releasePendingRef.current = true;
      return;
    }

    if (currentStatus !== 'recording' && currentStatus !== 'cancelArmed') {
      return;
    }

    const shouldCancel = currentStatus === 'cancelArmed' || cancelArmedRef.current;
    actionLockedRef.current = true;
    clearDurationTimer();
    setSafeStatus(shouldCancel ? 'cancelling' : 'stopping');
    setSafeErrorMessage(null);
    const heldDurationMs = Math.max(0, Date.now() - pressStartedAtRef.current);
    trackLocalEvent({
      type: 'speaking_press_released',
      screen: 'SpeakingPractice',
      metadata: { source, durationMs: heldDurationMs, platform: Platform.OS },
    });

    try {
      const recording = await stopRecording();
      const finalDurationMs = recording.durationMs || heldDurationMs;
      logSpeechUiDebug('stop completed', {
        platform: Platform.OS,
        durationMs: finalDurationMs,
        hasAudioUri: Boolean(recording.uri),
        shouldCancel,
      });
      updateSpeechDebug({
        lastStage: 'stop completed',
        durationMs: finalDurationMs,
      });
      trackLocalEvent({
        type: 'recording_stopped',
        screen: 'SpeakingPractice',
        metadata: { source, durationMs: finalDurationMs, platform: Platform.OS },
      });

      if (!mountedRef.current) {
        return;
      }

      if (shouldCancel) {
        setDurationMs(0);
        setAudioUri(null);
        setTranscriptionResult(null);
        setPronunciationResult(null);
        setCancelMessage('Kayıt iptal edildi.');
        setSafeStatus('idle');
        trackLocalEvent({
          type: 'speaking_cancelled',
          screen: 'SpeakingPractice',
          metadata: { source, durationMs: finalDurationMs, platform: Platform.OS },
          severity: 'warning',
        });
        return;
      }

      if (finalDurationMs < MIN_RECORDING_MS) {
        setDurationMs(0);
        setAudioUri(null);
        setSafeErrorMessage('Biraz daha uzun söylemeyi dene.');
        logSpeechUiDebug('analysis state resolved', { state: 'tooShort', platform: Platform.OS, durationMs: finalDurationMs });
        updateSpeechDebug({ lastStage: 'resolved:tooShort' });
        setSafeStatus('tooShort');
        trackLocalEvent({
          type: 'speaking_too_short',
          screen: 'SpeakingPractice',
          metadata: { source, durationMs: finalDurationMs, platform: Platform.OS },
          severity: 'warning',
        });
        return;
      }

      setAudioUri(recording.uri);
      setDurationMs(finalDurationMs);
      setSafeStatus('recorded');
      await analyzeRecording({ ...recording, durationMs: finalDurationMs });
    } catch {
      clearDurationTimer();
      setSafeStatus('error');
      trackLocalEvent({
        type: 'recording_error',
        screen: 'SpeakingPractice',
        action: 'stop_recording',
        metadata: { source, platform: Platform.OS },
        severity: 'error',
      });
      setSafeErrorMessage('Kayıt durdurulurken bir sorun oluştu. Lütfen tekrar dene.');
    } finally {
      cancelArmedRef.current = false;
      cancelEventTrackedRef.current = false;
      actionLockedRef.current = false;
    }
  };

  const replay = async () => {
    if (!audioUri || !canReplay) {
      return;
    }

    try {
      clearReplayTimer();
      setReplaying(true);
      setSafeErrorMessage(null);
      await replayRecording(audioUri);
      replayTimerRef.current = setTimeout(() => {
        if (mountedRef.current) {
          setReplaying(false);
        }
      }, Math.max(900, durationMs));
    } catch {
      clearReplayTimer();
      setReplaying(false);
      trackLocalEvent({
        type: 'recording_error',
        screen: 'SpeakingPractice',
        action: 'replay_recording',
        metadata: { source, platform: Platform.OS },
        severity: 'error',
      });
      setSafeErrorMessage('Kaydı oynatırken bir sorun oluştu.');
    }
  };

  const retryCurrentPrompt = () => {
    if (busyStatuses.includes(status)) {
      return;
    }

    clearDurationTimer();
    clearFeedback();
    releasePendingRef.current = false;
    cancelArmedRef.current = false;
    cancelEventTrackedRef.current = false;
    setSafeStatus('idle');
  };

  const nextPrompt = () => {
    if (!canMovePrompt) {
      return;
    }

    clearDurationTimer();
    clearFeedback();
    releasePendingRef.current = false;
    cancelArmedRef.current = false;
    cancelEventTrackedRef.current = false;
    setSafeStatus('idle');
    setPromptIndex((index) => (index + 1) % speakingPromptsA1.length);
  };

  const recordPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => canPressRecord && !actionLockedRef.current,
        onMoveShouldSetPanResponder: () => statusRef.current === 'recording' || statusRef.current === 'cancelArmed',
        onPanResponderGrant: (event) => {
          void beginPressRecording(event);
        },
        onPanResponderMove: (_event, gestureState) => {
          handleRecordDrag(gestureState.dx);
        },
        onPanResponderRelease: () => {
          void finishPressRecording();
        },
        onPanResponderTerminate: () => {
          void finishPressRecording();
        },
        onPanResponderTerminationRequest: () => false,
      }),
    [canPressRecord, prompt.expectedText, prompt.id, source],
  );

  const recordingTitle = (() => {
    if (status === 'requestingPermission') {
      return 'Hazırlanıyor…';
    }

    if (status === 'recording') {
      return 'Konuşuyorsun…';
    }

    if (status === 'cancelArmed') {
      return 'Bırakınca iptal';
    }

    if (status === 'cancelling') {
      return 'İptal ediliyor…';
    }

    if (status === 'stopping') {
      return 'Kaydı alıyorum…';
    }

    if (status === 'analyzing') {
      return 'Dinliyorum…';
    }

    if (status === 'error') {
      return 'Analiz tamamlanamadı';
    }

    if (status === 'tooShort') {
      return 'Biraz daha uzun';
    }

    if (status === 'noVoice') {
      return 'Sesini duyamadık';
    }

    return 'Basılı tut ve söyle';
  })();

  const recordingHelper = (() => {
    if (status === 'recording') {
      return 'İptal etmek için sola kaydır';
    }

    if (status === 'cancelArmed') {
      return 'Bırakınca kayıt iptal edilecek.';
    }

    if (status === 'cancelling') {
      return 'Kayıt gönderilmeyecek.';
    }

    if (status === 'analyzing') {
      return analysisIsSlow ? 'Biraz uzun sürdü, devam ediyoruz.' : 'Cümleni karşılaştırıyoruz.';
    }

    if (status === 'error') {
      return 'Bağlantıyı kontrol edip tekrar deneyelim.';
    }

    if (status === 'tooShort') {
      return 'Mikrofona basılı tutup cümleyi biraz daha uzun söyle.';
    }

    if (status === 'noVoice') {
      return 'Mikrofona biraz daha yakın konuşup tekrar dene.';
    }

    return 'Cümleyi sakin ve net oku.';
  })();
  const showRecorderIntro = status !== 'noVoice' && status !== 'error' && status !== 'tooShort';

  return (
    <Screen backgroundColor={colors.lavenderBackground}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={styles.iconButton}
        >
          <ArrowLeft color={colors.white} size={22} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.kicker}>{headerKicker}</Text>
          <Text style={styles.headerTitle}>Sesli dene</Text>
        </View>
      </View>

      <AppScrollView contentContainerStyle={styles.content} style={styles.scroll}>
        <View style={styles.promptCard}>
          <HalftoneAccent opacity={0.07} size="small" style={styles.promptTexture} />
          <View style={styles.promptTopRow}>
            <View style={styles.promptCopy}>
              <Text style={styles.kickerDark}>{prompt.topicTitle}</Text>
              <Text style={styles.expected}>{prompt.expectedText}</Text>
              <Text style={styles.meaning}>{prompt.meaningTr}</Text>
            </View>
            <SpeakerButton text={prompt.expectedText} />
          </View>
          <Text style={styles.tip}>{prompt.tipTr}</Text>
        </View>

        <View style={[
          styles.recorderCard,
          (status === 'recording' || status === 'cancelArmed') && styles.recordingCard,
          status === 'cancelArmed' && styles.cancelArmedCard,
        ]}>
          {showRecorderIntro ? (
            <>
              <Text style={styles.duration}>{formatDuration(durationMs)}</Text>
              <Text style={styles.recordTitle}>{recordingTitle}</Text>
              <Text style={styles.body}>{recordingHelper}</Text>
            </>
          ) : null}

          {status === 'noVoice' ? (
            <NoVoiceState onRetry={retryCurrentPrompt} />
          ) : status === 'error' ? (
            <RetryState
              helper="Bağlantıyı kontrol edip tekrar deneyelim."
              onRetry={retryCurrentPrompt}
              title="Analiz tamamlanamadı"
            />
          ) : status === 'tooShort' ? (
            <RetryState
              helper="Biraz daha uzun söylemeyi dene."
              onRetry={retryCurrentPrompt}
              title="Biraz daha uzun"
            />
          ) : status === 'analyzing' ? (
            <AnalysisWave bars={waveBars} />
          ) : (
            <View style={styles.recordActions}>
              {status === 'recording' || status === 'cancelArmed' ? (
                <Animated.View pointerEvents="none" style={[styles.recordPulse, status === 'cancelArmed' && styles.cancelPulse, { opacity: recordPulseOpacity }]} />
              ) : null}
              <Animated.View style={{ transform: [{ scale: recordScale }] }}>
                <View
                  {...recordPanResponder.panHandlers}
                  accessibilityRole="button"
                  accessible
                  style={[
                    styles.recordButton,
                    (status === 'recording' || status === 'cancelArmed') && styles.recordButtonActive,
                    status === 'cancelArmed' && styles.recordButtonCancel,
                    (!canPressRecord && status !== 'recording' && status !== 'cancelArmed') && styles.disabledButton,
                  ]}
                >
                  <Mic color={colors.white} size={42} strokeWidth={2.8} />
                </View>
              </Animated.View>
            </View>
          )}

          {status === 'recording' || status === 'cancelArmed' ? (
            <View style={[styles.cancelHint, status === 'cancelArmed' && styles.cancelHintArmed]}>
              <Trash2 color={status === 'cancelArmed' ? colors.white : colors.red} size={18} />
              <Text style={[styles.cancelHintText, status === 'cancelArmed' && styles.cancelHintTextArmed]}>
                {status === 'cancelArmed' ? 'Bırakınca iptal' : 'İptal etmek için sola kaydır'}
              </Text>
            </View>
          ) : null}
          {showRecorderIntro ? <Text style={styles.permissionText}>{getPermissionText(permission)}</Text> : null}
          {cancelMessage ? <Text style={styles.cancelMessage}>{cancelMessage}</Text> : null}
          {errorMessage && showRecorderIntro ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          {__DEV__ ? (
            <SpeechDebugPanel
              expanded={speechDebugExpanded}
              onToggle={() => setSpeechDebugExpanded((value) => !value)}
              status={status}
              durationMs={durationMs}
              debug={speechDebug}
            />
          ) : null}
        </View>

        {transcriptionResult && pronunciationResult ? (
          <ResultCard
            canMovePrompt={canMovePrompt}
            canReplay={canReplay}
            expectedText={prompt.expectedText}
            onNextPrompt={nextPrompt}
            onReplay={replay}
            onRetry={retryCurrentPrompt}
            pronunciationResult={pronunciationResult}
            replaying={replaying}
            transcriptionResult={transcriptionResult}
          />
        ) : null}
      </AppScrollView>
    </Screen>
  );
}

function SpeechDebugPanel({
  debug,
  durationMs,
  expanded,
  onToggle,
  status,
}: {
  debug: SpeechDebugState;
  durationMs: number;
  expanded: boolean;
  onToggle: () => void;
  status: PracticeStatus;
}) {
  if (!__DEV__) {
    return null;
  }

  return (
    <View style={styles.debugPanel}>
      <Pressable accessibilityRole="button" onPress={onToggle} style={({ pressed }) => [styles.debugHeader, pressed && styles.pressed]}>
        <Text style={styles.debugTitle}>Teknik ayrıntı</Text>
        <Text style={styles.debugToggle}>{expanded ? 'Gizle' : 'Aç'}</Text>
      </Pressable>
      {expanded ? (
        <View style={styles.debugRows}>
          <DebugRow label="platform" value={Platform.OS} />
          <DebugRow label="state" value={status} />
          <DebugRow label="stage" value={debug.lastStage} />
          <DebugRow label="durationMs" value={String(Math.round(debug.durationMs || durationMs))} />
          <DebugRow label="extension" value={debug.audioExtension || '-'} />
          <DebugRow label="mime" value={debug.audioMimeType || '-'} />
          <DebugRow label="backend" value={debug.backendReachable === undefined ? '-' : String(debug.backendReachable)} />
          <DebugRow label="host" value={debug.endpointHost || '-'} />
          <DebugRow label="http" value={debug.httpStatus === undefined ? '-' : String(debug.httpStatus)} />
          <DebugRow label="provider" value={debug.provider || '-'} />
          <DebugRow label="fallback" value={String(debug.fallback)} />
          <DebugRow label="hasTranscript" value={String(debug.hasTranscript)} />
          <DebugRow label="transcriptLength" value={String(debug.transcriptLength)} />
          <DebugRow label="lastError" value={debug.lastError || '-'} />
        </View>
      ) : null}
    </View>
  );
}

function DebugRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.debugRow}>
      <Text style={styles.debugLabel}>{label}</Text>
      <Text style={styles.debugValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function RetryState({ helper, onRetry, title }: { helper: string; onRetry: () => void; title: string }) {
  return (
    <View style={styles.retryBox}>
      <HalftoneAccent color={colors.errorCoral} opacity={0.08} size="small" style={styles.stateTexture} />
      <View style={styles.retryIcon}>
        <WifiOff color={colors.red} size={28} strokeWidth={2.7} />
      </View>
      <Text style={styles.retryTitle}>{title}</Text>
      <Text style={styles.retryBody}>{helper}</Text>
      <AppButton icon={RotateCcw} onPress={onRetry} title="Tekrar dene" />
    </View>
  );
}

function NoVoiceState({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.noVoiceBox}>
      <HalftoneAccent color={colors.primaryPurple} opacity={0.08} size="small" style={styles.stateTexture} />
      <View style={styles.noVoiceIcon}>
        <MicOff color={colors.royalPurple} size={32} strokeWidth={2.8} />
      </View>
      <Text style={styles.noVoiceTitle}>Sesini duyamadık</Text>
      <Text style={styles.noVoiceBody}>Mikrofona biraz daha yakın konuşup tekrar dene.</Text>
      <AppButton icon={RotateCcw} onPress={onRetry} title="Tekrar dene" />
    </View>
  );
}

function AnalysisWave({ bars }: { bars: Animated.Value[] }) {
  return (
    <View style={styles.waveWrap}>
      {bars.map((bar, index) => (
        <Animated.View
          key={'wave-' + index}
          style={[
            styles.waveBar,
            {
              transform: [{ scaleY: bar }],
              opacity: bar.interpolate({ inputRange: [0.35, 1], outputRange: [0.45, 1] }),
            },
          ]}
        />
      ))}
    </View>
  );
}

function ResultCard({
  canMovePrompt,
  canReplay,
  expectedText,
  onNextPrompt,
  onReplay,
  onRetry,
  pronunciationResult,
  replaying,
  transcriptionResult,
}: {
  canMovePrompt: boolean;
  canReplay: boolean;
  expectedText: string;
  onNextPrompt: () => void;
  onReplay: () => void;
  onRetry: () => void;
  pronunciationResult: PronunciationScore;
  replaying: boolean;
  transcriptionResult: TranscriptionResult;
}) {
  const resultColor = getResultColor(pronunciationResult);
  const scorePercent = pronunciationResult.scorePercent;

  return (
    <View style={styles.feedbackCard}>
      <HalftoneAccent color={colors.yellowCta} opacity={0.12} size="medium" style={styles.resultTexture} />
      <View style={styles.resultHero}>
        <CheckCircle2 color={resultColor} size={28} />
        <View style={styles.resultHeroCopy}>
          <Text style={[styles.resultTitle, { color: resultColor }]}>{getResultTitle(pronunciationResult)}</Text>
          <Text style={styles.body}>Hedefe yakınlık</Text>
        </View>
        <View style={[styles.scoreSticker, { borderColor: resultColor }]}>
          <Text style={[styles.similarityScore, { color: resultColor }]}>
            {scorePercent}
          </Text>
        </View>
      </View>

      <View style={styles.sentenceGrid}>
        <View style={styles.sentenceCard}>
          <Text style={styles.sentenceLabel}>Beklenen</Text>
          <Text style={styles.expectedResultText}>{expectedText}</Text>
        </View>
        <View style={styles.sentenceCard}>
          <Text style={styles.sentenceLabel}>Söylediğin</Text>
          <Text style={styles.transcriptText}>{transcriptionResult.transcript || 'Metin alınamadı.'}</Text>
          {transcriptionResult.fallback ? (
            <Text style={styles.fallbackText}>Şimdilik yerel tahmin kullanıldı.</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.feedbackCategoryGrid}>
        {pronunciationResult.feedbackCategories.map((category) => (
          <FeedbackCategoryCard category={category} key={category.id} />
        ))}
      </View>

      <View style={styles.feedbackNote}>
        <Text style={styles.sectionTitle}>Pratik geri bildirimi</Text>
        <Text style={styles.feedbackText}>{pronunciationResult.feedbackTr}</Text>
      </View>

      <View style={styles.resultActions}>
        <AppButton icon={RotateCcw} onPress={onRetry} title="Tekrar dene" />
        {canMovePrompt ? (
          <AppButton onPress={onNextPrompt} title="Başka cümle" variant="secondary" />
        ) : null}
        <AppButton
          disabled={!canReplay}
          icon={Play}
          loading={replaying}
          onPress={onReplay}
          title="Kaydı dinle"
          variant="secondary"
        />
      </View>
    </View>
  );
}

function FeedbackCategoryCard({ category }: { category: SpeechFeedbackCategory }) {
  const toneStyle =
    category.tone === 'success'
      ? styles.successCategory
      : category.tone === 'error'
        ? styles.errorCategory
        : category.tone === 'info'
          ? styles.infoCategory
          : styles.warningCategory;

  return (
    <View style={[styles.feedbackCategoryCard, toneStyle]}>
      <Text style={styles.feedbackCategoryTitle}>{category.title}</Text>
      {category.words && category.words.length > 0 ? (
        <View style={styles.wordChipRow}>
          {category.words.slice(0, 6).map((word, index) => (
            <View key={category.id + '-' + word + '-' + index} style={styles.wordChip}>
              <Text style={styles.wordChipText}>{word}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.feedbackCategoryText}>{category.messageTr}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    backgroundColor: colors.deepViolet,
    borderBottomColor: colors.comicBorderColor,
    borderBottomWidth: colors.comicBorderWidth,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: colors.primaryPurple,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.md,
    borderWidth: colors.comicBorderWidth,
    height: 46,
    justifyContent: 'center',
    width: 46,
    ...shadows.comicSmall,
  },
  headerCopy: {
    flex: 1,
  },
  kicker: {
    ...typography.small,
    color: colors.yellow,
  },
  headerTitle: {
    ...typography.heading,
    color: colors.white,
    fontWeight: '900',
  },
  scroll: {
    backgroundColor: colors.lavenderBackground,
  },
  content: {
    backgroundColor: colors.lavenderBackground,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  promptCard: {
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.md,
    overflow: 'hidden',
    padding: spacing.xl,
    ...shadows.comic,
  },
  promptTexture: {
    height: 100,
    position: 'absolute',
    right: -12,
    top: -12,
    width: 130,
  },
  promptTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  promptCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  kickerDark: {
    ...typography.small,
    color: colors.royalPurple,
    fontWeight: '900',
  },
  expected: {
    ...typography.heading,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  meaning: {
    ...typography.body,
    color: colors.muted,
  },
  tip: {
    ...typography.small,
    color: colors.deepViolet,
  },
  recorderCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    borderTopColor: colors.yellowCta,
    borderTopWidth: 10,
    gap: spacing.sm,
    padding: spacing.xl,
    ...shadows.lift,
  },
  recordingCard: {
    borderColor: colors.red,
  },
  cancelArmedCard: {
    backgroundColor: '#FFF0F0',
    borderColor: colors.red,
  },
  duration: {
    color: colors.deepViolet,
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 50,
  },
  recordTitle: {
    ...typography.heading,
    color: colors.deepViolet,
    textAlign: 'center',
  },
  body: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
  },
  recordActions: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 176,
    paddingVertical: spacing.md,
  },
  recordPulse: {
    backgroundColor: colors.errorCoral,
    borderColor: colors.comicBorderColor,
    borderRadius: 999,
    borderWidth: 2,
    height: 170,
    position: 'absolute',
    width: 170,
  },
  cancelPulse: {
    backgroundColor: '#C62828',
  },
  recordButton: {
    alignItems: 'center',
    backgroundColor: colors.primaryPurple,
    borderColor: colors.comicBorderColor,
    borderRadius: 90,
    borderWidth: colors.comicBorderWidth,
    height: 158,
    justifyContent: 'center',
    width: 158,
    ...shadows.lift,
  },
  recordButtonActive: {
    backgroundColor: colors.red,
  },
  recordButtonCancel: {
    backgroundColor: '#C62828',
    transform: [{ scale: 0.96 }],
  },
  disabledButton: {
    opacity: 0.5,
  },
  cancelHint: {
    alignItems: 'center',
    backgroundColor: '#FFE7E7',
    borderColor: colors.comicBorderColor,
    borderRadius: radius.pill,
    borderWidth: colors.comicBorderWidth,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.comicSmall,
  },
  cancelHintArmed: {
    backgroundColor: colors.red,
  },
  cancelHintText: {
    ...typography.small,
    color: colors.red,
    fontWeight: '900',
  },
  cancelHintTextArmed: {
    color: colors.white,
  },
  permissionText: {
    ...typography.small,
    color: colors.muted,
    textAlign: 'center',
  },
  cancelMessage: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
    textAlign: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.red,
    fontWeight: '800',
    textAlign: 'center',
  },
  debugPanel: {
    backgroundColor: colors.paperLavender,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.xs,
    opacity: 0.72,
    overflow: 'hidden',
    width: '100%',
  },
  debugHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 34,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  debugTitle: {
    ...typography.micro,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  debugToggle: {
    ...typography.micro,
    color: colors.royalPurple,
    fontWeight: '900',
  },
  debugRows: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    padding: spacing.md,
  },
  debugRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    minHeight: 24,
  },
  debugLabel: {
    ...typography.small,
    color: colors.muted,
    fontWeight: '800',
  },
  debugValue: {
    ...typography.small,
    color: colors.deepViolet,
    flex: 1,
    fontWeight: '900',
    textAlign: 'right',
  },
  retryBox: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    width: '100%',
    ...shadows.comic,
  },
  retryIcon: {
    alignItems: 'center',
    backgroundColor: '#FFE1E1',
    borderColor: colors.comicBorderColor,
    borderRadius: radius.pill,
    borderWidth: colors.comicBorderWidth,
    height: 72,
    justifyContent: 'center',
    width: 72,
    ...shadows.comicSmall,
  },
  retryTitle: {
    ...typography.heading,
    color: colors.deepViolet,
    textAlign: 'center',
  },
  retryBody: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
  },
  noVoiceBox: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    width: '100%',
    ...shadows.comic,
  },
  noVoiceIcon: {
    alignItems: 'center',
    backgroundColor: colors.comicBlueWash,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.pill,
    borderWidth: colors.comicBorderWidth,
    height: 72,
    justifyContent: 'center',
    width: 72,
    ...shadows.comicSmall,
  },
  noVoiceTitle: {
    ...typography.heading,
    color: colors.deepViolet,
    textAlign: 'center',
  },
  noVoiceBody: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
  },
  stateTexture: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  waveWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    height: 104,
    justifyContent: 'center',
  },
  waveBar: {
    backgroundColor: colors.royalPurple,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 76,
    width: 12,
  },
  feedbackCard: {
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    borderTopColor: colors.yellowCta,
    borderTopWidth: 10,
    gap: spacing.md,
    overflow: 'hidden',
    padding: spacing.xl,
    ...shadows.lift,
  },
  resultHero: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  resultHeroCopy: {
    flex: 1,
    gap: 2,
  },
  resultTitle: {
    ...typography.heading,
    fontWeight: '900',
  },
  similarityScore: {
    fontSize: 46,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 50,
  },
  scoreSticker: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    justifyContent: 'center',
    minWidth: 76,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    transform: [{ rotate: '2deg' }],
    ...shadows.comicSmall,
  },
  resultTexture: {
    height: 132,
    position: 'absolute',
    right: -20,
    top: -20,
    width: 160,
  },
  sentenceGrid: {
    gap: spacing.sm,
  },
  sentenceCard: {
    backgroundColor: colors.paperLavender,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.xs,
    padding: spacing.md,
    ...shadows.comicSmall,
  },
  sentenceLabel: {
    ...typography.small,
    color: colors.royalPurple,
    fontWeight: '900',
  },
  transcriptText: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  expectedResultText: {
    ...typography.body,
    color: colors.deepViolet,
  },
  fallbackText: {
    ...typography.small,
    color: colors.muted,
    fontWeight: '800',
  },
  debugChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  debugChip: {
    backgroundColor: colors.softLavenderPanel,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.sm,
    borderWidth: colors.comicBorderWidth,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  debugChipText: {
    ...typography.small,
    color: colors.royalPurple,
    fontWeight: '900',
  },
  feedbackCategoryGrid: {
    gap: spacing.xs,
  },
  feedbackCategoryCard: {
    borderColor: colors.comicBorderColor,
    borderRadius: radius.lg,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.xs,
    padding: spacing.md,
    ...shadows.comicSmall,
  },
  successCategory: {
    backgroundColor: '#ECFDF3',
  },
  warningCategory: {
    backgroundColor: '#FFF2C8',
  },
  infoCategory: {
    backgroundColor: colors.comicBlueWash,
  },
  errorCategory: {
    backgroundColor: '#FFE7E7',
  },
  feedbackCategoryTitle: {
    ...typography.small,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  feedbackCategoryText: {
    ...typography.small,
    color: colors.muted,
    fontWeight: '800',
  },
  wordChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  wordChip: {
    borderColor: colors.comicBorderColor,
    borderRadius: radius.sm,
    borderWidth: colors.comicBorderWidth,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    ...shadows.comicSmall,
  },
  wordChipText: {
    ...typography.small,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  feedbackNote: {
    backgroundColor: colors.comicBlueWash,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.xs,
    padding: spacing.md,
    ...shadows.comicSmall,
  },
  sectionTitle: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  feedbackText: {
    ...typography.body,
    color: colors.deepViolet,
  },
  resultActions: {
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.78,
  },
});
