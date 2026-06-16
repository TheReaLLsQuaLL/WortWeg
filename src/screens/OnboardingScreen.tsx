import { useMemo, useState, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight, Sparkles } from 'lucide-react-native';

import { AppButton } from '../components/AppButton';
import { Chip } from '../components/Chip';
import { Mascot } from '../components/Mascot';
import {
  dailyMinuteOptions,
  goalOptions,
  prioritySkillOptions,
  startLevelOptions,
  studyStyleOptions,
  targetLevelOptions,
} from '../data/planOptions';
import { colors, radius, spacing, typography } from '../data/theme';
import type { RootNavigation } from '../navigation/AppNavigator';
import { createLearningPlan } from '../services/planService';
import { buildOnboardingCompletion, type OnboardingCompletion } from '../services/onboardingService';
import type { LearningPlanInput } from '../types/learningPlan';

export type OnboardingScreenProps = {
  navigation: RootNavigation;
  onComplete: (result: OnboardingCompletion) => Promise<void>;
};

const getGoalDescription = (goalId: LearningPlanInput['userGoal']) =>
  goalOptions.find((option) => option.id === goalId)?.descriptionTr ?? '';

export function OnboardingScreen({ navigation, onComplete }: OnboardingScreenProps) {
  const [name, setName] = useState('');
  const [userGoal, setUserGoal] = useState<LearningPlanInput['userGoal']>('daily_life');
  const [startLevel, setStartLevel] = useState<LearningPlanInput['startLevel']>('zero');
  const [targetLevel, setTargetLevel] = useState<LearningPlanInput['targetLevel']>('A1');
  const [dailyMinutes, setDailyMinutes] = useState<LearningPlanInput['dailyMinutes']>(10);
  const [examDate, setExamDate] = useState('');
  const [prioritySkill, setPrioritySkill] = useState<LearningPlanInput['prioritySkill']>('speaking');
  const [studyStyle, setStudyStyle] = useState<LearningPlanInput['studyStyle']>('balanced');
  const [saving, setSaving] = useState(false);

  const setupInput = useMemo<LearningPlanInput>(
    () => ({
      userGoal,
      startLevel,
      selfSelectedLevel: startLevel,
      targetLevel,
      dailyMinutes,
      examDate,
      prioritySkill,
      studyStyle,
    }),
    [dailyMinutes, examDate, prioritySkill, startLevel, studyStyle, targetLevel, userGoal],
  );

  const planPreview = useMemo(
    () => createLearningPlan(setupInput),
    [setupInput],
  );

  const skipPlacement = async () => {
    setSaving(true);
    const learningPlan = createLearningPlan(setupInput);

    await onComplete(buildOnboardingCompletion({
      input: setupInput,
      learningPlan,
      name,
    }));
    setSaving(false);
  };

  const startPlacement = () => {
    navigation.navigate('PlacementTest', {
      setup: setupInput,
      profileName: name.trim() || undefined,
    });
  };

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.deepViolet]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
          style={styles.keyboard}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            contentInsetAdjustmentBehavior="automatic"
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.hero}>
              <Mascot size={88} />
              <View style={styles.heroCopy}>
                <Text style={styles.kicker}>Wolli yol haritanı hazırlıyor</Text>
                <Text style={styles.title}>WortWeg</Text>
                <Text style={styles.subtitle}>
                  Hedefini seç, günlük zamanını söyle; istersen kısa bir seviye kontrolüyle başlangıcını netleştirelim.
                </Text>
              </View>
            </View>

            <View style={styles.panel}>
              <Text style={styles.label}>Adın</Text>
              <TextInput
                autoCapitalize="words"
                onChangeText={setName}
                placeholder="Örn. Ece"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={name}
              />

              <Question title="Neden Almanca öğrenmek istiyorsun?">
                {goalOptions.map((item) => (
                  <Chip
                    key={item.id}
                    label={item.label}
                    onPress={() => setUserGoal(item.id)}
                    selected={userGoal === item.id}
                    tone="purple"
                  />
                ))}
              </Question>
              <Text style={styles.helper}>{getGoalDescription(userGoal)}</Text>

              <Question title="Şu anki seviyen ne?">
                {startLevelOptions.map((item) => (
                  <Chip
                    key={item.id}
                    label={item.label}
                    onPress={() => setStartLevel(item.id)}
                    selected={startLevel === item.id}
                    tone="plain"
                  />
                ))}
              </Question>

              <Question title="Hedef seviyen ne?">
                {targetLevelOptions.map((item) => (
                  <Chip
                    key={item.id}
                    label={item.label}
                    onPress={() => setTargetLevel(item.id)}
                    selected={targetLevel === item.id}
                    tone="yellow"
                  />
                ))}
              </Question>

              <Question title="Günde ne kadar çalışabilirsin?">
                {dailyMinuteOptions.map((item) => (
                  <Chip
                    key={item.id}
                    label={item.label}
                    onPress={() => setDailyMinutes(item.id)}
                    selected={dailyMinutes === item.id}
                    tone="green"
                  />
                ))}
              </Question>

              <Text style={styles.label}>Sınav tarihin var mı?</Text>
              <TextInput
                autoCapitalize="none"
                onChangeText={setExamDate}
                placeholder="Yoksa boş bırak · örn. 2026-09-20"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={examDate}
              />

              <Question title="En önemli beceri hangisi?">
                {prioritySkillOptions.map((item) => (
                  <Chip
                    key={item.id}
                    label={item.label}
                    onPress={() => setPrioritySkill(item.id)}
                    selected={prioritySkill === item.id}
                    tone="purple"
                  />
                ))}
              </Question>

              <Question title="Nasıl bir plan istersin?">
                {studyStyleOptions.map((item) => (
                  <Chip
                    key={item.id}
                    label={item.label}
                    onPress={() => setStudyStyle(item.id)}
                    selected={studyStyle === item.id}
                    tone="plain"
                  />
                ))}
              </Question>

              <View style={styles.previewCard}>
                <View style={styles.previewHeader}>
                  <Sparkles color={colors.yellow} size={20} />
                  <Text style={styles.previewTitle}>{planPreview.titleTr}</Text>
                </View>
                <Text style={styles.previewText}>
                  {planPreview.currentLevel} → {planPreview.targetLevel} · yaklaşık {planPreview.estimatedWeeks} hafta · {planPreview.dailyMinutes} dk/gün
                </Text>
                <Text style={styles.previewText}>
                  İlk modül: {planPreview.recommendedNextActions[0]?.titleTr ?? 'Hazır'}
                </Text>
              </View>

              <View style={styles.placementCard}>
                <Text style={styles.placementTitle}>Kısa bir seviye kontrolü yapmak ister misin?</Text>
                <Text style={styles.placementText}>
                  2 dakikalık yerel test, seçtiğin seviyeyi kontrol eder. Gemini veya dış servis kullanılmaz.
                </Text>
                <AppButton
                  icon={ArrowRight}
                  onPress={startPlacement}
                  title="Evet, 2 dakikalık test"
                  disabled={saving}
                />
                <AppButton
                  loading={saving}
                  onPress={skipPlacement}
                  title="Atla, seçtiğim seviyeden başla"
                  variant="secondary"
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
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
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    gap: spacing.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingTop: spacing.xl,
  },
  heroCopy: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  kicker: {
    ...typography.small,
    color: colors.yellow,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.white,
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 52,
  },
  subtitle: {
    ...typography.body,
    color: colors.lavender,
    maxWidth: 340,
    textAlign: 'center',
  },
  panel: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
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
  helper: {
    ...typography.small,
    color: colors.muted,
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
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  previewCard: {
    backgroundColor: colors.deepViolet,
    borderRadius: radius.md,
    gap: spacing.xs,
    padding: spacing.md,
  },
  previewHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  previewTitle: {
    ...typography.body,
    color: colors.white,
    fontWeight: '900',
  },
  previewText: {
    ...typography.small,
    color: colors.lavender,
  },
  placementCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  placementTitle: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  placementText: {
    ...typography.small,
    color: colors.muted,
  },
});
