import { CheckCircle2, ClipboardList, Lock, Map, Mic, PlayCircle, RotateCcw, Sparkles } from 'lucide-react-native';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../components/AppButton';
import { AppScrollView, Screen } from '../components/layout';
import { ProgressRing } from '../components/ProgressRing';
import { TopBar } from '../components/TopBar';
import { getTrackById } from '../data/curriculum';
import { getNextPlayableLesson, getPlayableLessonByModuleId, getPlayableLessonsForPlan, isLessonUnlocked } from '../data/lessons';
import { colors, radius, spacing, typography } from '../data/theme';
import { getDueReviewCards, getReviewCoverage } from '../lib/srs';
import type { RootNavigation } from '../navigation/AppNavigator';
import { getTodayRecommendedActions } from '../services/planService';
import type { RecommendedAction } from '../types/learningPlan';
import type { UserState } from '../types/userState';

type HomeScreenProps = {
  navigation: RootNavigation;
  userState: UserState;
};

const actionIcons = {
  lesson: PlayCircle,
  srs: RotateCcw,
  speaking: Mic,
  listening: PlayCircle,
  writing: Sparkles,
  exam: ClipboardList,
  review: RotateCcw,
};

export function HomeScreen({ navigation, userState }: HomeScreenProps) {
  const lessonPath = getPlayableLessonsForPlan(userState.learningPlan);
  const completedCount = lessonPath.filter((lesson) => userState.completedLessons.includes(lesson.id)).length;
  const progress = lessonPath.length > 0 ? completedCount / lessonPath.length : 0;
  const dueCards = getDueReviewCards(userState.reviewCards);
  const dailyGoalXp = userState.profile?.dailyGoalXp ?? 20;
  const dailyProgress = Math.min(1, userState.todayXp / dailyGoalXp);
  const a1Coverage = Math.min(1, progress * 0.7 + getReviewCoverage(userState.reviewCards) * 0.3);
  const plan = userState.learningPlan;
  const track = plan ? getTrackById(plan.selectedTrack) : undefined;
  const planActions = plan ? getTodayRecommendedActions(plan, { dueReviewCount: dueCards.length }) : [];

  const nextPlayableLesson = getNextPlayableLesson(userState.completedLessons, plan);

  const openAction = (action: RecommendedAction) => {
    if (action.type === 'speaking') {
      navigation.navigate('SpeakingPractice', {});
      return;
    }

    if (action.type === 'exam') {
      navigation.navigate('Main');
      return;
    }

    if (action.type === 'lesson') {
      const targetLesson = action.targetId ? getPlayableLessonByModuleId(action.targetId) : nextPlayableLesson;

      if (!targetLesson) {
        Alert.alert('Yakında', 'Bu modül yakında oynanabilir olacak.');
        return;
      }

      navigation.navigate('LessonIntro', { lessonId: targetLesson.id });
      return;
    }

    navigation.navigate('PlanOverview');
  };

  return (
    <Screen backgroundColor={colors.deepViolet}>
      <TopBar
        streak={userState.streak}
        subtitle={plan ? plan.titleTr : String(userState.profile?.dailyGoalMinutes ?? 10) + ' dk günlük hedef'}
        title={'Merhaba, ' + (userState.profile?.name ?? 'öğrenci')}
        xp={userState.xp}
      />
      <AppScrollView contentContainerStyle={styles.content} style={styles.scroll}>
        {plan ? (
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <View style={styles.planIcon}>
                <Sparkles color={colors.yellow} size={22} />
              </View>
              <View style={styles.lessonCopy}>
                <Text style={styles.planKicker}>Aktif plan</Text>
                <Text style={styles.planTitle}>{plan.titleTr}</Text>
                <Text style={styles.planText}>{plan.currentLevel} → {plan.targetLevel} · {plan.dailyMinutes} dk/gün · {track?.titleTr}</Text>
              </View>
            </View>
            <View style={styles.planActions}>
              <AppButton icon={Sparkles} onPress={() => navigation.navigate('PlanOverview')} title="Planı aç" variant="secondary" style={styles.planButton} />
              <AppButton icon={Map} onPress={() => navigation.navigate('CurriculumMap')} title="Harita" variant="secondary" style={styles.planButton} />
            </View>
          </View>
        ) : null}

        {planActions.length > 0 ? (
          <View style={styles.todaySection}>
            <Text style={styles.sectionTitle}>Bugün</Text>
            {planActions.map((action) => {
              const Icon = actionIcons[action.type];
              return (
                <Pressable key={action.id} onPress={() => openAction(action)} style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}>
                  <View style={styles.actionIcon}>
                    <Icon color={colors.royalPurple} size={20} />
                  </View>
                  <View style={styles.lessonCopy}>
                    <Text style={styles.actionTitle}>{action.titleTr}</Text>
                    <Text style={styles.muted} numberOfLines={2}>{action.descriptionTr}</Text>
                  </View>
                  <Text style={styles.minutes}>{action.estimatedMinutes} dk</Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <View style={styles.summary}>
          <View style={styles.summaryCopy}>
            <Text style={styles.sectionTitle}>Aktif öğrenme yolu</Text>
            <Text style={styles.muted}>
              {completedCount}/{lessonPath.length} ders tamamlandı. Yolculuk %{Math.round(a1Coverage * 100)}.
            </Text>
            <View style={styles.goalBar}>
              <View style={[styles.goalFill, { flex: dailyProgress }]} />
              <View style={{ flex: 1 - dailyProgress }} />
            </View>
            <Text style={styles.progressText}>
              Bugün {Math.min(userState.todayXp, dailyGoalXp)}/{dailyGoalXp} XP · {dueCards.length} tekrar
            </Text>
          </View>
          <ProgressRing progress={progress} />
        </View>

        <Pressable
          onPress={() => navigation.navigate('SpeakingPractice', {})}
          style={({ pressed }) => [styles.speakingCard, pressed && styles.pressed]}
        >
          <View style={styles.speakingIcon}>
            <Mic color={colors.white} size={24} strokeWidth={2.6} />
          </View>
          <View style={styles.lessonCopy}>
            <Text style={styles.speakingUnit}>A1 konuşma</Text>
            <Text style={styles.speakingTitle}>Sesli cümle pratiği</Text>
            <Text style={styles.speakingMuted} numberOfLines={2}>
              Almanca cümleyi dinle, sesini kaydet, tekrar dinle ve mock telaffuz puanı gör.
            </Text>
          </View>
          <Text style={styles.speakingBadge}>Yeni</Text>
        </Pressable>

        <View style={styles.path}>
          {lessonPath.map((lesson) => {
            const completed = userState.completedLessons.includes(lesson.id);
            const unlocked = isLessonUnlocked(lesson.id, userState.completedLessons, plan);
            const lessonProgress = userState.lessonProgress[lesson.id];
            const Icon = completed ? CheckCircle2 : unlocked ? PlayCircle : Lock;

            return (
              <Pressable
                disabled={!unlocked}
                key={lesson.id}
                onPress={() => navigation.navigate('LessonIntro', { lessonId: lesson.id })}
                style={({ pressed }) => [
                  styles.lessonCard,
                  completed && styles.completedCard,
                  !unlocked && styles.lockedCard,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.lessonIcon}>
                  <Icon
                    color={completed ? colors.green : unlocked ? colors.royalPurple : colors.muted}
                    size={24}
                    strokeWidth={2.5}
                  />
                </View>
                <View style={styles.lessonCopy}>
                  <Text style={styles.lessonUnit}>Ünite {lesson.unit}</Text>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  <Text style={styles.muted} numberOfLines={2}>
                    {lesson.subtitle}
                  </Text>
                  {lessonProgress ? (
                    <Text style={styles.progressText}>
                      {lessonProgress.correctAnswers}/{lessonProgress.totalAnswers} doğru
                    </Text>
                  ) : null}
                </View>
                <Text style={styles.minutes}>{lesson.estimatedMinutes} dk</Text>
              </Pressable>
            );
          })}
        </View>
      </AppScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: colors.surface,
  },
  content: {
    backgroundColor: colors.surface,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  planCard: {
    backgroundColor: colors.deepViolet,
    borderRadius: radius.lg,
    gap: spacing.md,
    padding: spacing.lg,
  },
  planHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  planIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.md,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  planKicker: {
    ...typography.small,
    color: colors.yellow,
  },
  planTitle: {
    ...typography.body,
    color: colors.white,
    fontWeight: '900',
  },
  planText: {
    ...typography.small,
    color: colors.lavender,
  },
  planActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  planButton: {
    flex: 1,
  },
  todaySection: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  actionCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 72,
    padding: spacing.md,
  },
  actionIcon: {
    alignItems: 'center',
    backgroundColor: colors.lavender,
    borderRadius: radius.sm,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  actionTitle: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  summary: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
  },
  summaryCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.heading,
    color: colors.deepViolet,
  },
  muted: {
    ...typography.small,
    color: colors.muted,
  },
  path: {
    gap: spacing.md,
  },
  speakingCard: {
    alignItems: 'center',
    backgroundColor: colors.deepViolet,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 112,
    padding: spacing.md,
  },
  speakingIcon: {
    alignItems: 'center',
    backgroundColor: colors.royalPurple,
    borderRadius: radius.md,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  speakingUnit: {
    ...typography.small,
    color: colors.yellow,
  },
  speakingTitle: {
    ...typography.body,
    color: colors.white,
    fontWeight: '900',
  },
  speakingMuted: {
    ...typography.small,
    color: colors.lavender,
  },
  speakingBadge: {
    ...typography.small,
    color: colors.yellow,
  },
  lessonCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 112,
    padding: spacing.md,
  },
  completedCard: {
    borderColor: '#B7EBCF',
  },
  lockedCard: {
    opacity: 0.58,
  },
  lessonIcon: {
    alignItems: 'center',
    backgroundColor: colors.lavender,
    borderRadius: radius.md,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  lessonCopy: {
    flex: 1,
    gap: 2,
  },
  lessonUnit: {
    ...typography.small,
    color: colors.royalPurple,
  },
  lessonTitle: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  progressText: {
    ...typography.small,
    color: colors.green,
  },
  goalBar: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radius.pill,
    flexDirection: 'row',
    height: 8,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  goalFill: {
    backgroundColor: colors.yellow,
  },
  minutes: {
    ...typography.small,
    color: colors.deepViolet,
  },
  pressed: {
    opacity: 0.82,
  },
});
