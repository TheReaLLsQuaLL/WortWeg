import { useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Check,
  GraduationCap,
  HeartHandshake,
  HelpCircle,
  Home,
  Plane,
  Sparkles,
} from 'lucide-react-native';

import { AnimatedCard } from '../components/AnimatedCard';
import { AppButton } from '../components/AppButton';
import { Mascot } from '../components/Mascot';
import { OnboardingProgressHeader } from '../components/OnboardingProgressHeader';
import {
  dailyMinuteOptions,
  goalOptions,
  prioritySkillOptions,
  startLevelOptions,
  targetLevelOptions,
} from '../data/planOptions';
import { colors, radius, spacing, typography } from '../data/theme';
import type { RootNavigation } from '../navigation/AppNavigator';
import { buildOnboardingCompletion, type OnboardingCompletion } from '../services/onboardingService';
import { trackLocalEvent } from '../services/localEventLog';
import { createLearningPlan } from '../services/planService';
import type {
  DailyMinutes,
  LearningPlanInput,
  PrioritySkillId,
  StartLevelId,
  StudyStyleId,
  TargetLevelId,
  UserGoalId,
} from '../types/learningPlan';

export type OnboardingScreenProps = {
  navigation: RootNavigation;
  onComplete: (result: OnboardingCompletion) => Promise<void>;
};

type IconProps = { color?: string; size?: number; strokeWidth?: number };

type GoalCard = {
  id: UserGoalId;
  label: string;
  icon: ComponentType<IconProps>;
};

type OnboardingStepId =
  | 'welcome'
  | 'goal'
  | 'level'
  | 'placement'
  | 'daily_time'
  | 'focus'
  | 'target'
  | 'ready';

const onboardingSteps: OnboardingStepId[] = [
  'welcome',
  'goal',
  'level',
  'placement',
  'daily_time',
  'focus',
  'target',
  'ready',
];

const goalIcons: Record<UserGoalId, ComponentType<IconProps>> = {
  exam: BookOpen,
  daily_life: Home,
  work: BriefcaseBusiness,
  travel: Plane,
  family: HeartHandshake,
  university: GraduationCap,
  curiosity: HelpCircle,
};

const shortGoalLabels: Partial<Record<UserGoalId, string>> = {
  daily_life: 'Günlük yaşam',
  work: 'İş',
  family: 'Aile',
  university: 'Okul',
};

const goalCards: GoalCard[] = goalOptions
  .filter((option) => option.id !== 'curiosity')
  .map((option) => ({
    id: option.id,
    label: shortGoalLabels[option.id] ?? option.label,
    icon: goalIcons[option.id],
  }));

const levelEmoji: Record<StartLevelId, string> = {
  zero: '0',
  some: '…',
  A0: 'A0',
  A1: 'A1',
  A2: 'A2',
  B1: 'B1',
};

const focusEmoji: Record<PrioritySkillId, string> = {
  speaking: '🗣',
  exam: '✓',
  vocabulary: 'Aa',
  grammar: '§',
  listening: '♪',
  writing: '✎',
};

const getStudyStyle = (
  userGoal: LearningPlanInput['userGoal'],
  prioritySkill: LearningPlanInput['prioritySkill'],
): StudyStyleId => {
  if (userGoal === 'exam' || prioritySkill === 'exam') {
    return 'exam_heavy';
  }

  if (prioritySkill === 'speaking') {
    return 'speaking_heavy';
  }

  return 'balanced';
};

const getStartLevelLabel = (level: StartLevelId) => {
  if (level === 'zero') {
    return 'Sıfır';
  }

  if (level === 'some') {
    return 'Biraz biliyorum';
  }

  return level;
};

const getSetupFallbacks = (input: {
  userGoal: UserGoalId | null;
  startLevel: StartLevelId | null;
  targetLevel: TargetLevelId | null;
  dailyMinutes: DailyMinutes | null;
  prioritySkill: PrioritySkillId | null;
}) => ({
  userGoal: input.userGoal ?? 'daily_life',
  startLevel: input.startLevel ?? 'zero',
  targetLevel: input.targetLevel ?? 'A1',
  dailyMinutes: input.dailyMinutes ?? 10,
  prioritySkill: input.prioritySkill ?? 'speaking',
});

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export function OnboardingScreen({ navigation, onComplete }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [userGoal, setUserGoal] = useState<UserGoalId | null>(null);
  const [startLevel, setStartLevel] = useState<StartLevelId | null>(null);
  const [targetLevel, setTargetLevel] = useState<TargetLevelId | null>(null);
  const [dailyMinutes, setDailyMinutes] = useState<DailyMinutes | null>(null);
  const [examDate, setExamDate] = useState('');
  const [showExamDate, setShowExamDate] = useState(false);
  const [prioritySkill, setPrioritySkill] = useState<PrioritySkillId | null>(null);
  const [wantsPlacement, setWantsPlacement] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const fade = useRef(new Animated.Value(1)).current;
  const slide = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(0)).current;

  const setupValues = getSetupFallbacks({ userGoal, startLevel, targetLevel, dailyMinutes, prioritySkill });
  const studyStyle = getStudyStyle(setupValues.userGoal, setupValues.prioritySkill);
  const setupInput = useMemo<LearningPlanInput>(
    () => ({
      userGoal: setupValues.userGoal,
      startLevel: setupValues.startLevel,
      selfSelectedLevel: setupValues.startLevel,
      targetLevel: setupValues.targetLevel,
      dailyMinutes: setupValues.dailyMinutes,
      examDate: setupValues.userGoal === 'exam' && showExamDate ? examDate : '',
      prioritySkill: setupValues.prioritySkill,
      studyStyle,
    }),
    [examDate, setupValues.dailyMinutes, setupValues.prioritySkill, setupValues.startLevel, setupValues.targetLevel, setupValues.userGoal, showExamDate, studyStyle],
  );
  const planPreview = useMemo(() => createLearningPlan(setupInput), [setupInput]);
  const stepId = onboardingSteps[step] ?? 'welcome';
  const progressStep = step + 1;
  const isWelcomeMoment = stepId === 'welcome' || stepId === 'ready';

  const mascotStyle = {
    transform: [
      {
        translateY: bounce.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -7],
        }),
      },
    ],
  };

  useEffect(() => {
    trackLocalEvent({ type: 'onboarding_started', screen: 'Onboarding' });
  }, []);

  useEffect(() => {
    trackLocalEvent({
      type: 'onboarding_step_viewed',
      screen: 'Onboarding',
      metadata: { stepId },
    });
  }, [stepId]);

  useEffect(() => {
    fade.setValue(0);
    slide.setValue(14);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();

    if (isWelcomeMoment) {
      Animated.sequence([
        Animated.timing(bounce, { toValue: 1, duration: 170, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 170, useNativeDriver: true }),
      ]).start();
    }
  }, [bounce, fade, isWelcomeMoment, slide, step]);

  const trackOption = (selectedOptionId: string) => {
    trackLocalEvent({
      type: 'onboarding_option_selected',
      screen: 'Onboarding',
      metadata: { stepId, selectedOptionId },
    });
  };

  const goBack = () => {
    if (saving) {
      return;
    }

    setStep((current) => Math.max(0, current - 1));
  };

  const startPlacementTest = () => {
    navigation.navigate('PlacementTest', { setup: setupInput });
  };

  const completeWithoutPlacement = async () => {
    setSaving(true);
    await wait(250);
    const learningPlan = createLearningPlan(setupInput);
    await onComplete(buildOnboardingCompletion({ input: setupInput, learningPlan }));
    setSaving(false);
  };

  const goNext = () => {
    if (saving) {
      return;
    }

    if (stepId === 'target') {
      if (wantsPlacement) {
        startPlacementTest();
        return;
      }

      setStep(7);
      return;
    }

    if (stepId === 'ready') {
      void completeWithoutPlacement();
      return;
    }

    setStep((current) => Math.min(onboardingSteps.length - 1, current + 1));
  };

  const primaryButton = (() => {
    if (stepId === 'welcome') {
      return { title: 'Başla', disabled: false, icon: ArrowRight };
    }

    if (stepId === 'goal') {
      return { title: 'Devam', disabled: !userGoal, icon: ArrowRight };
    }

    if (stepId === 'level') {
      return { title: 'Devam', disabled: !startLevel, icon: ArrowRight };
    }

    if (stepId === 'placement') {
      return { title: 'Devam', disabled: wantsPlacement === null, icon: ArrowRight };
    }

    if (stepId === 'daily_time') {
      return { title: 'Devam', disabled: !dailyMinutes, icon: ArrowRight };
    }

    if (stepId === 'focus') {
      return { title: 'Devam', disabled: !prioritySkill, icon: ArrowRight };
    }

    if (stepId === 'target') {
      return { title: wantsPlacement ? 'Seviye kontrolüne geç' : 'Planı hazırla', disabled: !targetLevel, icon: wantsPlacement ? Check : Sparkles };
    }

    return { title: 'Ana sayfaya geç', disabled: false, icon: Sparkles };
  })();

  const renderStep = () => {
    if (stepId === 'welcome') {
      return (
        <StepPanel title="Almancanı birlikte planlayalım" helper="Wolli sana kısa bir yol haritası hazırlayacak.">
          <ValueIllustration />
        </StepPanel>
      );
    }

    if (stepId === 'goal') {
      return (
        <StepPanel title="Neden Almanca öğreniyorsun?" helper="Planını buna göre ayarlayacağız.">
          <View style={styles.optionGrid}>
            {goalCards.map((item) => {
              const Icon = item.icon;

              return (
                <OptionCard
                  key={item.id}
                  icon={<Icon color={userGoal === item.id ? colors.white : colors.royalPurple} size={20} strokeWidth={2.5} />}
                  label={item.label}
                  onPress={() => {
                    setUserGoal(item.id);
                    trackOption(item.id);
                  }}
                  selected={userGoal === item.id}
                />
              );
            })}
          </View>
        </StepPanel>
      );
    }

    if (stepId === 'level') {
      return (
        <StepPanel title="Nereden başlıyorsun?" helper="Emin değilsen kısa kontrol yapabilirsin.">
          <View style={styles.optionGrid}>
            {startLevelOptions.map((item) => (
              <OptionCard
                key={item.id}
                icon={<Text style={[styles.optionIconText, startLevel === item.id && styles.optionIconTextSelected]}>{levelEmoji[item.id]}</Text>}
                label={getStartLevelLabel(item.id)}
                onPress={() => {
                  setStartLevel(item.id);
                  trackOption(item.id);
                }}
                selected={startLevel === item.id}
              />
            ))}
          </View>
        </StepPanel>
      );
    }

    if (stepId === 'placement') {
      return (
        <StepPanel title="2 dakikalık seviye kontrolü?" helper="Çok kolay ya da çok zor dersten başlamamak için.">
          <View style={styles.optionStack}>
            <OptionCard
              icon={<Check color={wantsPlacement === true ? colors.white : colors.royalPurple} size={20} strokeWidth={2.5} />}
              label="Kontrol et"
              onPress={() => {
                setWantsPlacement(true);
                trackOption('placement_yes');
              }}
              selected={wantsPlacement === true}
            />
            <OptionCard
              icon={<Text style={[styles.optionIconText, wantsPlacement === false && styles.optionIconTextSelected]}>↷</Text>}
              label="Atla"
              onPress={() => {
                setWantsPlacement(false);
                trackOption('placement_skip');
              }}
              selected={wantsPlacement === false}
            />
          </View>
        </StepPanel>
      );
    }

    if (stepId === 'daily_time') {
      return (
        <StepPanel title="Günde kaç dakika?" helper="Planın buna göre küçük parçalara bölünecek.">
          <View style={styles.optionGrid}>
            {dailyMinuteOptions.map((item) => (
              <OptionCard
                key={item.id}
                icon={<Text style={[styles.optionIconText, dailyMinutes === item.id && styles.optionIconTextSelected]}>{item.id}</Text>}
                label={item.label}
                onPress={() => {
                  setDailyMinutes(item.id);
                  trackOption(String(item.id));
                }}
                selected={dailyMinutes === item.id}
              />
            ))}
          </View>
        </StepPanel>
      );
    }

    if (stepId === 'focus') {
      return (
        <StepPanel title="Neye ağırlık verelim?" helper="İlk dersleri buna göre seçeceğiz.">
          <View style={styles.optionGrid}>
            {prioritySkillOptions.map((item) => (
              <OptionCard
                key={item.id}
                icon={<Text style={[styles.optionIconText, prioritySkill === item.id && styles.optionIconTextSelected]}>{focusEmoji[item.id]}</Text>}
                label={item.label}
                onPress={() => {
                  setPrioritySkill(item.id);
                  trackOption(item.id);
                }}
                selected={prioritySkill === item.id}
              />
            ))}
          </View>
        </StepPanel>
      );
    }

    if (stepId === 'target') {
      return (
        <StepPanel title="Hedef seviyen?" helper="İstersen bunu sonra değiştirebilirsin.">
          <View style={styles.optionGrid}>
            {targetLevelOptions.map((item) => (
              <OptionCard
                key={item.id}
                icon={<Text style={[styles.optionIconText, targetLevel === item.id && styles.optionIconTextSelected]}>{item.label}</Text>}
                label={item.label}
                onPress={() => {
                  setTargetLevel(item.id);
                  trackOption(item.id);
                }}
                selected={targetLevel === item.id}
              />
            ))}
          </View>

          {userGoal === 'exam' ? (
            <View style={styles.examDateArea}>
              {showExamDate ? (
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Sınav tarihi</Text>
                  <TextInput
                    autoCapitalize="none"
                    onChangeText={setExamDate}
                    placeholder="Örn. Eylül 2026"
                    placeholderTextColor={colors.muted}
                    returnKeyType="done"
                    style={styles.input}
                    value={examDate}
                  />
                </View>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setShowExamDate(true);
                    trackOption('exam_date_optional');
                  }}
                  style={({ pressed }) => [styles.textLink, pressed && styles.pressed]}
                >
                  <Text style={styles.textLinkText}>Sınav tarihim var</Text>
                </Pressable>
              )}
            </View>
          ) : null}
        </StepPanel>
      );
    }

    return (
      <StepPanel title="Yol haritan hazır" helper="Şimdi ilk adımına geçebilirsin.">
        <View style={styles.readyCard}>
          <View style={styles.readyRow}>
            <Text style={styles.readyLabel}>Başlangıç</Text>
            <Text style={styles.readyValue}>{planPreview.currentLevel}</Text>
          </View>
          <View style={styles.readyRow}>
            <Text style={styles.readyLabel}>Hedef</Text>
            <Text style={styles.readyValue}>{planPreview.targetLevel}</Text>
          </View>
          <View style={styles.readyRow}>
            <Text style={styles.readyLabel}>Günlük</Text>
            <Text style={styles.readyValue}>{setupValues.dailyMinutes} dk</Text>
          </View>
        </View>
      </StepPanel>
    );
  };

  return (
    <LinearGradient colors={[colors.gradientStart, colors.deepViolet]} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
        style={styles.keyboard}
      >
        <OnboardingProgressHeader
          canGoBack={step > 0 && !saving}
          current={progressStep}
          onBack={goBack}
          total={onboardingSteps.length}
        />

        <ScrollView
          contentContainerStyle={styles.content}
          contentInsetAdjustmentBehavior="never"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.mascotWrap, mascotStyle]}>
            <Mascot size={86} />
          </Animated.View>
          <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
            {renderStep()}
          </Animated.View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          <AppButton
            disabled={primaryButton.disabled}
            icon={primaryButton.icon}
            loading={saving}
            onPress={goNext}
            title={primaryButton.title}
          />
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function StepPanel({ children, helper, title }: { children: ReactNode; helper: string; title: string }) {
  return (
    <AnimatedCard>
      <View style={styles.panel}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.helper}>{helper}</Text>
        {children}
      </View>
    </AnimatedCard>
  );
}

function OptionCard({
  icon,
  label,
  onPress,
  selected,
}: {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  selected: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.optionCard, selected && styles.optionCardSelected, pressed && styles.pressed]}
    >
      <View style={[styles.optionIcon, selected && styles.optionIconSelected]}>{icon}</View>
      <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]} numberOfLines={2}>{label}</Text>
    </Pressable>
  );
}

function ValueIllustration() {
  return (
    <View style={styles.valueCard}>
      <View style={styles.valueIcon}>
        <Sparkles color={colors.yellow} size={22} strokeWidth={2.6} />
      </View>
      <View style={styles.valueCopy}>
        <Text style={styles.valueTitle}>1 dakikadan kısa</Text>
        <Text style={styles.valueText}>Hedef, seviye ve günlük süreye göre ilk dersin seçilecek.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    gap: spacing.lg,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  mascotWrap: {
    alignItems: 'center',
  },
  panel: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  title: {
    ...typography.title,
    color: colors.deepViolet,
  },
  helper: {
    ...typography.body,
    color: colors.muted,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionStack: {
    gap: spacing.sm,
  },
  optionCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexBasis: '47%',
    flexGrow: 1,
    gap: spacing.sm,
    minHeight: 96,
    padding: spacing.md,
  },
  optionCardSelected: {
    backgroundColor: colors.deepViolet,
    borderColor: colors.royalPurple,
  },
  optionIcon: {
    alignItems: 'center',
    backgroundColor: colors.lavender,
    borderRadius: radius.sm,
    height: 38,
    justifyContent: 'center',
    minWidth: 38,
    paddingHorizontal: spacing.xs,
  },
  optionIconSelected: {
    backgroundColor: colors.royalPurple,
  },
  optionIconText: {
    ...typography.small,
    color: colors.royalPurple,
    fontWeight: '900',
  },
  optionIconTextSelected: {
    color: colors.white,
  },
  optionLabel: {
    ...typography.small,
    color: colors.deepViolet,
    fontWeight: '900',
    textAlign: 'center',
  },
  optionLabelSelected: {
    color: colors.white,
  },
  valueCard: {
    alignItems: 'center',
    backgroundColor: colors.deepViolet,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  valueIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.md,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  valueCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  valueTitle: {
    ...typography.body,
    color: colors.white,
    fontWeight: '900',
  },
  valueText: {
    ...typography.small,
    color: colors.lavender,
  },
  examDateArea: {
    gap: spacing.sm,
  },
  textLink: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
  },
  textLinkText: {
    ...typography.body,
    color: colors.royalPurple,
    fontWeight: '900',
  },
  fieldGroup: {
    gap: spacing.sm,
  },
  label: {
    ...typography.small,
    color: colors.deepViolet,
    fontWeight: '900',
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
  readyCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  readyRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  readyLabel: {
    ...typography.body,
    color: colors.muted,
  },
  readyValue: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  footer: {
    backgroundColor: 'rgba(30,27,58,0.96)',
    borderTopColor: 'rgba(255,255,255,0.12)',
    borderTopWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  pressed: {
    opacity: 0.84,
  },
});
