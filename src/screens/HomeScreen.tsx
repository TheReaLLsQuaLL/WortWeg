import { BookOpen, ChevronRight, ClipboardCheck, MessageCircle, Mic, NotebookTabs, RotateCcw, Sparkles } from 'lucide-react-native';
import { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AnimatedCard } from '../components/AnimatedCard';
import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { HalftoneAccent } from '../components/HalftoneAccent';
import { OwlyMascot } from '../components/OwlyMascot';
import { ProgressPill } from '../components/ProgressPill';
import { AppScrollView, Screen } from '../components/layout';
import { CurriculumJourneyMap } from '../components/CurriculumJourneyMap';
import { TopBar } from '../components/TopBar';
import { getLessonById, getNextPlayableLesson, getPlayableLessonsForPlan, isLessonUnlocked } from '../data/lessons';
import { speakingLibrarySentences } from '../data/speakingLibrary';
import { colors, radius, shadows, spacing, typography } from '../data/theme';
import { formatSpeakingScorePercent, normalizeSpeakingStats } from '../lib/speakingStats';
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

  const startPrimary = () => {
    if (nextLesson) {
      navigation.navigate('LessonIntro', { lessonId: nextLesson.id });
      return;
    }

    if (dueCards.length > 0) {
      navigation.navigate('Main', { initialTab: 'vocab' });
      return;
    }

    navigation.navigate('SpeakingLibrary');
  };

  const primaryTitle = nextLesson ? nextLesson.title : dueCards.length > 0 ? 'Kelime tekrarı' : 'Sesli cümle pratiği';
  const primaryMeta = nextLesson
    ? nextLesson.cefr + ' · ' + nextLesson.estimatedMinutes + ' dk'
    : dueCards.length > 0
      ? dueCards.length + ' kart hazır'
      : speakingLibrarySentences.length + ' hazır cümle';
  const primaryButton = nextLesson ? 'Derse başla' : dueCards.length > 0 ? 'Tekrar et' : 'Sesli pratik aç';
  const latestExam = userState.examHistory[userState.examHistory.length - 1];
  const speakingStats = normalizeSpeakingStats(userState.speakingStats);
  const speakingPracticeDetail = speakingStats.totalAttempts > 0
    ? speakingStats.totalAttempts + ' deneme · en iyi ' + formatSpeakingScorePercent(speakingStats.bestScorePercent)
    : speakingLibrarySentences.length + ' hazır cümle';

  const coachGreeting = useMemo(() => {
    if (userState.completedLessons.length === 0) {
      return { title: 'Selam!', text: 'Ben Owly, Almanca koçun. Hadi ilk dersine başlayalım!' };
    }
    if (userState.streak > 2) {
      return { title: 'Harika!', text: `${userState.streak} gün üst üste pratik yapıyorsun. Devam edelim mi?` };
    }
    return { title: 'Hoş geldin!', text: 'Tekrar hoş geldin! Kaldığın yerden devam edelim.' };
  }, [userState.completedLessons.length, userState.streak]);

  const reviewItems = [];

  if (nextLesson) {
    reviewItems.push({
      id: 'nextLesson',
      icon: BookOpen,
      title: 'Derse devam et',
      detail: nextLesson.title,
      onPress: () => navigation.navigate('LessonIntro', { lessonId: nextLesson.id }),
    });
  }

  reviewItems.push({
    id: 'vocab',
    icon: RotateCcw,
    title: 'Kelime tekrarı',
    detail: dueCards.length > 0
      ? dueCards.length + ' kart hazır'
      : userState.reviewCards.length > 0
        ? 'Bugünlük tekrar tamam'
        : 'Derslerden kart açılır',
    onPress: () => navigation.navigate('Main', { initialTab: 'vocab' }),
  });

  if (mistakeCount > 0) {
    reviewItems.push({
      id: 'mistakes',
      icon: NotebookTabs,
      title: 'Hatalar',
      detail: mistakeCount + ' hata tekrar bekliyor',
      onPress: () => navigation.navigate('Mistakes'),
    });
  }

  reviewItems.push(
    {
      id: 'speaking',
      icon: Mic,
      title: 'Konuşma pratiği',
      detail: speakingPracticeDetail,
      onPress: () => navigation.navigate('SpeakingLibrary'),
    },
    {
      id: 'ai',
      icon: MessageCircle,
      title: 'Wolli ile pratik',
      detail: 'Kısa pratik yap',
      onPress: () => navigation.navigate('Chat'),
    },
    {
      id: 'exam',
      icon: ClipboardCheck,
      title: 'Sınav denemesi',
      detail: latestExam ? latestExam.score + '/' + latestExam.total + ' son deneme' : 'Kısa deneme aç',
      onPress: () => navigation.navigate('Main', { initialTab: 'exam' }),
    }
  );

  return (
    <Screen backgroundColor={colors.midnightBackground}>
      <TopBar
        streak={userState.streak}
        subtitle={(plan?.currentLevel ?? 'A0') + ' · Bugün ' + Math.min(userState.todayXp, dailyGoalXp) + '/' + dailyGoalXp + ' XP'}
        title="Bugün"
        xp={userState.xp}
      />
      <AppScrollView contentContainerStyle={styles.content} style={styles.scroll}>
        <View style={styles.coachWelcomeCard}>
          <View style={styles.coachMascot}>
            <OwlyMascot state="idle" width={100} height={100} />
          </View>
          <View style={styles.greetingBubble}>
            <Text style={styles.greetingTitle}>{coachGreeting.title}</Text>
            <Text style={styles.greetingText}>{coachGreeting.text}</Text>
            <View style={styles.greetingTail} />
          </View>
        </View>

        <AnimatedCard>
          <AppCard style={styles.todayCard}>
          <View style={styles.todayHeader}>
            <View style={styles.todayIcon}>
              <Sparkles color={colors.midnightBackground} size={24} strokeWidth={2.6} />
            </View>
            <View style={styles.flexCopy}>
              <ProgressPill label="Sıradaki adım" tone="yellow" />
              <Text style={styles.todayTitle}>{primaryTitle}</Text>
              <Text style={styles.todayMeta}>{primaryMeta}</Text>
            </View>
          </View>
          <View style={styles.goalBar}>
            <View style={[styles.goalFill, { flex: dailyProgress }]} />
            <View style={{ flex: 1 - dailyProgress }} />
          </View>
          <AppButton icon={BookOpen} onPress={startPrimary} title={primaryButton} variant="primary" />
          </AppCard>
        </AnimatedCard>

        <AnimatedCard delayMs={45}>
          <AppCard style={styles.reviewPanel}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Bugünkü çalışma planı</Text>
                <Text style={styles.muted}>Günlük hedeflerini tamamla.</Text>
              </View>
            </View>
            <View style={styles.reviewGrid}>
              {reviewItems.map((item) => (
                <ReviewPlanItem
                  detail={item.detail}
                  icon={item.icon}
                  key={item.id}
                  onPress={item.onPress}
                  title={item.title}
                />
              ))}
            </View>
          </AppCard>
        </AnimatedCard>

        <AnimatedCard delayMs={70}>
          <CurriculumJourneyMap
            lessonPath={lessonPath}
            completedLessonIds={userState.completedLessons}
            nextLessonId={nextLesson?.id}
            onPressLesson={(lessonId) => navigation.navigate('LessonIntro', { lessonId })}
          />
        </AnimatedCard>

        <AnimatedCard delayMs={120}>
        <View style={styles.quickActions}>
          <QuickAction badgeCount={dueCards.length} icon={RotateCcw} label="Kelime" onPress={() => navigation.navigate('Main', { initialTab: 'vocab' })} />
          <QuickAction badgeCount={mistakeCount} icon={NotebookTabs} label="Hatalar" onPress={() => navigation.navigate('Mistakes')} />
          <QuickAction icon={MessageCircle} label="Wolli" onPress={() => navigation.navigate('Chat')} />
          <QuickAction icon={Mic} label="Ses" onPress={() => navigation.navigate('SpeakingLibrary')} />
        </View>
        </AnimatedCard>


      </AppScrollView>
    </Screen>
  );
}

function QuickAction({ badgeCount = 0, icon: Icon, label, onPress }: { badgeCount?: number; icon: typeof RotateCcw; label: string; onPress: () => void }) {
  const badgeLabel = badgeCount > 99 ? '99+' : String(badgeCount);

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}>
      <Icon color={colors.cyanAccent} size={20} strokeWidth={2.6} />
      <Text style={styles.quickLabel}>{label}</Text>
      {badgeCount > 0 ? (
        <View style={styles.quickBadge}>
          <Text style={styles.quickBadgeText}>{badgeLabel}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function ReviewPlanItem({ detail, icon: Icon, onPress, title }: { detail: string; icon: typeof RotateCcw; onPress: () => void; title: string }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.reviewItem, pressed && styles.pressed]}>
      <View style={styles.reviewIconWrap}>
        <Icon color={colors.cyanAccent} size={19} strokeWidth={2.8} />
      </View>
      <View style={styles.reviewItemCopy}>
        <Text style={styles.reviewItemTitle}>{title}</Text>
        <Text style={styles.reviewItemDetail}>{detail}</Text>
      </View>
      <ChevronRight color={colors.muted} opacity={0.3} size={20} strokeWidth={2.8} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: colors.midnightBackground,
  },
  content: {
    backgroundColor: colors.midnightBackground,
    gap: spacing.md,
    padding: spacing.lg,
  },
  coachWelcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  coachMascot: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingBubble: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.comicBorderColor,
    position: 'relative',
    ...shadows.comicSmall,
  },
  greetingTitle: {
    ...typography.body,
    fontWeight: '900',
    color: colors.deepViolet,
    marginBottom: 2,
  },
  greetingText: {
    ...typography.small,
    color: colors.muted,
    fontWeight: '800',
  },
  greetingTail: {
    position: 'absolute',
    left: -10,
    top: '50%',
    marginTop: -10,
    width: 0,
    height: 0,
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderRightWidth: 10,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: colors.white,
  },
  todayCard: {
    backgroundColor: colors.midnightSurface,
    borderRadius: radius.xl,
    gap: spacing.lg,
    overflow: 'hidden',
    padding: spacing.xl,
    position: 'relative',
  },
  missionBurst: {
    backgroundColor: colors.cyanAccent,
    borderColor: colors.midnightAccent,
    borderRadius: 999,
    borderWidth: colors.comicBorderWidth,
    height: 164,
    opacity: 0.1,
    position: 'absolute',
    right: -46,
    top: -62,
    width: 164,
  },
  missionSticker: {
    alignItems: 'center',
    backgroundColor: colors.yellowCta,
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
    color: colors.comicBorderColor,
    fontWeight: '900',
  },
  todayHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  todayIcon: {
    alignItems: 'center',
    backgroundColor: colors.cyanAccent,
    borderColor: colors.midnightAccent,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  flexCopy: {
    flex: 1,
    gap: 4,
  },
  kicker: {
    ...typography.small,
    color: colors.yellow,
    fontWeight: '900',
  },
  todayTitle: {
    ...typography.heading,
    color: colors.white,
    fontWeight: '900',
  },
  todayMeta: {
    ...typography.small,
    color: colors.lavender,
    fontWeight: '800',
  },
  goalBar: {
    backgroundColor: colors.midnightAccent,
    borderColor: colors.midnightAccent,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    height: 8,
    overflow: 'hidden',
  },
  goalFill: {
    backgroundColor: colors.cyanAccent,
  },
  section: {
    backgroundColor: colors.paper,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    position: 'relative',
    ...shadows.comic,
  },
  reviewPanel: {
    backgroundColor: colors.midnightSurface,
    borderColor: colors.midnightAccent,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  reviewGrid: {
    gap: spacing.sm,
  },
  reviewItem: {
    alignItems: 'center',
    backgroundColor: colors.midnightBackground,
    borderColor: colors.midnightAccent,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 76,
    padding: spacing.md,
  },
  reviewIconWrap: {
    alignItems: 'center',
    backgroundColor: colors.midnightAccent,
    borderColor: colors.midnightAccent,
    borderRadius: radius.md,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  reviewItemCopy: {
    flex: 1,
    gap: 2,
  },
  reviewItemTitle: {
    ...typography.small,
    color: colors.white,
    fontWeight: '900',
  },
  reviewItemDetail: {
    ...typography.small,
    color: colors.muted,
    fontWeight: '800',
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.heading,
    color: colors.white,
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
    transform: [{ rotate: '2deg' }],
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
    backgroundColor: colors.midnightSurface,
    borderColor: colors.midnightAccent,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexBasis: '46%',
    flexDirection: 'row',
    flexGrow: 1,
    gap: spacing.xs,
    minHeight: 58,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  todayTexture: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  quickLabel: {
    ...typography.small,
    color: colors.white,
    fontWeight: '900',
    textAlign: 'center',
  },
  quickBadge: {
    alignItems: 'center',
    backgroundColor: colors.yellowCta,
    borderColor: colors.midnightAccent,
    borderRadius: radius.pill,
    borderWidth: 1,
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
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    gap: 2,
    padding: spacing.md,
    ...shadows.comicSmall,
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
  mapPanelTexture: {
    bottom: -20,
    height: 180,
    left: -20,
    position: 'absolute',
    width: 220,
  },
});
