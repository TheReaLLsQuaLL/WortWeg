import { BookOpen, CalendarDays, ClipboardList, Map, Mic, PenLine, RotateCcw, Settings2 } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View, type ColorValue } from 'react-native';

import { AppButton } from '../components/AppButton';
import { AppScrollView, Screen } from '../components/layout';
import { TopBar } from '../components/TopBar';
import { getModuleById, getTrackById } from '../data/curriculum';
import { lessonsA1 } from '../data/lessons.a1';
import { colors, radius, spacing, typography } from '../data/theme';
import { getDueReviewCards } from '../lib/srs';
import type { CommitUserState, RootNavigation } from '../navigation/AppNavigator';
import { estimateTargetDate, getTodayRecommendedActions } from '../services/planService';
import type { RecommendedAction } from '../types/learningPlan';
import type { UserState } from '../types/userState';

type PlanOverviewScreenProps = {
  navigation: RootNavigation;
  userState: UserState;
  onUpdateState: CommitUserState;
};

const skillLabels = {
  reading: 'Okuma',
  listening: 'Dinleme',
  speaking: 'Konuşma',
  writing: 'Yazma',
  grammar: 'Gramer',
  vocabulary: 'Kelime',
  pronunciation: 'Telaffuz',
};

const actionIcons = {
  lesson: BookOpen,
  srs: RotateCcw,
  speaking: Mic,
  listening: BookOpen,
  writing: PenLine,
  exam: ClipboardList,
  review: RotateCcw,
};

const getStartLevelLabel = (level: string) => {
  if (level === 'zero') {
    return 'A0 / Sıfırdan';
  }

  if (level === 'some') {
    return 'A1 öncesi / Biraz biliyorum';
  }

  return level;
};

export function PlanOverviewScreen({ navigation, userState }: PlanOverviewScreenProps) {
  const plan = userState.learningPlan;

  if (!plan) {
    return null;
  }

  const track = getTrackById(plan.selectedTrack);
  const nextModule = getModuleById(plan.currentModuleId);
  const dueCards = getDueReviewCards(userState.reviewCards);
  const actions = getTodayRecommendedActions(plan, { dueReviewCount: dueCards.length });
  const topSkills = Object.entries(plan.skillWeights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  const targetDate = estimateTargetDate(plan);

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
      const nextLesson = lessonsA1.find((lesson, index) => {
        const previousLessonId = lessonsA1[index - 1]?.id;
        return !userState.completedLessons.includes(lesson.id) && (index === 0 || userState.completedLessons.includes(previousLessonId ?? ''));
      });

      if (nextLesson) {
        navigation.navigate('LessonIntro', { lessonId: nextLesson.id });
        return;
      }
    }

    navigation.navigate('CurriculumMap');
  };

  return (
    <Screen backgroundColor={colors.deepViolet}>
      <TopBar
        streak={userState.streak}
        subtitle={track.titleTr}
        title="Planım"
        xp={userState.xp}
      />
      <AppScrollView contentContainerStyle={styles.content} style={styles.scroll}>
        <View style={styles.heroCard}>
          <Text style={styles.heroKicker}>Aktif yol haritası</Text>
          <Text style={styles.heroTitle}>{plan.titleTr}</Text>
          <Text style={styles.heroText}>
            {plan.currentLevel} → {plan.targetLevel} · {plan.dailyMinutes} dk/gün · yaklaşık {plan.estimatedWeeks} hafta
          </Text>
          <Text style={styles.heroText}>
            Başlangıç seviyesi: {getStartLevelLabel(plan.startLevel)}{plan.placementUsed ? ' · Seviye kontrolüne göre önerildi.' : ''}
          </Text>
          <View style={styles.heroMetaRow}>
            <View style={styles.heroMeta}>
              <CalendarDays color={colors.yellow} size={18} />
              <Text style={styles.heroMetaText}>Tahmini hedef: {targetDate}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bugün önerilenler</Text>
          {actions.map((action) => (
            <ActionRow key={action.id} action={action} onPress={() => openAction(action)} />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sıradaki modül</Text>
          {nextModule ? (
            <View style={styles.moduleBox}>
              <Text style={styles.moduleLevel}>{nextModule.level} · {nextModule.estimatedMinutes} dk</Text>
              <Text style={styles.moduleTitle}>{nextModule.titleTr}</Text>
              <Text style={styles.body}>{nextModule.goalTr}</Text>
              <View style={styles.tags}>
                {nextModule.topics.slice(0, 4).map((topic) => (
                  <Text key={topic} style={styles.tag}>{topic}</Text>
                ))}
              </View>
            </View>
          ) : (
            <Text style={styles.body}>Bu plan için sıradaki modül bulunamadı.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Beceri odağı</Text>
          <View style={styles.skillGrid}>
            {topSkills.map(([skill, weight]) => (
              <View key={skill} style={styles.skillPill}>
                <Text style={styles.skillName}>{skillLabels[skill as keyof typeof skillLabels]}</Text>
                <Text style={styles.skillValue}>x{weight.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kilometre taşları</Text>
          {plan.milestones.slice(0, 5).map((milestone) => (
            <View key={milestone.id} style={styles.milestone}>
              <Text style={styles.milestoneTitle}>{milestone.titleTr}</Text>
              <Text style={styles.body}>{milestone.descriptionTr}</Text>
              <Text style={styles.muted}>Tahmini hafta: {milestone.estimatedWeek}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actionsRow}>
          <AppButton icon={Map} onPress={() => navigation.navigate('CurriculumMap')} title="Müfredat" variant="secondary" style={styles.actionButton} />
          <AppButton icon={Settings2} onPress={() => navigation.navigate('PlanSetup', { mode: 'edit' })} title="Düzenle" variant="secondary" style={styles.actionButton} />
        </View>
      </AppScrollView>
    </Screen>
  );
}

function ActionRow({ action, onPress }: { action: RecommendedAction; onPress: () => void }) {
  const Icon = actionIcons[action.type];

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}>
      <View style={styles.actionIcon}>
        <Icon color={colors.royalPurple as ColorValue} size={20} strokeWidth={2.5} />
      </View>
      <View style={styles.actionCopy}>
        <Text style={styles.actionTitle}>{action.titleTr}</Text>
        <Text style={styles.muted}>{action.descriptionTr}</Text>
      </View>
      <Text style={styles.minutes}>{action.estimatedMinutes} dk</Text>
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
  heroCard: {
    backgroundColor: colors.deepViolet,
    borderRadius: radius.lg,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  heroKicker: {
    ...typography.small,
    color: colors.yellow,
  },
  heroTitle: {
    ...typography.heading,
    color: colors.white,
  },
  heroText: {
    ...typography.body,
    color: colors.lavender,
  },
  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  heroMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  heroMetaText: {
    ...typography.small,
    color: colors.lavender,
  },
  section: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  actionRow: {
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
  actionCopy: {
    flex: 1,
    gap: 2,
  },
  actionTitle: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  minutes: {
    ...typography.small,
    color: colors.royalPurple,
  },
  moduleBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    gap: spacing.sm,
    padding: spacing.md,
  },
  moduleLevel: {
    ...typography.small,
    color: colors.royalPurple,
  },
  moduleTitle: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  body: {
    ...typography.body,
    color: colors.muted,
  },
  muted: {
    ...typography.small,
    color: colors.muted,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    ...typography.small,
    backgroundColor: colors.lavender,
    borderRadius: radius.sm,
    color: colors.deepViolet,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  skillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  skillPill: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    flexGrow: 1,
    minWidth: 130,
    padding: spacing.md,
  },
  skillName: {
    ...typography.small,
    color: colors.deepViolet,
  },
  skillValue: {
    ...typography.heading,
    color: colors.royalPurple,
  },
  milestone: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    gap: spacing.xs,
    padding: spacing.md,
  },
  milestoneTitle: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  pressed: {
    opacity: 0.82,
  },
});
