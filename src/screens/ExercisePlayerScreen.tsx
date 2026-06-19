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
import type { RouteProp } from '@react-navigation/native';
import { ArrowLeft, BookOpen, Check, CheckCircle2, Home, Mic, NotebookTabs, RotateCcw } from 'lucide-react-native';

import { AnimatedCard } from '../components/AnimatedCard';
import { AppButton } from '../components/AppButton';
import { FeedbackBanner } from '../components/FeedbackBanner';
import { LessonProgressBar } from '../components/LessonProgressBar';
import { ProgressPill } from '../components/ProgressPill';
import { useDetailFooterSpacing } from '../components/layout';
import { SpeakerButton } from '../components/SpeakerButton';
import { XP } from '../data/constants';
import { getChoiceText, shuffleWithSeed, withShuffledExerciseChoices } from '../lib/choiceUtils';
import { getLessonById, getNextPlayableLesson } from '../data/lessons';
import { articleColors, colors, radius, shadows, spacing, typography } from '../data/theme';
import {
  buildExercisesForLesson,
  checkExerciseAnswer,
} from '../lib/exerciseBuilder';
import { getLocalDateKey } from '../lib/date';
import { createReviewCardsFromLesson } from '../lib/srs';
import { awardXpForStudy } from '../lib/storage';
import { trackLocalEvent } from '../services/localEventLog';
import type {
  CommitUserState,
  RootNavigation,
  RootStackParamList,
} from '../navigation/AppNavigator';
import type { AnswerResult, ExerciseAttempt } from '../types/exercise';
import type { Mistake, UserState } from '../types/userState';

type ExercisePlayerScreenProps = {
  navigation: RootNavigation;
  route: RouteProp<RootStackParamList, 'ExercisePlayer'>;
  userState: UserState;
  onUpdateState: CommitUserState;
};

type LessonCompletion = {
  correctAnswers: number;
  totalAnswers: number;
  xpEarned: number;
  newReviewCards: number;
  mistakeCount: number;
  nextLessonId?: string;
  nextLessonTitle?: string;
};

export function ExercisePlayerScreen({
  navigation,
  route,
  userState,
  onUpdateState,
}: ExercisePlayerScreenProps) {
  const lesson = getLessonById(route.params.lessonId);
  const sessionSeedRef = useRef('lesson-' + route.params.lessonId + '-' + Date.now().toString(36));
  const initialExercises = useMemo(
    () =>
      lesson
        ? buildExercisesForLesson(lesson).map((item) => {
            const shuffledExercise = withShuffledExerciseChoices(
              item,
              sessionSeedRef.current,
            );

            return item.buildWords
              ? {
                  ...shuffledExercise,
                  buildWords: shuffleWithSeed(
                    item.buildWords,
                    shuffledExercise.id + ':' + sessionSeedRef.current + ':words',
                  ),
                }
              : shuffledExercise;
          })
        : [],
    [lesson],
  );
  const [queue, setQueue] = useState(initialExercises);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [writtenAnswer, setWrittenAnswer] = useState('');
  const [builtWords, setBuiltWords] = useState<string[]>([]);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [attempts, setAttempts] = useState<ExerciseAttempt[]>([]);
  const [saving, setSaving] = useState(false);
  const [completion, setCompletion] = useState<LessonCompletion | null>(null);
  const answerLockedRef = useRef(false);
  const finishLockedRef = useRef(false);
  const { contentPaddingBottom, footerPaddingBottom } = useDetailFooterSpacing();

  useEffect(() => {
    setQueue(initialExercises);
    setCurrentIndex(0);
    setSelectedAnswer('');
    setWrittenAnswer('');
    setBuiltWords([]);
    setResult(null);
    setCompletion(null);
    answerLockedRef.current = false;
    finishLockedRef.current = false;
  }, [initialExercises]);

  const exercise = queue[currentIndex];
  const answer =
    exercise?.type === 'sentenceBuild'
      ? builtWords.join(' ')
      : exercise?.choices
        ? selectedAnswer
        : writtenAnswer;

  const finishLesson = async (finishedAttempts: ExerciseAttempt[]) => {
    if (!lesson || saving || finishLockedRef.current) {
      return;
    }

    finishLockedRef.current = true;
    setSaving(true);

    let correctAnswers = 0;
    let xpEarned = 0;
    let newReviewCards = 0;
    let mistakeCount = 0;

    try {
      const nextState = await onUpdateState((state) => {
        const alreadyCompleted = state.completedLessons.includes(lesson.id);
        correctAnswers = finishedAttempts.filter(
          (attempt) => attempt.result.correct,
        ).length;
        xpEarned = finishedAttempts.reduce(
          (sum, attempt) => sum + attempt.result.xpEarned,
          alreadyCompleted ? 0 : XP.lessonComplete,
        );
        const mistakes: Mistake[] = finishedAttempts
          .filter((attempt) => !attempt.result.correct)
          .map((attempt) => {
            const relatedExercise = queue.find(
              (item) => item.id === attempt.exerciseId,
            );

            return {
              id: 'mistake-' + attempt.exerciseId + '-' + attempt.answeredAt,
              lessonId: lesson.id,
              exerciseId: attempt.exerciseId,
              prompt: relatedExercise?.question ?? '',
              userAnswer: attempt.answer,
              expectedAnswer: attempt.result.expected,
              feedbackTr: attempt.result.feedback,
              createdAt: attempt.answeredAt,
            };
          });
        mistakeCount = mistakes.length;
        const reviewCards = createReviewCardsFromLesson(lesson, state.reviewCards);
        newReviewCards = Math.max(0, reviewCards.length - state.reviewCards.length);

        return awardXpForStudy({
          ...state,
          completedLessons: alreadyCompleted
            ? state.completedLessons
            : [...state.completedLessons, lesson.id],
          lessonProgress: {
            ...state.lessonProgress,
            [lesson.id]: {
              lessonId: lesson.id,
              completed: true,
              correctAnswers,
              totalAnswers: Math.max(1, finishedAttempts.length),
              lastStudiedAt: getLocalDateKey(),
            },
          },
          reviewCards,
          mistakes: [...state.mistakes, ...mistakes],
        }, xpEarned);
      });
      const nextLesson = getNextPlayableLesson(nextState.completedLessons, nextState.learningPlan);

      trackLocalEvent({
        type: 'lesson_completed',
        screen: 'ExercisePlayer',
        metadata: { lessonId: lesson.id, level: lesson.cefr },
      });

      setCompletion({
        correctAnswers,
        totalAnswers: Math.max(1, finishedAttempts.length),
        xpEarned,
        newReviewCards,
        mistakeCount,
        nextLessonId: nextLesson?.id,
        nextLessonTitle: nextLesson?.title,
      });
    } finally {
      setSaving(false);
      finishLockedRef.current = false;
    }
  };

  const submitAnswer = () => {
    if (!exercise || !answer.trim() || result || completion || answerLockedRef.current) {
      return;
    }

    answerLockedRef.current = true;

    const checked = checkExerciseAnswer(exercise, answer);
    trackLocalEvent({
      type: 'exercise_answered',
      screen: 'ExercisePlayer',
      metadata: {
        lessonId: lesson?.id,
        level: lesson?.cefr,
        exerciseType: exercise.type,
        result: checked.correct ? 'correct' : 'incorrect',
      },
    });
    const displayAnswer = exercise.choices
      ? getChoiceText(exercise.choices, answer) ?? answer
      : answer;
    const attempt: ExerciseAttempt = {
      exerciseId: exercise.id,
      answer: displayAnswer,
      result: checked,
      answeredAt: new Date().toISOString(),
    };
    const nextAttempts = exercise.isRetry ? attempts : [...attempts, attempt];

    setAttempts(nextAttempts);
    setResult(checked);

    if (!checked.correct && !exercise.isRetry) {
      setQueue((currentQueue) => {
        const retryBase = {
          ...exercise,
          id: exercise.id + '-retry',
          isRetry: true,
          choices: undefined,
          correctChoiceId: undefined,
          options: exercise.choices?.map((choice) => choice.text) ?? exercise.options,
          buildWords: exercise.buildWords
            ? shuffleWithSeed(
                exercise.buildWords,
                exercise.id + ':' + sessionSeedRef.current + ':retry-words',
              )
            : undefined,
        };

        return [
          ...currentQueue,
          withShuffledExerciseChoices(
            retryBase,
            sessionSeedRef.current + ':retry:' + currentQueue.length,
          ),
        ];
      });
    }
  };

  const goNext = async () => {
    if (saving) {
      return;
    }

    if (currentIndex === queue.length - 1) {
      await finishLesson(attempts);
      return;
    }

    setCurrentIndex((index) => index + 1);
    setSelectedAnswer('');
    setWrittenAnswer('');
    setBuiltWords([]);
    setResult(null);
    answerLockedRef.current = false;
  };

  if (lesson && completion) {
    const hasMistakes = completion.mistakeCount > 0;
    const hasNextLesson = Boolean(completion.nextLessonId);
    const isA2PathComplete = lesson.id === 'a2-12-a2-genel-tekrar' && !hasNextLesson;
    const selectCompletionAction = (actionId: string, runAction: () => void) => {
      trackLocalEvent({
        type: 'lesson_completion_action_selected',
        screen: 'ExercisePlayer',
        action: actionId,
        metadata: { actionId, lessonId: lesson.id, level: lesson.cefr },
      });
      runAction();
    };
    const goNextOrHome = () => {
      if (completion.nextLessonId) {
        navigation.navigate('LessonIntro', { lessonId: completion.nextLessonId });
        return;
      }

      navigation.navigate('Main', { initialTab: 'home' });
    };
    const goHome = () => navigation.navigate('Main', { initialTab: 'home' });
    const goVocab = () => navigation.navigate('Main', { initialTab: 'vocab' });
    const goMistakes = () => navigation.navigate('Main', { initialTab: 'profile' });
    const goA2Review = () => navigation.navigate('LessonIntro', { lessonId: 'a2-01-gunluk-planlar' });

    return (
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <View style={styles.completionHeader}>
          <CheckCircle2 color={colors.green} size={42} strokeWidth={2.6} />
          <AnimatedCard>
            <Text style={styles.completionTitle}>Ders tamamlandı</Text>
            <Text style={styles.completionSubtitle}>{lesson.title}</Text>
          </AnimatedCard>
        </View>

        <ScrollView contentContainerStyle={styles.completionContent}>
          <View style={styles.completionCard}>
            <Text style={styles.completionCardTitle}>{isA2PathComplete ? 'A2 yolu tamamlandı' : 'Sıradaki en iyi adım'}</Text>
            <View style={styles.completionPills}>
              <ProgressPill label={completion.correctAnswers + '/' + completion.totalAnswers + ' doğru'} tone="green" />
              <ProgressPill label={'+' + completion.xpEarned + ' XP'} tone="yellow" />
              <ProgressPill label={completion.newReviewCards + ' kelime'} tone="purple" />
            </View>
            {isA2PathComplete ? (
              <Text style={styles.completionText}>A2 yolunun ilk paketi tamamlandı. B1 yakında.</Text>
            ) : hasMistakes ? (
              <Text style={styles.completionText}>{completion.mistakeCount} hata defterine eklendi. Önce kısa bir tekrar iyi olur.</Text>
            ) : (
              <Text style={styles.completionText}>Hata yok. Sıradaki derse geçebilirsin.</Text>
            )}
            {isA2PathComplete && hasMistakes ? (
              <Text style={styles.completionText}>{completion.mistakeCount} hata defterine eklendi. İstersen kısa tekrar yap.</Text>
            ) : null}
            {completion.newReviewCards > 0 ? (
              <Text style={styles.completionText}>{completion.newReviewCards} kelime tekrar listene eklendi.</Text>
            ) : null}
            {isA2PathComplete ? (
              <Text style={styles.completionText}>Kelime tekrarı, hatalar veya A2 tekrar ile devam edebilirsin.</Text>
            ) : completion.nextLessonTitle ? (
              <Text style={styles.completionText}>Sıradaki ders: {completion.nextLessonTitle}</Text>
            ) : (
              <Text style={styles.completionText}>Bu seviyedeki oynanabilir dersleri bitirdin. Haritadan yakında açılacak modülleri görebilirsin.</Text>
            )}
          </View>

          {isA2PathComplete ? (
            <AppButton
              icon={RotateCcw}
              onPress={() => selectCompletionAction('vocab_review', goVocab)}
              title="Kelime tekrarı"
            />
          ) : hasMistakes ? (
            <AppButton
              icon={NotebookTabs}
              onPress={() => selectCompletionAction('mistakes_review', goMistakes)}
              title="Hatalarını tekrar et"
            />
          ) : (
            <AppButton
              icon={hasNextLesson ? BookOpen : Home}
              onPress={() => selectCompletionAction(hasNextLesson ? 'next_lesson' : 'home', goNextOrHome)}
              title={hasNextLesson ? 'Sıradaki ders' : 'Ana sayfaya dön'}
            />
          )}

          <View style={styles.secondaryActions}>
            {isA2PathComplete ? (
              <>
                <AppButton
                  icon={NotebookTabs}
                  onPress={() => selectCompletionAction('mistakes_review', goMistakes)}
                  title="Hatalar"
                  variant="secondary"
                  style={styles.secondaryButton}
                />
                <AppButton
                  icon={Home}
                  onPress={() => selectCompletionAction('home', goHome)}
                  title="Ana sayfa"
                  variant="secondary"
                  style={styles.secondaryButton}
                />
                <AppButton
                  icon={BookOpen}
                  onPress={() => selectCompletionAction('a2_review', goA2Review)}
                  title="A2 tekrar"
                  variant="secondary"
                  style={styles.secondaryButton}
                />
              </>
            ) : lesson.speakingPrompt ? (
              <AppButton
                icon={Mic}
                onPress={() => selectCompletionAction('speaking_prompt', () => navigation.navigate('SpeakingPractice', {
                  source: 'lesson_completion',
                  promptId: lesson.id + '-speaking',
                  topicTitle: lesson.speakingPrompt?.titleTr,
                  expectedText: lesson.speakingPrompt?.promptDe,
                  meaningTr: lesson.speakingPrompt?.promptTr,
                  tipTr: 'Dersi bitirdin. Şimdi cümleyi sesli dene.',
                }))}
                title="Bu cümleyi sesli dene"
                variant="secondary"
                style={styles.secondaryButton}
              />
            ) : null}
            {!isA2PathComplete && hasMistakes ? (
              <AppButton
                icon={hasNextLesson ? BookOpen : Home}
                onPress={() => selectCompletionAction(hasNextLesson ? 'next_lesson' : 'home', goNextOrHome)}
                title={hasNextLesson ? 'Sıradaki ders' : 'Ana sayfa'}
                variant="secondary"
                style={styles.secondaryButton}
              />
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!lesson || !exercise) {
    return (
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.title}>Alıştırma bulunamadı</Text>
          <AppButton
            onPress={() => navigation.goBack()}
            title="Geri dön"
            variant="secondary"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
        style={styles.keyboard}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.goBack()}
            style={styles.iconButton}
          >
            <ArrowLeft color={colors.white} size={22} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.kicker}>{lesson.title}</Text>
            <LessonProgressBar current={currentIndex + 1} total={queue.length} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: contentPaddingBottom }]}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.promptCard}>
            <View style={styles.promptMeta}>
              <Text style={styles.prompt}>{exercise.prompt}</Text>
              {exercise.isRetry ? <Text style={styles.retryLabel}>Tekrar</Text> : null}
            </View>
            <View style={styles.questionRow}>
              <Text style={styles.question}>{exercise.question}</Text>
              {exercise.speechText ? (
                <SpeakerButton text={exercise.speechText} />
              ) : null}
            </View>
          </View>

          {exercise.type === 'sentenceBuild' ? (
            <View style={styles.buildArea}>
              <View style={styles.buildTray}>
                {builtWords.length === 0 ? (
                  <Text style={styles.buildPlaceholder}>
                    Kelimelere dokunarak cümleyi kur
                  </Text>
                ) : (
                  builtWords.map((word, index) => (
                    <Pressable
                      disabled={result !== null}
                      key={`${word}-${index}`}
                      onPress={() =>
                        setBuiltWords((words) =>
                          words.filter((_, wordIndex) => wordIndex !== index),
                        )
                      }
                      style={styles.selectedWord}
                    >
                      <Text style={styles.selectedWordText}>{word}</Text>
                    </Pressable>
                  ))
                )}
              </View>
              <View style={styles.wordBank}>
                {(exercise.buildWords ?? []).map((word, index, allWords) => {
                  const used =
                    builtWords.filter((selectedWord) => selectedWord === word).length >=
                    allWords
                      .slice(0, index + 1)
                      .filter((candidate) => candidate === word).length;

                  return (
                    <Pressable
                      disabled={used || result !== null}
                      key={`${word}-bank-${index}`}
                      onPress={() => setBuiltWords((words) => [...words, word])}
                      style={({ pressed }) => [
                        styles.bankWord,
                        used && styles.bankWordUsed,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.bankWordText,
                          used && styles.bankWordTextUsed,
                        ]}
                      >
                        {word}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : exercise.choices ? (
            <View style={styles.options}>
              {exercise.choices.map((choice) => {
                const selected = selectedAnswer === choice.id;
                const articleColor =
                  exercise.type === 'article' && choice.text in articleColors
                    ? articleColors[choice.text as keyof typeof articleColors]
                    : colors.royalPurple;

                return (
                  <Pressable
                    disabled={result !== null}
                    key={choice.id}
                    onPress={() => setSelectedAnswer(choice.id)}
                    style={({ pressed }) => [
                      styles.option,
                      selected && {
                        borderColor: result ? (result.correct ? colors.green : colors.red) : articleColor,
                        backgroundColor: result ? (result.correct ? '#E3FAEE' : '#FFE5E5') : colors.comicYellowWash,
                      },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.optionText}>{choice.text}</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <TextInput
              autoCapitalize="none"
              editable={result === null}
              multiline
              onChangeText={setWrittenAnswer}
              placeholder="Cevabını yaz"
              placeholderTextColor={colors.muted}
              style={styles.textArea}
              value={writtenAnswer}
            />
          )}

          {result ? (
            <AnimatedCard>
              <FeedbackBanner tone={result.correct ? 'success' : 'error'} title={result.correct ? 'Doğru' : 'Tekrar bak'}>
                {result.feedback}
              </FeedbackBanner>
            </AnimatedCard>
          ) : null}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: footerPaddingBottom }]}>
          {result ? (
            <AppButton
              icon={Check}
              loading={saving}
              onPress={goNext}
              title={
                currentIndex === queue.length - 1
                  ? userState.completedLessons.includes(lesson.id)
                    ? 'Dersi bitir'
                    : `Dersi bitir (+${XP.lessonComplete} XP)`
                  : 'Sonraki'
              }
            />
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
    backgroundColor: colors.deepViolet,
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
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
    gap: spacing.sm,
  },
  kicker: {
    ...typography.small,
    color: colors.lavender,
  },
  content: {
    backgroundColor: colors.lavenderBackground,
    flexGrow: 1,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  promptCard: {
    backgroundColor: colors.paper,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    borderTopColor: colors.yellowCta,
    borderTopWidth: 8,
    gap: spacing.md,
    padding: spacing.lg,
    ...shadows.lift,
  },
  prompt: {
    ...typography.small,
    color: colors.royalPurple,
  },
  promptMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  retryLabel: {
    ...typography.small,
    backgroundColor: '#FFF2C4',
    borderRadius: radius.pill,
    color: '#9A6A00',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  questionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  question: {
    ...typography.title,
    color: colors.deepViolet,
    flex: 1,
  },
  options: {
    gap: spacing.md,
  },
  buildArea: {
    gap: spacing.md,
  },
  buildTray: {
    alignContent: 'flex-start',
    backgroundColor: colors.paperLavender,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.lg,
    borderStyle: 'dashed',
    borderWidth: colors.comicBorderWidth,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    minHeight: 82,
    padding: spacing.md,
  },
  buildPlaceholder: {
    ...typography.body,
    color: colors.muted,
  },
  selectedWord: {
    backgroundColor: colors.primaryPurple,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.md,
    borderWidth: colors.comicBorderWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.comicSmall,
  },
  selectedWordText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '900',
  },
  wordBank: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  bankWord: {
    backgroundColor: colors.paper,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.md,
    borderWidth: colors.comicBorderWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.comicSmall,
  },
  bankWordUsed: {
    backgroundColor: colors.surfaceStrong,
    opacity: 0.45,
  },
  bankWordText: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '800',
  },
  bankWordTextUsed: {
    color: 'transparent',
  },
  option: {
    backgroundColor: colors.paper,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.lg,
    borderWidth: colors.comicBorderWidth,
    minHeight: 60,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    ...shadows.comicSmall,
  },
  optionText: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '800',
  },
  textArea: {
    ...typography.body,
    backgroundColor: colors.paper,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.lg,
    borderWidth: colors.comicBorderWidth,
    color: colors.deepViolet,
    minHeight: 132,
    padding: spacing.md,
    textAlignVertical: 'top',
    ...shadows.comicSmall,
  },
  footer: {
    backgroundColor: colors.white,
    borderTopColor: colors.comicBorderColor,
    borderTopWidth: colors.comicBorderWidth,
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
  completionHeader: {
    alignItems: 'center',
    backgroundColor: colors.deepViolet,
    gap: spacing.sm,
    padding: spacing.xl,
  },
  completionTitle: {
    ...typography.heading,
    color: colors.white,
    textAlign: 'center',
  },
  completionSubtitle: {
    ...typography.body,
    color: colors.lavender,
    textAlign: 'center',
  },
  completionContent: {
    backgroundColor: colors.lavenderBackground,
    flexGrow: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  completionCard: {
    backgroundColor: colors.paper,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    borderTopColor: colors.yellowCta,
    borderTopWidth: 8,
    gap: spacing.sm,
    padding: spacing.lg,
    ...shadows.lift,
  },
  completionCardTitle: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  completionText: {
    ...typography.body,
    color: colors.muted,
  },
  completionPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  secondaryActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  secondaryButton: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  center: {
    backgroundColor: colors.lavenderBackground,
    flex: 1,
    gap: spacing.lg,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: {
    ...typography.heading,
    color: colors.deepViolet,
  },
  pressed: {
    opacity: 0.78,
  },
});
