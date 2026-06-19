import { BookOpen, MessageCircle, Mic, NotebookTabs, RotateCcw, Sparkles } from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AnimatedCard } from '../components/AnimatedCard';
import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { ProgressPill } from '../components/ProgressPill';
import { AppScrollView, Screen } from '../components/layout';
import { RoadmapPath, type RoadmapPathItem } from '../components/RoadmapPath';
import { TopBar } from '../components/TopBar';
import { getNextPlayableLesson, getPlayableLessonsForPlan, isLessonUnlocked } from '../data/lessons';
import { colors, radius, shadows, spacing, typography } from '../data/theme';
import { getDueReviewCards, getReviewCoverage } from '../lib/srs';
import type { RootNavigation } from '../navigation/AppNavigator';
import { trackLocalEvent } from '../services/localEventLog';
import type { UserState } from '../types/userState';

type HomeScreenProps = {
  navigation: RootNavigation;
  userState: UserState;
};

export function HomeScreen({ navigation, userState }: HomeScreenProps) {
  const plan = userState.learningPlan;

  useEffect(() => {
    trackLocalEvent({ type: 'home_viewed', screen: 'Home' });
  }, []);
  const lessonPath = getPlayableLessonsForPlan(plan);
  const completedCount = lessonPath.filter((lesson) => userState.completedLessons.includes(lesson.id)).length;
  const progress = lessonPath.length > 0 ? completedCount / lessonPath.length : 0;
  const dueCards = getDueReviewCards(userState.reviewCards);
  const mistakeCount = userState.mistakes.length;
  const dailyGoalXp = userState.profile?.dailyGoalXp ?? 20;
  const dailyProgress = Math.min(1, userState.todayXp / dailyGoalXp);
  const coverage = Math.min(1, progress * 0.7 + getReviewCoverage(userState.reviewCards) * 0.3);
  const nextLesson = getNextPlayableLesson(userState.completedLessons, plan);
  const activeLessonIndex = nextLesson
    ? lessonPath.findIndex((lesson) => lesson.id === nextLesson.id)
    : Math.max(0, lessonPath.length - 1);
  const roadmapStart = Math.max(0, activeLessonIndex - 1);
  const roadmapLessons = lessonPath.slice(roadmapStart, roadmapStart + 4);
  const roadmapItems: RoadmapPathItem[] = roadmapLessons.map((lesson) => {
    const completed = userState.completedLessons.includes(lesson.id);
    const unlocked = isLessonUnlocked(lesson.id, userState.completedLessons, plan);

    return {
      id: lesson.id,
      title: lesson.title,
      meta: lesson.cefr + ' · ' + lesson.estimatedMinutes + ' dk',
      completed,
      current: nextLesson?.id === lesson.id,
      locked: !unlocked,
      onPress: unlocked ? () => navigation.navigate('LessonIntro', { lessonId: lesson.id }) : undefined,
    };
  });

  if (!nextLesson && lessonPath.length > 0) {
    roadmapItems.push({
      id: 'coming-soon-a2',
      title: 'A2 modülleri',
      meta: 'Oynanabilir içerik yakında',
      comingSoon: true,
    });
  }

  const startPrimary = () => {
    if (nextLesson) {
      navigation.navigate('LessonIntro', { lessonId: nextLesson.id });
      return;
    }

    if (dueCards.length > 0) {
      navigation.navigate('Main', { initialTab: 'vocab' });
      return;
    }

    navigation.navigate('SpeakingPractice', { source: 'home_primary' });
  };

  const primaryTitle = nextLesson ? nextLesson.title : dueCards.length > 0 ? 'Kelime tekrarı' : 'Sesli cümle pratiği';
  const primaryMeta = nextLesson
    ? nextLesson.cefr + ' · ' + nextLesson.estimatedMinutes + ' dk'
    : dueCards.length > 0
      ? dueCards.length + ' kart hazır'
      : 'A1 konuşma · cümle eşleşmesi';
  const primaryButton = nextLesson ? 'Derse başla' : dueCards.length > 0 ? 'Tekrar et' : 'Sesli pratik aç';

  return (
    <Screen backgroundColor={colors.deepViolet}>
      <TopBar
        streak={userState.streak}
        subtitle={(plan?.currentLevel ?? 'A0') + ' · Bugün ' + Math.min(userState.todayXp, dailyGoalXp) + '/' + dailyGoalXp + ' XP'}
        title="Bugün"
        xp={userState.xp}
      />
      <AppScrollView contentContainerStyle={styles.content} style={styles.scroll}>
        <AnimatedCard>
          <AppCard style={styles.todayCard}>
          <View style={styles.missionBurst} />
          <View style={styles.missionSticker}>
            <Text style={styles.missionStickerText}>W</Text>
          </View>
          <View style={styles.todayHeader}>
            <View style={styles.todayIcon}>
              <Sparkles color={colors.comicBorderColor} size={24} strokeWidth={2.6} />
            </View>
            <View style={styles.flexCopy}>
              <ProgressPill label="Bugünkü adım" tone="yellow" />
              <Text style={styles.todayTitle}>{primaryTitle}</Text>
              <Text style={styles.todayMeta}>{primaryMeta}</Text>
            </View>
          </View>
          <View style={styles.goalBar}>
            <View style={[styles.goalFill, { flex: dailyProgress }]} />
            <View style={{ flex: 1 - dailyProgress }} />
          </View>
          <AppButton icon={BookOpen} onPress={startPrimary} title={primaryButton} />
          </AppCard>
        </AnimatedCard>

        <AnimatedCard delayMs={70}>
          <AppCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Yolun</Text>
              <Text style={styles.muted}>{completedCount}/{lessonPath.length} ders · %{Math.round(coverage * 100)}</Text>
            </View>
            <Pressable onPress={() => navigation.navigate('CurriculumMap')} style={({ pressed }) => [styles.textButton, pressed && styles.pressed]}>
              <Text style={styles.textButtonLabel}>Harita</Text>
            </Pressable>
          </View>
          <RoadmapPath items={roadmapItems} />
          </AppCard>
        </AnimatedCard>

        <AnimatedCard delayMs={120}>
        <View style={styles.quickActions}>
          <QuickAction badgeCount={dueCards.length} icon={RotateCcw} label="Kelime" onPress={() => navigation.navigate('Main', { initialTab: 'vocab' })} />
          <QuickAction badgeCount={mistakeCount} icon={NotebookTabs} label="Hatalarım" onPress={() => navigation.navigate('Main', { initialTab: 'profile' })} />
          <QuickAction icon={MessageCircle} label="Wolli" onPress={() => navigation.navigate('Main', { initialTab: 'chat' })} />
          <QuickAction icon={Mic} label="Ses" onPress={() => navigation.navigate('SpeakingPractice', {})} />
        </View>
        </AnimatedCard>

        {plan ? (
          <Pressable onPress={() => navigation.navigate('PlanOverview')} style={({ pressed }) => [styles.planStrip, pressed && styles.pressed]}>
            <Text style={styles.planTitle}>Planın</Text>
            <Text style={styles.planText}>{plan.currentLevel} → {plan.targetLevel} · {plan.dailyMinutes} dk/gün</Text>
          </Pressable>
        ) : null}
      </AppScrollView>
    </Screen>
  );
}

function QuickAction({ badgeCount = 0, icon: Icon, label, onPress }: { badgeCount?: number; icon: typeof RotateCcw; label: string; onPress: () => void }) {
  const badgeLabel = badgeCount > 99 ? '99+' : String(badgeCount);

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}>
      <Icon color={colors.royalPurple} size={20} strokeWidth={2.6} />
      <Text style={styles.quickLabel}>{label}</Text>
      {badgeCount > 0 ? (
        <View style={styles.quickBadge}>
          <Text style={styles.quickBadgeText}>{badgeLabel}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: colors.lavenderBackground,
  },
  content: {
    backgroundColor: colors.lavenderBackground,
    gap: spacing.md,
    padding: spacing.lg,
  },
  todayCard: {
    backgroundColor: colors.paper,
    borderRadius: radius.xl,
    gap: spacing.lg,
    overflow: 'visible',
    padding: spacing.lg,
    position: 'relative',
  },
  missionBurst: {
    backgroundColor: colors.comicYellowWash,
    borderRadius: 999,
    height: 150,
    opacity: 0.9,
    position: 'absolute',
    right: -42,
    top: -58,
    width: 150,
  },
  missionSticker: {
    alignItems: 'center',
    backgroundColor: colors.primaryPurple,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.pill,
    borderWidth: colors.comicBorderWidth,
    height: 34,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.lg,
    top: spacing.md,
    width: 34,
    ...shadows.comicSmall,
  },
  missionStickerText: {
    ...typography.small,
    color: colors.white,
    fontWeight: '900',
  },
  todayHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  todayIcon: {
    alignItems: 'center',
    backgroundColor: colors.yellowCta,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.lg,
    borderWidth: colors.comicBorderWidth,
    height: 56,
    justifyContent: 'center',
    width: 56,
    ...shadows.comicSmall,
  },
  flexCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  kicker: {
    ...typography.small,
    color: colors.yellow,
    fontWeight: '900',
  },
  todayTitle: {
    ...typography.heading,
    color: colors.deepViolet,
  },
  todayMeta: {
    ...typography.small,
    color: colors.muted,
  },
  goalBar: {
    backgroundColor: colors.paperLavender,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.pill,
    borderWidth: colors.comicBorderWidth,
    flexDirection: 'row',
    height: 10,
    overflow: 'hidden',
  },
  goalFill: {
    backgroundColor: colors.yellow,
  },
  section: {
    backgroundColor: colors.paper,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.md,
    padding: spacing.lg,
    ...shadows.comic,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.heading,
    color: colors.deepViolet,
  },
  muted: {
    ...typography.small,
    color: colors.muted,
  },
  textButton: {
    alignItems: 'center',
    backgroundColor: colors.comicYellowWash,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.pill,
    borderWidth: colors.comicBorderWidth,
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    ...shadows.comicSmall,
  },
  textButtonLabel: {
    ...typography.small,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickAction: {
    alignItems: 'center',
    backgroundColor: colors.paper,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.lg,
    borderWidth: colors.comicBorderWidth,
    flexBasis: '46%',
    flexDirection: 'row',
    flexGrow: 1,
    gap: spacing.xs,
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.comicSmall,
  },
  quickLabel: {
    ...typography.small,
    color: colors.deepViolet,
    fontWeight: '900',
    textAlign: 'center',
  },
  quickBadge: {
    alignItems: 'center',
    backgroundColor: colors.yellowCta,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.pill,
    borderWidth: colors.comicBorderWidth,
    minWidth: 24,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  quickBadgeText: {
    ...typography.small,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  planStrip: {
    backgroundColor: colors.paperLavender,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: 2,
    padding: spacing.md,
    ...shadows.paper,
  },
  planTitle: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  planText: {
    ...typography.small,
    color: colors.muted,
  },
  pressed: {
    opacity: 0.82,
  },
});
