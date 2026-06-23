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
import { ArrowLeft, BookOpen, Check, CheckCircle2, ClipboardCheck, Home, MessageCircle, Mic, NotebookTabs, RotateCcw } from 'lucide-react-native';

import { AnimatedCard } from '../components/AnimatedCard';
import { AppButton } from '../components/AppButton';
import { FeedbackBanner } from '../components/FeedbackBanner';
import { HalftoneAccent } from '../components/HalftoneAccent';
import { LessonProgressBar } from '../components/LessonProgressBar';
import { useDetailFooterSpacing } from '../components/layout';
import { SpeakerButton } from '../components/SpeakerButton';
import { XP } from '../data/constants';
import { getChoiceText, shuffleWithSeed, withShuffledExerciseChoices } from '../lib/choiceUtils';
import { getLessonById, getNextPlayableLesson, isB1PreviewLessonId } from '../data/lessons';
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
    const isB1PreviewComplete = isB1PreviewLessonId(lesson.id);
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
    const goMistakes = () => navigation.navigate('Mistakes');
    const goSpeakingLibrary = () => navigation.navigate('SpeakingLibrary');
    const goChat = () => navigation.navigate('Chat');
    const goExam = () => navigation.navigate('Main', { initialTab: 'exam' });
    const goA2Review = () => navigation.navigate('LessonIntro', { lessonId: 'a2-01-gunluk-planlar' });
    const goB1PreviewOverview = () => navigation.navigate('LevelOverview', { levelId: 'B1' });
    const goSpeakingPrompt = () => navigation.navigate('SpeakingPractice', {
      source: 'lesson_completion',
      promptId: lesson.id + '-speaking',
      topicTitle: lesson.speakingPrompt?.titleTr,
      expectedText: lesson.speakingPrompt?.promptDe,
      meaningTr: lesson.speakingPrompt?.promptTr,
      tipTr: 'Dersi bitirdin. Şimdi cümleyi sesli dene.',
    });

    return (
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.completionContent}>
          {isB1PreviewComplete ? (
            <View style={styles.b1PreviewCompletionHero}>
              <HalftoneAccent color={colors.primaryPurple} opacity={0.1} size="medium" style={styles.completionTexture} />
              <View style={styles.completionIconBadge}>
                <CheckCircle2 color={colors.primaryPurple} size={36} strokeWidth={2.8} />
              </View>
              <Text style={styles.completionTitle}>B1 Ön İzleme tamamlandı!</Text>
              <Text style={styles.completionSubtitle}>Tam B1 yolu yakında. Şimdilik A2 pekiştirmeye devam edebilirsin.</Text>
              <View style={styles.comingSoonPill}>
                <Text style={styles.comingSoonText}>Kısa ön izleme</Text>
              </View>
            </View>
          ) : isA2PathComplete ? (
            <View style={styles.a2CompletionHero}>
              <HalftoneAccent color={colors.yellowCta} opacity={0.12} size="medium" style={styles.completionTexture} />
              <View style={styles.completionIconBadge}>
                <CheckCircle2 color={colors.green} size={36} strokeWidth={2.8} />
              </View>
              <Text style={styles.completionTitle}>A2 tamamlandı!</Text>
              <Text style={styles.completionSubtitle}>B1 yakında. Şimdilik A2 tekrarına dönebilirsin.</Text>
              <View style={styles.comingSoonPill}>
                <Text style={styles.comingSoonText}>B1 yakında</Text>
              </View>
            </View>
          ) : (
            <View style={styles.completionHero}>
              <HalftoneAccent color={colors.yellowCta} opacity={0.12} size="medium" style={styles.completionTexture} />
              <View style={styles.completionIconBadge}>
                <CheckCircle2 color={colors.green} size={36} strokeWidth={2.8} />
              </View>
              <Text style={styles.completionTitle}>Harika iş!</Text>
              <Text style={styles.completionSubtitle}>{lesson.title}</Text>
              <View style={styles.completionStatsRow}>
                <View style={styles.completionStatCard}>
                  <Text style={styles.completionStatValue}>+{completion.xpEarned}</Text>
                  <Text style={styles.completionStatLabel}>XP</Text>
                </View>
                <View style={styles.completionStatCard}>
                  <Text style={styles.completionStatValue}>{completion.newReviewCards}</Text>
                  <Text style={styles.completionStatLabel}>kelime</Text>
                </View>
                <View style={styles.completionStatCard}>
                  <Text style={styles.completionStatValue}>{completion.mistakeCount}</Text>
                  <Text style={styles.completionStatLabel}>hata</Text>
                </View>
              </View>
              <View style={styles.completionHintStrip}>
                <Text style={styles.completionHintText}>
                  {hasMistakes
                    ? completion.mistakeCount + ' hata defterine eklendi. Kısa tekrar iyi olur.'
                    : completion.nextLessonTitle
                      ? 'Sıradaki ders: ' + completion.nextLessonTitle
                      : 'Bu seviyedeki oynanabilir dersleri bitirdin.'}
                </Text>
              </View>
            </View>
          )}

          {isB1PreviewComplete ? (
            <View style={styles.a2ActionGrid}>
              <AppButton
                icon={BookOpen}
                onPress={() => selectCompletionAction('b1_preview_overview', goB1PreviewOverview)}
                title="B1 Ön İzleme"
                style={styles.gridActionButton}
              />
              <AppButton
                icon={RotateCcw}
                onPress={() => selectCompletionAction('vocab_review', goVocab)}
                title="Kelime tekrarı"
                variant="secondary"
                style={styles.gridActionButton}
              />
              <AppButton
                icon={NotebookTabs}
                onPress={() => selectCompletionAction('mistakes_review', goMistakes)}
                title="Hatalar"
                variant="secondary"
                style={styles.gridActionButton}
              />
              <AppButton
                icon={Home}
                onPress={() => selectCompletionAction('home', goHome)}
                title="Ana sayfa"
                variant="secondary"
                style={styles.gridActionButton}
              />
            </View>
          ) : isA2PathComplete ? (
            <View style={styles.a2ActionGrid}>
              <AppButton
                icon={RotateCcw}
                onPress={() => selectCompletionAction('vocab_review', goVocab)}
                title="Kelime tekrarı"
                style={styles.gridActionButton}
              />
              <AppButton
                icon={NotebookTabs}
                onPress={() => selectCompletionAction('mistakes_review', goMistakes)}
                title="Hatalar"
                variant="secondary"
                style={styles.gridActionButton}
              />
              <AppButton
                icon={Home}
                onPress={() => selectCompletionAction('home', goHome)}
                title="Ana sayfa"
                variant="secondary"
                style={styles.gridActionButton}
              />
              <AppButton
                icon={BookOpen}
                onPress={() => selectCompletionAction('a2_review', goA2Review)}
                title="A2 tekrar"
                variant="secondary"
                style={styles.gridActionButton}
              />
            </View>
          ) : (
            <>
              {hasNextLesson ? (
                <AppButton
                  icon={BookOpen}
                  onPress={() => selectCompletionAction('next_lesson', goNextOrHome)}
                  title="Sıradaki ders"
                />
              ) : null}

              <View style={styles.completionPlanHeader}>
                <Text style={styles.completionPlanTitle}>Şimdi ne yapalım?</Text>
                <Text style={styles.completionPlanSubtitle}>
                  Dersi bitirdin. Öğrendiklerini kısa bir pratikle güçlendirebilirsin.
                </Text>
              </View>

              <View style={styles.completionPlanStack}>
                <AppButton
                  icon={RotateCcw}
                  onPress={() => selectCompletionAction('go_vocab', goVocab)}
                  title="Kelimeleri tekrar et"
                  variant="secondary"
                />
                {hasMistakes ? (
                  <AppButton
                    icon={NotebookTabs}
                    onPress={() => selectCompletionAction('go_mistakes', goMistakes)}
                    title="Hatalarını incele"
                    variant="secondary"
                  />
                ) : null}
                <AppButton
                  icon={Mic}
                  onPress={() => selectCompletionAction('go_speaking', goSpeakingLibrary)}
                  title="Sesli pratik yap"
                  variant="secondary"
                />
                <AppButton
                  icon={MessageCircle}
                  onPress={() => selectCompletionAction('go_chat', goChat)}
                  title="Wolli'ye sor"
                  variant="secondary"
                />
                <AppButton
                  icon={ClipboardCheck}
                  onPress={() => selectCompletionAction('go_exam', goExam)}
                  title="Sınav çöz"
                  variant="secondary"
                />
                <AppButton
                  icon={Home}
                  onPress={() => selectCompletionAction('go_home', goHome)}
                  title="Ana sayfaya dön"
                  variant="secondary"
                />
              </View>
            </>
          )}
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
            <ArrowLeft color={colors.deepViolet} size={22} />
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
            <HalftoneAccent opacity={0.08} size="small" style={styles.promptTexture} />
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
                        backgroundColor: result ? (result.correct ? '#DFFFD7' : '#FFE1E1') : colors.primaryPurple,
                      },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[styles.optionText, selected && !result && styles.optionTextSelected, selected && result && result.correct && styles.optionTextCorrect, selected && result && !result.correct && styles.optionTextWrong]}>{choice.text}</Text>
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
    backgroundColor: colors.lavenderBackground,
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.paper,
    borderBottomColor: colors.comicBorderColor,
    borderBottomWidth: colors.comicBorderWidth,
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
    gap: spacing.sm,
  },
  kicker: {
    ...typography.small,
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
    borderTopColor: colors.yellowCta,
    borderTopWidth: 8,
    gap: spacing.sm,
    overflow: 'hidden',
    padding: spacing.lg,
    ...shadows.lift,
  },
  prompt: {
    ...typography.small,
    color: colors.royalPurple,
    fontWeight: '900',
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
    gap: spacing.sm,
  },
  question: {
    ...typography.heading,
    color: colors.deepViolet,
    flex: 1,
    fontWeight: '900',
  },
  options: {
    gap: spacing.sm,
  },
  buildArea: {
    gap: spacing.md,
  },
  buildTray: {
    alignContent: 'flex-start',
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.lg,
    borderStyle: 'dashed',
    borderWidth: colors.comicBorderWidth,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    minHeight: 92,
    padding: spacing.md,
  },
  buildPlaceholder: {
    ...typography.body,
    color: colors.muted,
  },
  selectedWord: {
    backgroundColor: colors.primaryPurple,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.lg,
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
    backgroundColor: colors.white,
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
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    minHeight: 58,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.comic,
  },
  optionText: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  optionTextSelected: {
    color: colors.white,
  },
  optionTextCorrect: {
    color: colors.comicBorderColor,
  },
  optionTextWrong: {
    color: colors.comicBorderColor,
  },
  textArea: {
    ...typography.body,
    backgroundColor: colors.white,
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
    shadowOpacity: 0.12,
    shadowRadius: 0,
  },
  completionHero: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    ...shadows.comic,
  },
  a2CompletionHero: {
    alignItems: 'center',
    backgroundColor: colors.comicYellowWash,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.md,
    overflow: 'hidden',
    padding: spacing.xl,
    ...shadows.comic,
  },
  b1PreviewCompletionHero: {
    alignItems: 'center',
    backgroundColor: colors.paperLavender,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.md,
    overflow: 'hidden',
    padding: spacing.xl,
    ...shadows.comic,
  },
  completionIconBadge: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.pill,
    borderWidth: colors.comicBorderWidth,
    height: 76,
    justifyContent: 'center',
    width: 76,
    ...shadows.comicSmall,
  },
  completionTitle: {
    ...typography.heading,
    color: colors.deepViolet,
    fontWeight: '900',
    textAlign: 'center',
  },
  completionSubtitle: {
    ...typography.body,
    color: colors.muted,
    fontWeight: '800',
    textAlign: 'center',
  },
  completionContent: {
    backgroundColor: colors.lavenderBackground,
    flexGrow: 1,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  completionStatsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  completionStatCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.lg,
    borderWidth: colors.comicBorderWidth,
    flex: 1,
    gap: 2,
    justifyContent: 'center',
    minHeight: 82,
    padding: spacing.sm,
    ...shadows.comicSmall,
  },
  completionStatValue: {
    fontSize: 24,
    lineHeight: 28,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  completionStatLabel: {
    ...typography.small,
    color: colors.muted,
    fontWeight: '900',
  },
  completionHintStrip: {
    backgroundColor: colors.paperLavender,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.lg,
    borderWidth: colors.comicBorderWidth,
    padding: spacing.md,
    width: '100%',
  },
  completionHintText: {
    ...typography.body,
    color: colors.muted,
    fontWeight: '800',
    textAlign: 'center',
  },
  comingSoonPill: {
    backgroundColor: colors.primaryPurple,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.pill,
    borderWidth: colors.comicBorderWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.comicSmall,
  },
  comingSoonText: {
    ...typography.small,
    color: colors.white,
    fontWeight: '900',
  },
  a2ActionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gridActionButton: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  completionPlanHeader: {
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  completionPlanTitle: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
    textAlign: 'center',
  },
  completionPlanSubtitle: {
    ...typography.small,
    color: colors.muted,
    fontWeight: '800',
    textAlign: 'center',
  },
  completionPlanStack: {
    gap: spacing.md,
    width: '100%',
  },
  completionMiniAction: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.paperLavender,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.pill,
    borderWidth: colors.comicBorderWidth,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.comicSmall,
  },
  completionMiniActionText: {
    ...typography.small,
    color: colors.deepViolet,
    fontWeight: '900',
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
  promptTexture: {
    height: 110,
    position: 'absolute',
    right: -14,
    top: -14,
    width: 132,
  },
  completionTexture: {
    height: 132,
    position: 'absolute',
    right: -20,
    top: -20,
    width: 160,
  },
});
