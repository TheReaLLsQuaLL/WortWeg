import { useMemo, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ArrowLeft, Check } from 'lucide-react-native';

import { AppButton } from '../components/AppButton';
import { Chip } from '../components/Chip';
import { AppScrollView, Screen } from '../components/layout';
import {
  dailyMinuteOptions,
  goalOptions,
  prioritySkillOptions,
  startLevelOptions,
  studyStyleOptions,
  targetLevelOptions,
} from '../data/planOptions';
import { colors, radius, spacing, typography } from '../data/theme';
import { createLearningPlan, getDailyGoalXp } from '../services/planService';
import { trackLocalEvent } from '../services/localEventLog';
import type { LearningPlanInput } from '../types/learningPlan';
import type { OnboardingProfile, UserState } from '../types/userState';
import type { CommitUserState, RootNavigation } from '../navigation/AppNavigator';

type PlanSetupScreenProps = {
  navigation: RootNavigation;
  userState: UserState;
  onUpdateState: CommitUserState;
};

export function PlanSetupScreen({ navigation, userState, onUpdateState }: PlanSetupScreenProps) {
  const plan = userState.learningPlan;
  const profile = userState.profile;
  const savedStartLevel = plan?.startLevel === 'A0' ? 'zero' : plan?.startLevel ?? profile?.startLevel ?? 'zero';
  const [userGoal, setUserGoal] = useState<LearningPlanInput['userGoal']>(plan?.userGoal ?? profile?.goalId ?? 'daily_life');
  const [startLevel, setStartLevel] = useState<LearningPlanInput['startLevel']>(savedStartLevel);
  const [targetLevel, setTargetLevel] = useState<LearningPlanInput['targetLevel']>(plan?.targetLevel ?? profile?.targetLevel ?? 'A1');
  const [dailyMinutes, setDailyMinutes] = useState<LearningPlanInput['dailyMinutes']>(plan?.dailyMinutes ?? 10);
  const [examDate, setExamDate] = useState(plan?.examDate ?? profile?.examDate ?? '');
  const [prioritySkill, setPrioritySkill] = useState<LearningPlanInput['prioritySkill']>(profile?.prioritySkill ?? 'speaking');
  const [studyStyle, setStudyStyle] = useState<LearningPlanInput['studyStyle']>(profile?.studyStyle ?? 'balanced');
  const [saving, setSaving] = useState(false);

  const preview = useMemo(
    () => createLearningPlan({ userGoal, startLevel, selfSelectedLevel: startLevel, targetLevel, dailyMinutes, examDate, prioritySkill, studyStyle }),
    [dailyMinutes, examDate, prioritySkill, startLevel, studyStyle, targetLevel, userGoal],
  );

  const save = async () => {
    setSaving(true);
    const learningPlan = createLearningPlan({ userGoal, startLevel, selfSelectedLevel: startLevel, targetLevel, dailyMinutes, examDate, prioritySkill, studyStyle });
    trackLocalEvent({
      type: 'plan_created',
      screen: 'PlanSetup',
      action: 'edit_plan',
      metadata: { level: learningPlan.currentLevel, moduleId: learningPlan.currentModuleId },
    });
    const goalLabel = goalOptions.find((option) => option.id === userGoal)?.label ?? 'Günlük yaşam';

    await onUpdateState((state) => {
      const nextProfile: OnboardingProfile = {
        ...(state.profile ?? { name: 'WortWeg öğrencisi', goal: goalLabel, dailyGoalMinutes: dailyMinutes }),
        goal: goalLabel,
        goalId: userGoal,
        dailyGoalMinutes: dailyMinutes,
        dailyGoalXp: getDailyGoalXp(dailyMinutes),
        level: startLevel === 'A2' ? 'a2' : startLevel === 'A1' || startLevel === 'some' ? 'a1' : 'a0',
        reason: goalLabel,
        startLevel,
        targetLevel,
        examDate: examDate.trim() || undefined,
        prioritySkill,
        studyStyle,
      };

      return {
        ...state,
        profile: nextProfile,
        learningPlan,
      };
    });

    setSaving(false);
    navigation.navigate('PlanOverview');
  };

  return (
    <Screen backgroundColor={colors.deepViolet}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft color={colors.white} size={22} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.kicker}>Plan ayarları</Text>
          <Text style={styles.headerTitle}>Planı düzenle</Text>
        </View>
      </View>

      <AppScrollView contentContainerStyle={styles.content} style={styles.scroll}>
        <View style={styles.panel}>
          <Question title="Hedefin">
            {goalOptions.map((item) => (
              <Chip key={item.id} label={item.label} onPress={() => setUserGoal(item.id)} selected={userGoal === item.id} tone="purple" />
            ))}
          </Question>
          <Question title="Başlangıç">
            {startLevelOptions.map((item) => (
              <Chip key={item.id} label={item.label} onPress={() => setStartLevel(item.id)} selected={startLevel === item.id} tone="plain" />
            ))}
          </Question>
          <Question title="Hedef seviye">
            {targetLevelOptions.map((item) => (
              <Chip key={item.id} label={item.label} onPress={() => setTargetLevel(item.id)} selected={targetLevel === item.id} tone="yellow" />
            ))}
          </Question>
          <Question title="Günlük süre">
            {dailyMinuteOptions.map((item) => (
              <Chip key={item.id} label={item.label} onPress={() => setDailyMinutes(item.id)} selected={dailyMinutes === item.id} tone="green" />
            ))}
          </Question>
          <Text style={styles.label}>Sınav tarihi</Text>
          <TextInput
            autoCapitalize="none"
            onChangeText={setExamDate}
            placeholder="Opsiyonel · örn. 2026-09-20"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={examDate}
          />
          <Question title="Odak beceri">
            {prioritySkillOptions.map((item) => (
              <Chip key={item.id} label={item.label} onPress={() => setPrioritySkill(item.id)} selected={prioritySkill === item.id} tone="purple" />
            ))}
          </Question>
          <Question title="Plan tarzı">
            {studyStyleOptions.map((item) => (
              <Chip key={item.id} label={item.label} onPress={() => setStudyStyle(item.id)} selected={studyStyle === item.id} tone="plain" />
            ))}
          </Question>
        </View>

        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>{preview.titleTr}</Text>
          <Text style={styles.previewText}>{preview.currentLevel} → {preview.targetLevel} · yaklaşık {preview.estimatedWeeks} hafta</Text>
          <Text style={styles.previewText}>Sıradaki: {preview.recommendedNextActions[0]?.titleTr ?? 'Hazır'}</Text>
        </View>

        <AppButton icon={Check} loading={saving} onPress={save} title="Planı kaydet" />
      </AppScrollView>
    </Screen>
  );
}

function Question({ children, title }: { children: ReactNode; title: string }) {
  return (
    <View style={styles.question}>
      <Text style={styles.label}>{title}</Text>
      <View style={styles.chips}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  },
  kicker: {
    ...typography.small,
    color: colors.yellow,
  },
  headerTitle: {
    ...typography.heading,
    color: colors.white,
  },
  scroll: {
    backgroundColor: colors.surface,
  },
  content: {
    backgroundColor: colors.surface,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  panel: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  question: {
    gap: spacing.sm,
  },
  label: {
    ...typography.small,
    color: colors.deepViolet,
    fontWeight: '800',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.deepViolet,
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  previewCard: {
    backgroundColor: colors.deepViolet,
    borderRadius: radius.lg,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  previewTitle: {
    ...typography.heading,
    color: colors.white,
  },
  previewText: {
    ...typography.body,
    color: colors.lavender,
  },
});
