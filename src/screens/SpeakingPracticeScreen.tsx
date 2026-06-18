import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import { ArrowLeft, CheckCircle2, Mic, Play, RotateCcw, Square } from 'lucide-react-native';

import { AppButton } from '../components/AppButton';
import { AppScrollView, Screen } from '../components/layout';
import { SpeakerButton } from '../components/SpeakerButton';
import { colors, radius, spacing, typography } from '../data/theme';
import { speakingPromptsA1 } from '../data/speaking.a1';
import type { RootNavigation, RootStackParamList } from '../navigation/AppNavigator';
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
  type TranscriptionResult,
} from '../services/speechService';
import { trackLocalEvent } from '../services/localEventLog';

type SpeakingPracticeScreenProps = {
  navigation: RootNavigation;
  route: RouteProp<RootStackParamList, 'SpeakingPractice'>;
};

type PracticeStatus =
  | 'idle'
  | 'requestingPermission'
  | 'recording'
  | 'stopping'
  | 'recorded'
  | 'transcribing'
  | 'scored'
  | 'error';

const formatDuration = (durationMs: number) => {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');

  return minutes + ':' + seconds;
};

const getPermissionText = (permission: MicrophonePermissionResult | null) => {
  if (!permission) {
    return 'Mikrofon izni henüz sorulmadı.';
  }

  if (permission.granted) {
    return 'Mikrofon izni verildi.';
  }

  return permission.canAskAgain
    ? 'Mikrofon izni gerekli. Kayda başlarken tekrar sorulacak.'
    : 'Mikrofon izni kapalı. Telefon ayarlarından WortWeg için mikrofon izni ver.';
};

const blockedRecordStates: PracticeStatus[] = [
  'requestingPermission',
  'recording',
  'stopping',
  'transcribing',
];

export function SpeakingPracticeScreen({ navigation, route }: SpeakingPracticeScreenProps) {
  const initialIndex = Math.max(
    0,
    speakingPromptsA1.findIndex((prompt) => prompt.id === route.params?.promptId),
  );
  const [promptIndex, setPromptIndex] = useState(initialIndex === -1 ? 0 : initialIndex);
  const [permission, setPermission] = useState<MicrophonePermissionResult | null>(null);
  const [status, setStatus] = useState<PracticeStatus>('idle');
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState(0);
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null);
  const [pronunciationResult, setPronunciationResult] = useState<PronunciationScore | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [replaying, setReplaying] = useState(false);
  const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const replayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actionLockedRef = useRef(false);
  const mountedRef = useRef(true);
  const pulseOpacity = useRef(new Animated.Value(0)).current;

  const prompt = speakingPromptsA1[promptIndex] ?? speakingPromptsA1[0]!;
  const progressText = useMemo(
    () => String(promptIndex + 1) + '/' + speakingPromptsA1.length,
    [promptIndex],
  );
  const canRecord = !blockedRecordStates.includes(status);
  const canStop = status === 'recording';
  const canReplay = Boolean(audioUri) && !['recording', 'stopping', 'requestingPermission'].includes(status);
  const canMovePrompt = !['recording', 'stopping', 'requestingPermission', 'transcribing'].includes(status);

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

  const setSafeStatus = (nextStatus: PracticeStatus) => {
    if (mountedRef.current) {
      setStatus(nextStatus);
    }
  };

  useEffect(() => {
    trackLocalEvent({ type: 'speaking_opened', screen: 'SpeakingPractice' });
  }, []);

  useEffect(() => {
    if (status !== 'recording') {
      pulseOpacity.setValue(0);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseOpacity, { toValue: 0.28, duration: 520, useNativeDriver: true }),
        Animated.timing(pulseOpacity, { toValue: 0, duration: 520, useNativeDriver: true }),
      ]),
    );
    loop.start();

    return () => loop.stop();
  }, [pulseOpacity, status]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      clearDurationTimer();
      clearReplayTimer();
      void cleanupRecording().catch(() => undefined);
    };
  }, []);

  const clearFeedback = () => {
    setAudioUri(null);
    setDurationMs(0);
    setTranscriptionResult(null);
    setPronunciationResult(null);
    setErrorMessage(null);
    setReplaying(false);
    clearReplayTimer();
  };

  const beginRecording = async () => {
    if (!canRecord || actionLockedRef.current) {
      return;
    }

    actionLockedRef.current = true;
    clearDurationTimer();
    clearFeedback();
    setSafeStatus('requestingPermission');

    try {
      const nextPermission = await requestMicrophonePermission();

      if (!mountedRef.current) {
        return;
      }

      setPermission(nextPermission);

      if (!nextPermission.granted) {
        setErrorMessage(
          nextPermission.canAskAgain
            ? 'Mikrofon izni olmadan kayıt alamıyoruz. Lütfen izin ver.'
            : 'Mikrofon izni kapalı. Telefon ayarlarından WortWeg için mikrofon iznini aç.',
        );
        setSafeStatus('error');
        return;
      }

      await startRecording();
      trackLocalEvent({ type: 'recording_started', screen: 'SpeakingPractice' });

      if (!mountedRef.current) {
        await cleanupRecording().catch(() => undefined);
        return;
      }

      setDurationMs(0);
      setSafeStatus('recording');
      durationTimerRef.current = setInterval(() => {
        const snapshot = getActiveRecordingStatus();
        setDurationMs(snapshot.durationMs);
      }, 250);
    } catch (error) {
      clearDurationTimer();
      setSafeStatus('error');
      trackLocalEvent({
        type: 'recording_error',
        screen: 'SpeakingPractice',
        action: 'start_recording',
        severity: 'error',
      });
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Kayıt başlatılırken bir sorun oluştu.',
      );
    } finally {
      actionLockedRef.current = false;
    }
  };

  const finishRecording = async () => {
    if (!canStop || actionLockedRef.current) {
      return;
    }

    actionLockedRef.current = true;
    clearDurationTimer();
    setSafeStatus('stopping');
    setErrorMessage(null);

    try {
      const recording = await stopRecording();
      trackLocalEvent({
        type: 'recording_stopped',
        screen: 'SpeakingPractice',
        metadata: { durationMs: recording.durationMs },
      });

      if (!mountedRef.current) {
        return;
      }

      setAudioUri(recording.uri);
      setDurationMs(recording.durationMs);
      setSafeStatus('recorded');
      setSafeStatus('transcribing');

      const nextTranscriptionResult = await transcribeGerman(recording.uri, prompt.expectedText);

      if (__DEV__) {
        console.log('[WortWeg Speech UI] transcription result', {
          provider: nextTranscriptionResult.provider,
          modelUsed: nextTranscriptionResult.modelUsed,
          fallback: nextTranscriptionResult.fallback,
          hasTranscript: Boolean(nextTranscriptionResult.transcript),
          transcriptLength: nextTranscriptionResult.transcript.length,
        });
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
      setSafeStatus('scored');
    } catch (error) {
      clearDurationTimer();
      setSafeStatus('error');
      trackLocalEvent({
        type: 'recording_error',
        screen: 'SpeakingPractice',
        action: 'stop_recording',
        severity: 'error',
      });
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Kayıt durdurulurken bir sorun oluştu.',
      );
    } finally {
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
      setErrorMessage(null);
      await replayRecording(audioUri);
      replayTimerRef.current = setTimeout(() => {
        if (mountedRef.current) {
          setReplaying(false);
        }
      }, Math.max(900, durationMs));
    } catch (error) {
      clearReplayTimer();
      setReplaying(false);
      trackLocalEvent({
        type: 'recording_error',
        screen: 'SpeakingPractice',
        action: 'replay_recording',
        severity: 'error',
      });
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Kaydı oynatırken bir sorun oluştu.',
      );
    }
  };

  const retryCurrentPrompt = () => {
    if (!canMovePrompt) {
      return;
    }

    clearDurationTimer();
    clearFeedback();
    setSafeStatus('idle');
  };

  const nextPrompt = () => {
    if (!canMovePrompt) {
      return;
    }

    clearDurationTimer();
    clearFeedback();
    setSafeStatus('idle');
    setPromptIndex((index) => (index + 1) % speakingPromptsA1.length);
  };

  const statusCopy = (() => {
    switch (status) {
      case 'requestingPermission':
        return 'Mikrofon izni kontrol ediliyor.';
      case 'recording':
        return 'Kaydediliyor. Cümleyi net ve sakin oku.';
      case 'stopping':
        return 'Kayıt güvenli şekilde durduruluyor.';
      case 'transcribing':
        return 'Sesin yazıya çevriliyor.';
      case 'scored':
      case 'recorded':
        return 'Kaydın hazır. Dinleyebilir veya tekrar kaydedebilirsin.';
      case 'error':
        return 'Sorunu düzeltip tekrar deneyebilirsin.';
      default:
        return 'Hazır olduğunda kayıt butonuna bas.';
    }
  })();

  return (
    <Screen backgroundColor={colors.deepViolet}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={styles.iconButton}
        >
          <ArrowLeft color={colors.white} size={22} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.kicker}>A1 konuşma pratiği · {progressText}</Text>
          <Text style={styles.headerTitle}>Sesini kaydet</Text>
        </View>
      </View>

      <AppScrollView contentContainerStyle={styles.content} style={styles.scroll}>
        <View style={styles.promptCard}>
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

        <View style={styles.permissionCard}>
          <Text style={styles.sectionTitle}>Mikrofon durumu</Text>
          <Text style={styles.body}>{getPermissionText(permission)}</Text>
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        </View>

        <View style={[styles.recorderCard, status === 'recording' && styles.recordingCard]}>
          <Text style={styles.duration}>{formatDuration(durationMs)}</Text>
          <Text style={styles.body}>{statusCopy}</Text>

          <View style={styles.recordActions}>
            {status === 'recording' ? <Animated.View pointerEvents="none" style={[styles.recordPulse, { opacity: pulseOpacity }]} /> : null}
            {status === 'recording' || status === 'stopping' ? (
              <Pressable
                accessibilityRole="button"
                disabled={!canStop}
                onPress={finishRecording}
                style={({ pressed }) => [
                  styles.recordButton,
                  styles.stopButton,
                  !canStop && styles.disabledButton,
                  pressed && canStop && styles.pressed,
                ]}
              >
                <Square color={colors.white} fill={colors.white} size={34} />
                <Text style={styles.recordButtonText}>{status === 'stopping' ? 'Duruyor' : 'Durdur'}</Text>
              </Pressable>
            ) : (
              <Pressable
                accessibilityRole="button"
                disabled={!canRecord}
                onPress={beginRecording}
                style={({ pressed }) => [
                  styles.recordButton,
                  !canRecord && styles.disabledButton,
                  pressed && canRecord && styles.pressed,
                ]}
              >
                <Mic color={colors.white} size={38} strokeWidth={2.8} />
                <Text style={styles.recordButtonText}>
                  {audioUri ? 'Tekrar kaydet' : 'Kaydet'}
                </Text>
              </Pressable>
            )}
          </View>

          <View style={styles.secondaryActions}>
            <AppButton
              disabled={!canReplay}
              icon={Play}
              loading={replaying}
              onPress={replay}
              title="Dinle"
              variant="secondary"
            />
            <AppButton
              disabled={!canMovePrompt}
              icon={RotateCcw}
              onPress={nextPrompt}
              title="Sonraki cümle"
              variant="secondary"
            />
          </View>
        </View>

        {status === 'transcribing' ? (
          <View style={styles.feedbackCard}>
            <Text style={styles.sectionTitle}>Geri bildirim hazırlanıyor</Text>
            <Text style={styles.body}>
              Önce söylediğin cümle yazıya çevrilecek. Sonra hedef cümleyle karşılaştıracağız.
            </Text>
          </View>
        ) : null}

        {transcriptionResult && pronunciationResult ? (
          <View style={styles.feedbackCard}>
            <View style={styles.feedbackHeader}>
              <CheckCircle2 color={colors.green} size={24} />
              <Text style={styles.sectionTitle}>Sonuç</Text>
            </View>

            <View style={styles.resultSection}>
              <Text style={styles.sectionTitle}>Beklenen cümle</Text>
              <Text style={styles.expectedResultText}>{prompt.expectedText}</Text>
            </View>

            <View style={styles.resultSection}>
              <Text style={styles.sectionTitle}>Söylediğin cümle</Text>
              <Text style={styles.transcriptText}>
                {transcriptionResult.transcript || 'Metin alınamadı.'}
              </Text>
              {transcriptionResult.fallback ? (
                <Text style={styles.fallbackText}>Şimdilik yerel tahmin kullanıldı.</Text>
              ) : null}
              {__DEV__ ? (
                <View style={styles.debugChipRow}>
                  <View style={styles.debugChip}>
                    <Text style={styles.debugChipText}>STT: {transcriptionResult.provider ?? 'unknown'}</Text>
                  </View>
                  <View style={styles.debugChip}>
                    <Text style={styles.debugChipText}>model: {transcriptionResult.modelUsed ?? 'unknown'}</Text>
                  </View>
                  <View style={styles.debugChip}>
                    <Text style={styles.debugChipText}>fallback: {String(transcriptionResult.fallback ?? false)}</Text>
                  </View>
                </View>
              ) : null}
            </View>

            <View style={styles.resultSection}>
              <View style={styles.comparisonHeaderRow}>
                <View style={styles.flexCopy}>
                  <Text style={styles.sectionTitle}>Hedefe yakınlık</Text>
                  <Text style={styles.body}>{pronunciationResult.comparison.shortFeedbackTr}</Text>
                </View>
                <Text style={[
                  styles.similarityScore,
                  pronunciationResult.comparison.similarityBucket === 'high'
                    ? styles.similarityHigh
                    : pronunciationResult.comparison.similarityBucket === 'medium'
                      ? styles.similarityMedium
                      : styles.similarityLow,
                ]}>{pronunciationResult.comparison.similarityScore}</Text>
              </View>
              <View style={styles.wordGroup}>
                <Text style={styles.wordGroupTitle}>Eşleşen</Text>
                <View style={styles.wordChipRow}>
                  {pronunciationResult.comparison.matchedWords.length > 0 ? pronunciationResult.comparison.matchedWords.map((word, index) => (
                    <View key={'matched-' + word + '-' + index} style={[styles.wordChip, styles.matchedChip]}>
                      <Text style={styles.wordChipText}>{word}</Text>
                    </View>
                  )) : (
                    <Text style={styles.emptyChipText}>Henüz yok</Text>
                  )}
                </View>
              </View>
              {pronunciationResult.comparison.missingWords.length > 0 ? (
                <View style={styles.wordGroup}>
                  <Text style={styles.wordGroupTitle}>Eksik</Text>
                  <View style={styles.wordChipRow}>
                    {pronunciationResult.comparison.missingWords.map((word, index) => (
                      <View key={'missing-' + word + '-' + index} style={[styles.wordChip, styles.missingChip]}>
                        <Text style={styles.wordChipText}>{word}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}
              {pronunciationResult.comparison.extraWords.length > 0 ? (
                <View style={styles.wordGroup}>
                  <Text style={styles.wordGroupTitle}>Ekstra</Text>
                  <View style={styles.wordChipRow}>
                    {pronunciationResult.comparison.extraWords.map((word, index) => (
                      <View key={'extra-' + word + '-' + index} style={[styles.wordChip, styles.extraChip]}>
                        <Text style={styles.wordChipText}>{word}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}
            </View>

            <View style={styles.resultSection}>
              <View style={styles.pronunciationHeaderRow}>
                <Text style={styles.sectionTitle}>Pratik geri bildirimi</Text>
                {__DEV__ && pronunciationResult.isMock ? (
                  <View style={styles.mockTag}>
                    <Text style={styles.mockTagText}>DEV</Text>
                  </View>
                ) : null}
              </View>
              {__DEV__ && pronunciationResult.isMock ? (
                <Text style={styles.devFallback}>pronunciation: mock</Text>
              ) : null}
              <Text style={styles.feedbackText}>{pronunciationResult.feedbackTr}</Text>
              {__DEV__ ? (
                <View style={styles.scoreGrid}>
                  <View style={styles.scorePill}>
                    <Text style={styles.scorePillValue}>{pronunciationResult.pronunciationScore}</Text>
                    <Text style={styles.scorePillLabel}>DEV puan</Text>
                  </View>
                  <View style={styles.scorePill}>
                    <Text style={styles.scorePillValue}>{pronunciationResult.accuracyScore}</Text>
                    <Text style={styles.scorePillLabel}>Eşleşme</Text>
                  </View>
                  <View style={styles.scorePill}>
                    <Text style={styles.scorePillValue}>{pronunciationResult.completenessScore}</Text>
                    <Text style={styles.scorePillLabel}>Tamlık</Text>
                  </View>
                </View>
              ) : null}
              {pronunciationResult.wordFeedback.map((item) => (
                <View key={item.word} style={styles.wordFeedback}>
                  <Text style={styles.wordTitle}>{item.word}</Text>
                  <Text style={styles.body}>{item.issue}</Text>
                  <Text style={styles.tip}>{item.suggestionTr}</Text>
                </View>
              ))}
            </View>

            <View style={styles.resultActions}>
              <AppButton
                icon={RotateCcw}
                onPress={retryCurrentPrompt}
                title="Tekrar dene"
              />
              <AppButton
                onPress={nextPrompt}
                title="Başka cümle"
                variant="secondary"
              />
            </View>
          </View>
        ) : null}
      </AppScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    backgroundColor: colors.deepViolet,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.sm,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  headerCopy: {
    flex: 1,
  },
  flexCopy: {
    flex: 1,
  },
  kicker: {
    ...typography.small,
    color: colors.yellow,
  },
  headerTitle: {
    ...typography.heading,
    color: colors.white,
  },
  scroll: {
    backgroundColor: colors.surface,
  },
  content: {
    backgroundColor: colors.surface,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  promptCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
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
  },
  expected: {
    ...typography.heading,
    color: colors.deepViolet,
  },
  meaning: {
    ...typography.body,
    color: colors.muted,
  },
  tip: {
    ...typography.small,
    color: colors.deepViolet,
  },
  permissionCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  body: {
    ...typography.body,
    color: colors.muted,
  },
  errorText: {
    ...typography.body,
    color: colors.red,
    fontWeight: '800',
  },
  recorderCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  recordingCard: {
    borderColor: colors.red,
  },
  duration: {
    color: colors.deepViolet,
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 50,
  },
  recordActions: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  recordPulse: {
    backgroundColor: colors.red,
    borderRadius: 999,
    height: 156,
    position: 'absolute',
    top: 2,
    width: 156,
  },
  recordButton: {
    alignItems: 'center',
    backgroundColor: colors.royalPurple,
    borderRadius: 72,
    elevation: 6,
    gap: spacing.xs,
    height: 136,
    justifyContent: 'center',
    shadowColor: colors.deepViolet,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    width: 136,
  },
  stopButton: {
    backgroundColor: colors.red,
  },
  disabledButton: {
    opacity: 0.5,
  },
  recordButtonText: {
    ...typography.small,
    color: colors.white,
  },
  secondaryActions: {
    alignSelf: 'stretch',
    gap: spacing.sm,
  },
  feedbackCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  feedbackHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  resultRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  scoreValue: {
    color: colors.green,
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 58,
  },
  resultCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  resultSection: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    gap: spacing.sm,
    padding: spacing.md,
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
    backgroundColor: colors.lavender,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  debugChipText: {
    ...typography.small,
    color: colors.royalPurple,
    fontWeight: '900',
  },
  comparisonHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  similarityScore: {
    color: colors.royalPurple,
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 48,
  },
  similarityHigh: {
    color: colors.green,
  },
  similarityMedium: {
    color: '#A66500',
  },
  similarityLow: {
    color: colors.red,
  },
  resultActions: {
    gap: spacing.sm,
  },
  wordGroup: {
    gap: spacing.xs,
  },
  wordGroupTitle: {
    ...typography.small,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  wordChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  wordChip: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  matchedChip: {
    backgroundColor: '#DFF8EA',
  },
  missingChip: {
    backgroundColor: '#FFE7E7',
  },
  extraChip: {
    backgroundColor: '#FFF2C8',
  },
  wordChipText: {
    ...typography.small,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  emptyChipText: {
    ...typography.small,
    color: colors.muted,
  },
  pronunciationHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  mockTag: {
    backgroundColor: colors.yellow,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  mockTagText: {
    ...typography.small,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  scoreLabel: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  scoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  scorePill: {
    backgroundColor: colors.lavender,
    borderRadius: radius.sm,
    flexGrow: 1,
    minWidth: 92,
    padding: spacing.md,
  },
  scorePillValue: {
    ...typography.heading,
    color: colors.royalPurple,
  },
  scorePillLabel: {
    ...typography.small,
    color: colors.deepViolet,
  },
  feedbackText: {
    ...typography.body,
    color: colors.deepViolet,
  },
  devFallback: {
    ...typography.small,
    color: colors.royalPurple,
    fontWeight: '900',
  },
  wordFeedback: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    gap: spacing.xs,
    padding: spacing.md,
  },
  wordTitle: {
    ...typography.body,
    color: colors.royalPurple,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.78,
  },
});
