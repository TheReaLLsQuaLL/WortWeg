import { useMemo, useState } from 'react';
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
import { ArrowLeft, Check, CheckCircle2, Home, MessageCircle, ClipboardCheck, XCircle } from 'lucide-react-native';

import { AppButton } from '../components/AppButton';
import { AnimatedCard } from '../components/AnimatedCard';
import { AppCard } from '../components/AppCard';
import { FeedbackBanner } from '../components/FeedbackBanner';
import { HalftoneAccent } from '../components/HalftoneAccent';
import { useDetailFooterSpacing } from '../components/layout';
import { getLessonById } from '../data/lessons';
import { colors, radius, shadows, spacing, typography } from '../data/theme';
import { buildExercisesForLesson, checkExerciseAnswer } from '../lib/exerciseBuilder';
import { trackLocalEvent } from '../services/localEventLog';
import type { CommitUserState, RootNavigation } from '../navigation/AppNavigator';
import type { UserState, Mistake } from '../types/userState';
import type { AnswerResult, Exercise } from '../types/exercise';
import { getChoiceText, shuffleWithSeed, withShuffledExerciseChoices } from '../lib/choiceUtils';

const truncateText = (text: string, length = 100) => text.length > length ? text.slice(0, length) + '...' : text;

const buildMistakePrompt = (mistake: Mistake) => {
  let prompt = `Şu Almanca hatamı açıklar mısın? Soru: "${truncateText(mistake.prompt)}" Benim cevabım: "${truncateText(mistake.userAnswer)}" Doğru cevap: "${truncateText(mistake.expectedAnswer)}". Kısa ve Türkçe anlat, sonra 1 benzer örnek ver.`;
  if (mistake.feedbackTr && mistake.feedbackTr.length < 150) {
    prompt += ` Önceki açıklama: "${mistake.feedbackTr}"`;
  }
  return prompt;
};

type MistakePracticeScreenProps = {
  navigation: RootNavigation;
  userState: UserState;
  onUpdateState: CommitUserState;
};

export function MistakePracticeScreen({ navigation, userState, onUpdateState }: MistakePracticeScreenProps) {
  const { contentPaddingBottom, footerPaddingBottom } = useDetailFooterSpacing();
  
  const [practiceQueue] = useState<Mistake[]>(() => {
    return [...userState.mistakes].reverse().slice(0, 5);
  });
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [writtenAnswer, setWrittenAnswer] = useState('');
  const [result, setResult] = useState<AnswerResult | null>(null);

  const mistake = practiceQueue[currentIndex];
  
  const originalExercise = useMemo(() => {
    if (!mistake) return null;
    const lesson = getLessonById(mistake.lessonId);
    if (!lesson) return null;
    const exercises = buildExercisesForLesson(lesson);
    const exercise = exercises.find((e) => e.id === mistake.exerciseId);
    if (!exercise) return null;
    
    // We only support interactive mode for simple choices or text input
    if (exercise.type === 'sentenceBuild') {
      return null;
    }
    
    // Shuffle choices if multiple choice
    if (exercise.choices || exercise.options) {
      return withShuffledExerciseChoices(exercise, 'practice-' + mistake.id);
    }
    
    return exercise;
  }, [mistake]);

  const isFallback = !originalExercise;

  const answer = originalExercise?.choices ? selectedAnswer : writtenAnswer;

  const submitAnswer = async () => {
    if (!originalExercise || !mistake || result || !answer.trim()) return;

    const checked = checkExerciseAnswer(originalExercise, answer);
    setResult(checked);

    if (checked.correct) {
      await onUpdateState((state) => ({
        ...state,
        mistakes: state.mistakes.filter((m) => m.id !== mistake.id),
      }));
    }
  };

  const goNext = () => {
    setCurrentIndex((prev) => prev + 1);
    setSelectedAnswer('');
    setWrittenAnswer('');
    setResult(null);
  };

  const goFallbackNext = () => {
    goNext();
  };

  const isComplete = practiceQueue.length > 0 && currentIndex >= practiceQueue.length;

  if (practiceQueue.length === 0) {
    return (
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.iconButton}>
            <ArrowLeft color={colors.deepViolet} size={22} strokeWidth={3} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>Zayıf Nokta Pratiği</Text>
          </View>
        </View>
        <View style={styles.center}>
          <CheckCircle2 color={colors.green} size={64} style={{ marginBottom: spacing.md }} />
          <Text style={styles.title}>Henüz tekrar edilecek hata yok.</Text>
          <Text style={styles.subtitle}>Ders çözmeye devam ettikçe burada zayıf noktaların görünür.</Text>
          <AppButton onPress={() => navigation.goBack()} title="Geri dön" style={{ marginTop: spacing.xl }} />
        </View>
      </SafeAreaView>
    );
  }

  if (isComplete) {
    return (
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.center}>
          <HalftoneAccent color={colors.yellowCta} opacity={0.1} size="large" style={styles.completeTexture} />
          <CheckCircle2 color={colors.green} size={80} strokeWidth={3} style={{ marginBottom: spacing.md }} />
          <Text style={styles.title}>Tekrar tamamlandı</Text>
          <Text style={styles.subtitle}>Zayıf noktalarını gözden geçirdin.</Text>
          
          <View style={styles.completeActions}>
            <AppButton
              icon={Home}
              onPress={() => navigation.navigate('Mistakes')}
              title="Hatalara dön"
            />
            <AppButton
              icon={MessageCircle}
              onPress={() => navigation.navigate('Chat')}
              title="Wolli'ye sor"
              variant="secondary"
            />
            <AppButton
              icon={ClipboardCheck}
              onPress={() => navigation.navigate('Main', { initialTab: 'exam' })}
              title="Sınav çöz"
              variant="secondary"
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!mistake) return null;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.iconButton}>
            <ArrowLeft color={colors.deepViolet} size={22} strokeWidth={3} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.kicker}>Soru {currentIndex + 1} / {practiceQueue.length}</Text>
            <Text style={styles.headerTitle}>Zayıf Nokta Pratiği</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: contentPaddingBottom }]}
          keyboardShouldPersistTaps="handled"
        >
          {isFallback ? (
            <AnimatedCard style={styles.promptCard}>
              <View style={styles.promptMeta}>
                <Text style={styles.prompt}>Tekrar Gözden Geçir</Text>
              </View>
              <Text style={styles.question}>{mistake.prompt}</Text>
              
              <View style={styles.fallbackBox}>
                <Text style={styles.fallbackLabel}>Senin cevabın:</Text>
                <View style={styles.fallbackWrong}>
                  <XCircle color={colors.red} size={18} />
                  <Text style={styles.fallbackWrongText}>{mistake.userAnswer}</Text>
                </View>
              </View>

              <View style={styles.fallbackBox}>
                <Text style={styles.fallbackLabel}>Doğru cevap:</Text>
                <View style={styles.fallbackCorrect}>
                  <CheckCircle2 color={colors.green} size={18} />
                  <Text style={styles.fallbackCorrectText}>{mistake.expectedAnswer}</Text>
                </View>
              </View>

              <Text style={styles.fallbackFeedback}>{mistake.feedbackTr}</Text>
            </AnimatedCard>
          ) : (
            <>
              <AnimatedCard style={styles.promptCard}>
                <View style={styles.promptMeta}>
                  <Text style={styles.prompt}>{originalExercise.prompt}</Text>
                </View>
                <Text style={styles.question}>{originalExercise.question}</Text>
              </AnimatedCard>

              {originalExercise.choices ? (
                <View style={styles.options}>
                  {originalExercise.choices.map((choice) => {
                    const isSelected = selectedAnswer === choice.id;
                    const isCorrect = result?.correct && isSelected;
                    const isWrong = result && !result.correct && isSelected;
                    return (
                      <Pressable
                        key={choice.id}
                        onPress={result ? undefined : () => setSelectedAnswer(choice.id)}
                        style={({ pressed }) => [
                          styles.optionCard,
                          isSelected && styles.optionSelected,
                          isCorrect && styles.optionCorrect,
                          isWrong && styles.optionWrong,
                          pressed && { opacity: 0.8 },
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            isSelected && styles.optionTextSelected,
                            isCorrect && styles.optionTextCorrect,
                            isWrong && styles.optionTextWrong,
                          ]}
                        >
                          {choice.text}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : originalExercise.options ? (
                <View style={styles.options}>
                  {originalExercise.options.map((option) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrect = result?.correct && isSelected;
                    const isWrong = result && !result.correct && isSelected;
                    return (
                      <Pressable
                        key={option}
                        onPress={result ? undefined : () => setSelectedAnswer(option)}
                        style={({ pressed }) => [
                          styles.optionCard,
                          isSelected && styles.optionSelected,
                          isCorrect && styles.optionCorrect,
                          isWrong && styles.optionWrong,
                          pressed && { opacity: 0.8 },
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            isSelected && styles.optionTextSelected,
                            isCorrect && styles.optionTextCorrect,
                            isWrong && styles.optionTextWrong,
                          ]}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.inputContainer}>
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                    editable={!result}
                    onChangeText={setWrittenAnswer}
                    onSubmitEditing={submitAnswer}
                    placeholder="Almanca yaz..."
                    placeholderTextColor={colors.muted}
                    style={styles.input}
                    value={writtenAnswer}
                  />
                </View>
              )}
            </>
          )}

          {result ? (
            <FeedbackBanner
              tone={result.correct ? 'success' : 'error'}
              title={result.correct ? 'Doğru!' : 'Yanlış'}
            >
              {result.feedback ? <Text style={{ color: result.correct ? colors.green : colors.red }}>{result.feedback}</Text> : null}
            </FeedbackBanner>
          ) : null}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: footerPaddingBottom }]}>
          {isFallback ? (
            <View style={{ gap: spacing.sm }}>
              <AppButton onPress={goFallbackNext} title="Anladım" />
              <AppButton
                onPress={() => navigation.navigate('Chat', { initialPrompt: mistake ? buildMistakePrompt(mistake) : undefined })}
                title="Wolli'ye sor"
                variant="secondary"
              />
            </View>
          ) : result ? (
            <View style={{ gap: spacing.sm }}>
              <AppButton icon={Check} onPress={goNext} title="Devam et" />
              {!result.correct && (
                <AppButton
                  onPress={() => navigation.navigate('Chat', { initialPrompt: mistake ? buildMistakePrompt(mistake) : undefined })}
                  title="Wolli'ye sor"
                  variant="secondary"
                />
              )}
            </View>
          ) : (
            <AppButton
              disabled={!answer.trim()}
              onPress={submitAnswer}
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
    backgroundColor: colors.lavenderBackground,
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.lavenderBackground,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: colors.white,
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
    color: colors.muted,
    fontWeight: '900',
  },
  headerTitle: {
    ...typography.heading,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  content: {
    backgroundColor: colors.lavenderBackground,
    flexGrow: 1,
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  promptCard: {
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    borderTopColor: colors.primaryPurple,
    borderTopWidth: 8,
    gap: spacing.sm,
    padding: spacing.lg,
    ...shadows.comicSmall,
  },
  promptMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  prompt: {
    ...typography.small,
    color: colors.royalPurple,
    fontWeight: '900',
  },
  question: {
    ...typography.heading,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  options: {
    gap: spacing.sm,
  },
  optionCard: {
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.md,
    borderWidth: colors.comicBorderWidth,
    padding: spacing.md,
  },
  optionSelected: {
    backgroundColor: colors.paperLavender,
    borderColor: colors.royalPurple,
  },
  optionCorrect: {
    backgroundColor: '#DCFCE7',
    borderColor: colors.green,
  },
  optionWrong: {
    backgroundColor: '#FEE2E2',
    borderColor: colors.red,
  },
  optionText: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '700',
    textAlign: 'center',
  },
  optionTextSelected: {
    color: colors.royalPurple,
  },
  optionTextCorrect: {
    color: colors.green,
  },
  optionTextWrong: {
    color: colors.red,
  },
  inputContainer: {
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...shadows.comicSmall,
  },
  input: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '700',
  },
  footer: {
    backgroundColor: colors.white,
    borderTopColor: colors.lavenderBackground,
    borderTopWidth: 2,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  center: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: {
    ...typography.heading,
    color: colors.deepViolet,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  completeTexture: {
    height: 200,
    position: 'absolute',
    top: 100,
    width: 200,
  },
  completeActions: {
    gap: spacing.sm,
    marginTop: spacing.xl,
    width: '100%',
  },
  fallbackBox: {
    marginTop: spacing.md,
  },
  fallbackLabel: {
    ...typography.small,
    color: colors.muted,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  fallbackWrong: {
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderColor: colors.red,
    borderRadius: radius.md,
    borderWidth: 2,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  fallbackWrongText: {
    ...typography.body,
    color: colors.red,
    fontWeight: '700',
  },
  fallbackCorrect: {
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderColor: colors.green,
    borderRadius: radius.md,
    borderWidth: 2,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  fallbackCorrectText: {
    ...typography.body,
    color: colors.green,
    fontWeight: '700',
  },
  fallbackFeedback: {
    ...typography.small,
    color: colors.royalPurple,
    fontWeight: '600',
    marginTop: spacing.md,
  },
});
