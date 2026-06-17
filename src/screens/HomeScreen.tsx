import { BookOpen, MessageCircle, Mic, NotebookTabs, RotateCcw, Sparkles } from 'lucide-react-native';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../components/AppButton';
import { AppScrollView, Screen } from '../components/layout';
import { RoadmapPath, type RoadmapPathItem } from '../components/RoadmapPath';
import { TopBar } from '../components/TopBar';
import { getNextPlayableLesson, getPlayableLessonsForPlan, isLessonUnlocked } from '../data/lessons';
import { colors, radius, spacing, typography } from '../data/theme';
import { getDueReviewCards, getReviewCoverage } from '../lib/srs';
import type { RootNavigation } from '../navigation/AppNavigator';
import type { UserState } from '../types/userState';

type HomeScreenProps = {
  navigation: RootNavigation;
  userState: UserState;
};

export function HomeScreen({ navigation, userState }: HomeScreenProps) {
  const plan = userState.learningPlan;
  const lessonPath = getPlayableLessonsForPlan(plan);
  const completedCount = lessonPath.filter((lesson) => userState.completedLessons.includes(lesson.id)).length;
  const progress = lessonPath.length > 0 ? completedCount / lessonPath.length : 0;
  const dueCards = getDueReviewCards(userState.reviewCards);
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

    Alert.alert('Yakında', 'Bu modül yakında oynanabilir olacak. Şimdilik konuşma veya kelime pratiği yapabilirsin.');
  };

  const primaryTitle = nextLesson ? nextLesson.title : dueCards.length > 0 ? 'Kelime tekrarı' : 'Sesli cümle pratiği';
  const primaryMeta = nextLesson
    ? nextLesson.cefr + ' · ' + nextLesson.estimatedMinutes + ' dk'
    : dueCards.length > 0
      ? dueCards.length + ' kart hazır'
      : 'A1 konuşma · mock değerlendirme';
  const primaryButton = nextLesson ? 'Derse başla' : dueCards.length > 0 ? 'Tekrar et' : 'Sesli pratik aç';

  return (
    <Screen backgroundColor={colors.deepViolet}>
      <TopBar
        streak={userState.streak}
        subtitle={'Bugün ' + Math.min(userState.todayXp, dailyGoalXp) + '/' + dailyGoalXp + ' XP'}
        title={'Merhaba, ' + (userState.profile?.name ?? 'öğrenci')}
        xp={userState.xp}
      />
      <AppScrollView contentContainerStyle={styles.content} style={styles.scroll}>
        <View style={styles.todayCard}>
          <View style={styles.todayHeader}>
            <View style={styles.todayIcon}>
              <Sparkles color={colors.yellow} size={24} strokeWidth={2.6} />
            </View>
            <View style={styles.flexCopy}>
              <Text style={styles.kicker}>Bugün</Text>
              <Text style={styles.todayTitle}>{primaryTitle}</Text>
              <Text style={styles.todayMeta}>{primaryMeta}</Text>
            </View>
          </View>
          <View style={styles.goalBar}>
            <View style={[styles.goalFill, { flex: dailyProgress }]} />
            <View style={{ flex: 1 - dailyProgress }} />
          </View>
          <AppButton icon={BookOpen} onPress={startPrimary} title={primaryButton} />
        </View>

        <View style={styles.section}>
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
        </View>

        <View style={styles.quickActions}>
          <QuickAction icon={RotateCcw} label="Kelime" onPress={() => navigation.navigate('Main', { initialTab: 'vocab' })} />
          <QuickAction icon={NotebookTabs} label="Hatalarım" onPress={() => navigation.navigate('Main', { initialTab: 'profile' })} />
          <QuickAction icon={MessageCircle} label="Wolli" onPress={() => navigation.navigate('Main', { initialTab: 'chat' })} />
          <QuickAction icon={Mic} label="Sesli" onPress={() => navigation.navigate('SpeakingPractice', {})} />
        </View>

        {plan ? (
          <Pressable onPress={() => navigation.navigate('PlanOverview')} style={({ pressed }) => [styles.planStrip, pressed && styles.pressed]}>
            <Text style={styles.planTitle}>{plan.titleTr}</Text>
            <Text style={styles.planText}>{plan.currentLevel} → {plan.targetLevel} · {plan.dailyMinutes} dk/gün</Text>
          </Pressable>
        ) : null}
      </AppScrollView>
    </Screen>
  );
}

function QuickAction({ icon: Icon, label, onPress }: { icon: typeof RotateCcw; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}>
      <Icon color={colors.royalPurple} size={20} strokeWidth={2.6} />
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
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
  todayCard: {
    backgroundColor: colors.deepViolet,
    borderRadius: radius.lg,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  todayHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  todayIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.md,
    height: 52,
    justifyContent: 'center',
    width: 52,
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
    color: colors.white,
  },
  todayMeta: {
    ...typography.small,
    color: colors.lavender,
  },
  goalBar: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: radius.pill,
    flexDirection: 'row',
    height: 8,
    overflow: 'hidden',
  },
  goalFill: {
    backgroundColor: colors.yellow,
  },
  section: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
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
    backgroundColor: colors.lavender,
    borderRadius: radius.sm,
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
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
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexBasis: '22%',
    flexGrow: 1,
    gap: spacing.xs,
    minHeight: 76,
    justifyContent: 'center',
    padding: spacing.sm,
  },
  quickLabel: {
    ...typography.small,
    color: colors.deepViolet,
    fontWeight: '900',
    textAlign: 'center',
  },
  planStrip: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 2,
    padding: spacing.md,
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
