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

  const recentActivities = useMemo(() => {
    const activities: Array<{ id: string; type: string; title: string; timestamp: string; meta?: string }> = [];

    Object.entries(userState.lessonProgress).forEach(([lessonId, progress]) => {
      if (progress.completed && progress.lastStudiedAt) {
        const lesson = getLessonById(lessonId);
        activities.push({
          id: `lesson-${lessonId}`,
          type: 'lesson',
          title: 'Ders Tamamlandı',
          meta: lesson ? lesson.title : undefined,
          timestamp: progress.lastStudiedAt,
        });
      }
    });

    if (userState.speakingStats.lastPracticedAt) {
      activities.push({
        id: 'speaking',
        type: 'speaking',
        title: 'Sesli Pratik',
        timestamp: userState.speakingStats.lastPracticedAt,
      });
    }

    userState.examHistory.forEach((exam, idx) => {
      activities.push({
        id: `exam-${idx}`,
        type: 'exam',
        title: 'Sınav Denemesi',
        meta: `%${Math.round((exam.score / Math.max(1, exam.total)) * 100)} Başarı`,
        timestamp: exam.date,
      });
    });

    const userMessages = userState.chatMessages.filter(m => m.role === 'user');
    if (userMessages.length > 0) {
      const lastMessage = userMessages[userMessages.length - 1];
      if (lastMessage) {
        activities.push({
          id: 'chat',
          type: 'chat',
          title: 'Wolli ile Sohbet',
          timestamp: lastMessage.createdAt,
        });
      }
    }

    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 3);
  }, [userState]);

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
        <View style={styles.mascotContainer}>
          <View style={styles.greetingBubble}>
            <Text style={styles.greetingText}>Guten Morgen! Pratiğe devam edelim mi?</Text>
            <View style={styles.greetingTail} />
          </View>
          <OwlyMascot state="idle" width={140} height={140} />
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

        <AnimatedCard delayMs={60}>
          <AppCard style={styles.reviewPanel}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Son Çalışmalar</Text>
                <Text style={styles.muted}>Yakın zamanda tamamladığın aktiviteler.</Text>
              </View>
            </View>

            {recentActivities.length === 0 ? (
              <View style={{ paddingVertical: spacing.md, alignItems: 'center' }}>
                <Text style={styles.muted}>Henüz tamamlanmış bir çalışma yok.</Text>
                <Text style={[styles.muted, { fontSize: 12, marginTop: spacing.xs, textAlign: 'center' }]}>Bir ders veya pratik seçerek hemen öğrenmeye başla.</Text>
              </View>
            ) : (
              <View style={styles.reviewGrid}>
                {recentActivities.map((activity) => {
                  let Icon = BookOpen;
                  if (activity.type === 'speaking') Icon = Mic;
                  if (activity.type === 'exam') Icon = ClipboardCheck;
                  if (activity.type === 'chat') Icon = MessageCircle;

                  const activityDate = new Date(activity.timestamp);
                  const isToday = new Date().toDateString() === activityDate.toDateString();
                  const isYesterday = new Date(Date.now() - 86400000).toDateString() === activityDate.toDateString();
                  const timeLabel = isToday ? 'Bugün' : isYesterday ? 'Dün' : activityDate.toLocaleDateString('tr-TR');

                  const detail = activity.meta ? `${activity.meta} · ${timeLabel}` : timeLabel;

                  return (
                    <View key={activity.id} style={[styles.reviewItem, { paddingVertical: spacing.sm, paddingHorizontal: spacing.sm }]}>
                      <View style={[styles.reviewIconWrap, { backgroundColor: colors.paper }]}>
                        <Icon color={colors.royalPurple} size={19} strokeWidth={2.8} />
                      </View>
                      <View style={styles.reviewItemCopy}>
                        <Text style={styles.reviewItemTitle}>{activity.title}</Text>
                        <Text style={styles.reviewItemDetail}>{detail}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
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

function ReviewPlanItem({ detail, icon: Icon, onPress, title }: { detail: string; icon: typeof RotateCcw; onPress: () => void; title: string }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.reviewItem, pressed && styles.pressed]}>
      <View style={styles.reviewIconWrap}>
        <Icon color={colors.comicBorderColor} size={19} strokeWidth={2.8} />
      </View>
      <View style={styles.reviewItemCopy}>
        <Text style={styles.reviewItemTitle}>{title}</Text>
        <Text style={styles.reviewItemDetail}>{detail}</Text>
      </View>
      <ChevronRight color={colors.comicBorderColor} opacity={0.3} size={20} strokeWidth={2.8} />
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
  mascotContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    position: 'relative',
  },
  greetingBubble: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    position: 'relative',
    ...shadows.comic,
  },
  greetingText: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '800',
  },
  greetingTail: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.white,
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
    backgroundColor: colors.primaryPurple,
    borderColor: colors.cyanAccent,
    borderRadius: 999,
    borderWidth: colors.comicBorderWidth,
    height: 164,
    opacity: 0.82,
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
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.md,
    padding: spacing.lg,
    ...shadows.comic,
  },
  reviewGrid: {
    gap: spacing.sm,
  },
  reviewItem: {
    alignItems: 'center',
    backgroundColor: colors.paperLavender,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.lg,
    borderWidth: colors.comicBorderWidth,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 76,
    padding: spacing.md,
    ...shadows.comicSmall,
  },
  reviewIconWrap: {
    alignItems: 'center',
    backgroundColor: colors.yellowCta,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.md,
    borderWidth: colors.comicBorderWidth,
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
    color: colors.deepViolet,
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
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.lg,
    borderWidth: colors.comicBorderWidth,
    flexBasis: '46%',
    flexDirection: 'row',
    flexGrow: 1,
    gap: spacing.xs,
    minHeight: 58,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.comicSmall,
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
