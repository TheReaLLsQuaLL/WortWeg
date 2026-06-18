import { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, Mic, Square } from 'lucide-react-native';

import { AppButton } from '../components/AppButton';
import { useDetailFooterSpacing } from '../components/layout';
import { SpeakerButton } from '../components/SpeakerButton';
import { TopBar } from '../components/TopBar';
import { colors, radius, spacing, typography } from '../data/theme';
import { withShuffledExamChoices } from '../lib/choiceUtils';
import { getLocalDateKey } from '../lib/date';
import { awardXpForStudy } from '../lib/storage';
import type { RootNavigation, CommitUserState } from '../navigation/AppNavigator';
import { getExamPracticeQuestions, submitExamAnswer } from '../services/examService';
import {
  cleanupRecording,
  getActiveRecordingStatus,
  requestMicrophonePermission,
  startRecording as startAudioRecording,
  stopRecording as stopAudioRecording,
} from '../services/speechService';
import type { AnswerResult } from '../types/exercise';
import type { UserState } from '../types/userState';

type ExamScreenProps = {
  navigation: RootNavigation;
  userState: UserState;
  onUpdateState: CommitUserState;
};

export function ExamScreen({
  navigation,
  userState,
  onUpdateState,
}: ExamScreenProps) {
  const sessionSeedRef = useRef('exam-' + Date.now().toString(36));
  const questions = useMemo(
    () => getExamPracticeQuestions().map((item) => withShuffledExamChoices(item, sessionSeedRef.current)),
    [],
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [results, setResults] = useState<AnswerResult[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingStopping, setRecordingStopping] = useState(false);
  const [recordingDurationMs, setRecordingDurationMs] = useState(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingActionRef = useRef(false);
  const { contentPaddingBottom, footerPaddingBottom } = useDetailFooterSpacing();
  const question = questions[currentIndex];

  const clearRecordingTimer = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearRecordingTimer();
      void cleanupRecording().catch(() => undefined);
    };
  }, []);

  const finishExam = async (finalResults: AnswerResult[]) => {
    const xpEarned = finalResults.reduce((sum, item) => sum + item.xpEarned, 0);
    const score = finalResults.filter((item) => item.correct).length;

    await onUpdateState((state) =>
      awardXpForStudy(
        {
          ...state,
          examBestScore: Math.max(state.examBestScore ?? 0, score),
          examHistory: [
            ...state.examHistory,
            {
              date: getLocalDateKey(),
              score,
              total: questions.length,
              xpEarned,
              mode: 'a1-practice',
            },
          ],
        },
        xpEarned,
      ),
    );

    navigation.navigate('ExamResult', {
      score,
      totalCount: questions.length,
      xpEarned,
    });
  };

  const submit = async () => {
    if (!question || submitting || recordingActionRef.current) {
      return;
    }

    recordingActionRef.current = true;
    setSubmitting(true);
    setPermissionError(null);

    try {
      let answerResult: AnswerResult;

      if (question.section === 'speaking') {
        if (!recording) {
          setPermissionError('Önce kayıt başlatıp cümleyi oku.');
          return;
        }

        setRecordingStopping(true);
        clearRecordingTimer();
        const recordingResult = await stopAudioRecording();
        setRecording(false);
        setRecordingDurationMs(recordingResult.durationMs);
        answerResult = await submitExamAnswer({
          question,
          audioUri: recordingResult.uri,
        });
      } else {
        answerResult = await submitExamAnswer({
          question,
          answer,
        });
      }

      const nextResults = [...results, answerResult];

      setResults(nextResults);
      setResult(answerResult);
    } catch (error) {
      setPermissionError(
        error instanceof Error
          ? error.message
          : 'Cevap kontrol edilirken bir sorun oluştu.',
      );
    } finally {
      setSubmitting(false);
      setRecordingStopping(false);
      recordingActionRef.current = false;
    }
  };

  const next = async () => {
    clearRecordingTimer();

    if (currentIndex === questions.length - 1) {
      await finishExam(results);
      return;
    }

    setCurrentIndex((index) => index + 1);
    setAnswer('');
    setResult(null);
    setRecording(false);
    setRecordingDurationMs(0);
    setPermissionError(null);
  };

  const startRecording = async () => {
    if (recording || submitting || recordingActionRef.current) {
      return;
    }

    recordingActionRef.current = true;
    setPermissionError(null);
    clearRecordingTimer();

    try {
      const permission = await requestMicrophonePermission();

      if (!permission.granted) {
        setPermissionError(
          permission.canAskAgain
            ? 'Mikrofon izni olmadan konuşma sorusunu kaydedemiyoruz.'
            : 'Mikrofon izni kapalı. Telefon ayarlarından WortWeg için mikrofon izni ver.',
        );
        return;
      }

      await startAudioRecording();
      setRecordingDurationMs(0);
      setRecording(true);
      recordingTimerRef.current = setInterval(() => {
        const snapshot = getActiveRecordingStatus();
        setRecordingDurationMs(snapshot.durationMs);
      }, 250);
    } catch (error) {
      clearRecordingTimer();
      setRecording(false);
      setPermissionError(
        error instanceof Error
          ? error.message
          : 'Kayıt başlatılırken bir sorun oluştu.',
      );
    } finally {
      recordingActionRef.current = false;
    }
  };

  if (!question) {
    return null;
  }

  const isChoiceQuestion = Boolean(question.choices);
  const canSubmit =
    question.section === 'speaking'
      ? recording && !recordingStopping && !submitting
      : isChoiceQuestion
        ? Boolean(answer)
        : Boolean(answer.trim());

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
        style={styles.keyboard}
      >
        <TopBar
          streak={userState.streak}
          subtitle={String(currentIndex + 1) + '/' + questions.length + ' soru'}
          title="A1 sınav tarzı pratik"
          xp={userState.xp}
        />
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: contentPaddingBottom }]}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.kicker}>{question.title}</Text>
            <Text style={styles.prompt}>{question.promptTr}</Text>
            {question.text ? (
              <View style={styles.textBox}>
                <Text style={styles.examText}>{question.text}</Text>
                {question.section === 'listening' ? (
                  <SpeakerButton text={question.text} />
                ) : null}
              </View>
            ) : null}
            {question.expectedText ? (
              <View style={styles.textBox}>
                <Text style={styles.examText}>{question.expectedText}</Text>
                <SpeakerButton text={question.expectedText} />
              </View>
            ) : null}
            <Text style={styles.question}>{question.questionTr}</Text>
          </View>

          {question.choices ? (
            <View style={styles.options}>
              {question.choices.map((choice) => (
                <Pressable
                  disabled={result !== null}
                  key={choice.id}
                  onPress={() => setAnswer(choice.id)}
                  style={({ pressed }) => [
                    styles.option,
                    answer === choice.id && styles.selectedOption,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.optionText}>{choice.text}</Text>
                </Pressable>
              ))}
            </View>
          ) : question.section === 'speaking' ? (
            <View style={styles.speakingBox}>
              <Text style={styles.body}>
                Cümleyi yüksek sesle oku. Kaydın yazıya çevrilir ve hedef cümleyle karşılaştırılır.
              </Text>
              <Text style={styles.recordingTime}>
                Süre: {Math.floor(recordingDurationMs / 1000)} sn
              </Text>
              {permissionError ? <Text style={styles.permissionError}>{permissionError}</Text> : null}
              <AppButton
                disabled={submitting || recordingStopping || result !== null}
                icon={recording ? Square : Mic}
                loading={submitting || recordingStopping}
                onPress={recording ? submit : startRecording}
                title={recordingStopping ? 'Kayıt duruyor' : recording ? 'Kaydı değerlendir' : 'Kayıt başlat'}
                variant={recording ? 'primary' : 'secondary'}
              />
            </View>
          ) : (
            <TextInput
              editable={result === null}
              multiline
              onChangeText={setAnswer}
              placeholder="Almanca cevabını yaz"
              placeholderTextColor={colors.muted}
              style={styles.textArea}
              value={answer}
            />
          )}

          {result ? (
            <View
              style={[
                styles.feedback,
                result.correct ? styles.correctFeedback : styles.wrongFeedback,
              ]}
            >
              <Text style={styles.feedbackTitle}>
                {result.correct ? 'Başarılı' : 'Geliştirilebilir'}
              </Text>
              <Text style={styles.feedbackText}>{result.feedback}</Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: footerPaddingBottom }]}>
          {result ? (
            <AppButton
              icon={Check}
              onPress={next}
              title={currentIndex === questions.length - 1 ? 'Sonucu gör' : 'Sonraki soru'}
            />
          ) : question.section === 'speaking' ? null : (
            <AppButton
              disabled={!canSubmit}
              loading={submitting}
              onPress={submit}
              title="Cevabı kontrol et"
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.deepViolet,
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  content: {
    backgroundColor: colors.surface,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  kicker: {
    ...typography.small,
    color: colors.royalPurple,
  },
  prompt: {
    ...typography.body,
    color: colors.muted,
  },
  textBox: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  examText: {
    ...typography.body,
    color: colors.deepViolet,
    flex: 1,
  },
  question: {
    ...typography.heading,
    color: colors.deepViolet,
  },
  options: {
    gap: spacing.md,
  },
  option: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: 58,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  selectedOption: {
    backgroundColor: colors.lavender,
    borderColor: colors.royalPurple,
  },
  optionText: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '800',
  },
  speakingBox: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  body: {
    ...typography.body,
    color: colors.muted,
  },
  recordingTime: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  permissionError: {
    ...typography.body,
    color: colors.red,
    fontWeight: '800',
  },
  textArea: {
    ...typography.body,
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.deepViolet,
    minHeight: 150,
    padding: spacing.md,
    textAlignVertical: 'top',
  },
  feedback: {
    borderRadius: radius.md,
    gap: spacing.xs,
    padding: spacing.md,
  },
  correctFeedback: {
    backgroundColor: '#DFF7EB',
  },
  wrongFeedback: {
    backgroundColor: '#FFE5E5',
  },
  feedbackTitle: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  feedbackText: {
    ...typography.small,
    color: colors.deepViolet,
  },
  footer: {
    backgroundColor: colors.white,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    bottom: 0,
    elevation: 10,
    left: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    position: 'absolute',
    right: 0,
    shadowColor: colors.deepViolet,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  pressed: {
    opacity: 0.78,
  },
});
