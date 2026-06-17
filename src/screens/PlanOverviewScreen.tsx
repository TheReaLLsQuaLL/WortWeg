import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { BookOpen, ChevronDown, ChevronUp, Map, Settings2 } from 'lucide-react-native';

import { AppButton } from '../components/AppButton';
import { AppScrollView, Screen } from '../components/layout';
import { TopBar } from '../components/TopBar';
import { getTrackById } from '../data/curriculum';
import { getNextPlayableLesson } from '../data/lessons';
import { colors, radius, spacing, typography } from '../data/theme';
import { getDueReviewCards } from '../lib/srs';
import type { CommitUserState, RootNavigation } from '../navigation/AppNavigator';
import { getTodayRecommendedActions } from '../services/planService';
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

const getStartLevelLabel = (level: string) => {
  if (level === 'zero') {
    return 'A0';
  }

  if (level === 'some') {
    return 'A1 öncesi';
  }

  return level;
};

export function PlanOverviewScreen({ navigation, userState }: PlanOverviewScreenProps) {
  const [showDetails, setShowDetails] = useState(false);
  const plan = userState.learningPlan;

  if (!plan) {
    return null;
  }

  const track = getTrackById(plan.selectedTrack);
  const dueCards = getDueReviewCards(userState.reviewCards);
  const actions = getTodayRecommendedActions(plan, { dueReviewCount: dueCards.length });
  const nextAction = actions[0];
  const nextLesson = getNextPlayableLesson(userState.completedLessons, plan);
  const firstMilestone = plan.milestones[0];
  const topSkills = Object.entries(plan.skillWeights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const goHome = () => {
    navigation.navigate('Main', { initialTab: 'home' });
  };

  const startFirstLesson = () => {
    if (!nextLesson) {
      Alert.alert('Yakında', 'Bu seviyedeki oynanabilir dersleri bitirdin. Yeni modüller yakında.');
      return;
    }

    navigation.navigate('LessonIntro', { lessonId: nextLesson.id });
  };

  return (
    <Screen backgroundColor={colors.deepViolet}>
      <TopBar streak={userState.streak} subtitle={track.titleTr} title="Planım" xp={userState.xp} />
      <AppScrollView contentContainerStyle={styles.content} style={styles.scroll}>
        <View style={styles.heroCard}>
          <Text style={styles.heroKicker}>Yol haritan</Text>
          <Text style={styles.heroTitle}>{plan.titleTr}</Text>
          <Text style={styles.heroText}>{getStartLevelLabel(plan.startLevel)} → {plan.targetLevel} · {plan.dailyMinutes} dk/gün</Text>
          {plan.placementUsed ? <Text style={styles.heroNote}>Seviye kontrolüne göre önerildi.</Text> : null}
          <AppButton icon={Map} onPress={goHome} title="Ana sayfaya geç" />
          <AppButton icon={BookOpen} onPress={startFirstLesson} title="İlk derse başla" variant="secondary" />
        </View>

        {nextAction ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bugünkü ilk adım</Text>
            <View style={styles.nextActionBox}>
              <Text style={styles.actionTitle}>{nextAction.titleTr}</Text>
              <Text style={styles.muted} numberOfLines={2}>{nextAction.descriptionTr}</Text>
              <Text style={styles.minutes}>{nextAction.estimatedMinutes} dk</Text>
            </View>
          </View>
        ) : null}

        {firstMilestone ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>İlk hafta</Text>
            <Text style={styles.milestoneTitle}>{firstMilestone.titleTr}</Text>
            <Text style={styles.body}>{firstMilestone.descriptionTr}</Text>
          </View>
        ) : null}

        <Pressable onPress={() => setShowDetails((value) => !value)} style={({ pressed }) => [styles.detailToggle, pressed && styles.pressed]}>
          <Text style={styles.detailToggleText}>{showDetails ? 'Plan detaylarını gizle' : 'Plan detaylarını göster'}</Text>
          {showDetails ? <ChevronUp color={colors.royalPurple} size={20} /> : <ChevronDown color={colors.royalPurple} size={20} />}
        </Pressable>

        {showDetails ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Odak beceriler</Text>
            <View style={styles.skillGrid}>
              {topSkills.map(([skill, weight]) => (
                <View key={skill} style={styles.skillPill}>
                  <Text style={styles.skillName}>{skillLabels[skill as keyof typeof skillLabels]}</Text>
                  <Text style={styles.skillValue}>x{weight.toFixed(2)}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.sectionTitle}>Kilometre taşları</Text>
            {plan.milestones.slice(0, 4).map((milestone) => (
              <View key={milestone.id} style={styles.milestone}>
                <Text style={styles.milestoneTitle}>{milestone.titleTr}</Text>
                <Text style={styles.muted}>Hafta {milestone.estimatedWeek}</Text>
              </View>
            ))}
            <View style={styles.actionsRow}>
              <AppButton icon={Map} onPress={() => navigation.navigate('CurriculumMap')} title="Müfredat" variant="secondary" style={styles.actionButton} />
              <AppButton icon={Settings2} onPress={() => navigation.navigate('PlanSetup', { mode: 'edit' })} title="Düzenle" variant="secondary" style={styles.actionButton} />
            </View>
          </View>
        ) : null}
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
  heroCard: {
    backgroundColor: colors.deepViolet,
    borderRadius: radius.lg,
    gap: spacing.md,
    padding: spacing.lg,
  },
  heroKicker: {
    ...typography.small,
    color: colors.yellow,
    fontWeight: '900',
  },
  heroTitle: {
    ...typography.heading,
    color: colors.white,
  },
  heroText: {
    ...typography.body,
    color: colors.lavender,
  },
  heroNote: {
    ...typography.small,
    color: colors.yellow,
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
  body: {
    ...typography.body,
    color: colors.muted,
  },
  muted: {
    ...typography.small,
    color: colors.muted,
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
  nextActionBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    gap: spacing.xs,
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
  milestoneTitle: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  detailToggle: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  detailToggleText: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
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
