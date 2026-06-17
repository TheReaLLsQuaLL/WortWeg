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
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
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
  TimerReset,
} from 'lucide-react-native';

import { AnimatedCard } from '../components/AnimatedCard';
import { AppButton } from '../components/AppButton';
import { StepDots } from '../components/StepDots';
import { Chip } from '../components/Chip';
import { Mascot } from '../components/Mascot';
import {
  dailyMinuteOptions,
  goalOptions,
  prioritySkillOptions,
  startLevelOptions,
  targetLevelOptions,
} from '../data/planOptions';
import { colors, radius, spacing, typography } from '../data/theme';
import type { RootNavigation } from '../navigation/AppNavigator';
import { createLearningPlan } from '../services/planService';
import { trackLocalEvent } from '../services/localEventLog';
import { buildOnboardingCompletion, type OnboardingCompletion } from '../services/onboardingService';
import type { LearningPlanInput, StudyStyleId, UserGoalId } from '../types/learningPlan';

export type OnboardingScreenProps = {
  navigation: RootNavigation;
  onComplete: (result: OnboardingCompletion) => Promise<void>;
};

type IconProps = { color?: string; size?: number; strokeWidth?: number };

type GoalCard = {
  id: UserGoalId;
  label: string;
  descriptionTr: string;
  icon: ComponentType<IconProps>;
};

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
  daily_life: 'Günlük',
  work: 'İş',
  family: 'Aile',
  university: 'Okul',
};

const goalCards: GoalCard[] = goalOptions
  .filter((option) => option.id !== 'curiosity')
  .map((option) => ({
    ...option,
    label: shortGoalLabels[option.id] ?? option.label,
    icon: goalIcons[option.id],
  }));

const setupStepCount = 9;

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

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

export function OnboardingScreen({ navigation, onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState(0);
  const [userGoal, setUserGoal] = useState<LearningPlanInput['userGoal']>('daily_life');
  const [startLevel, setStartLevel] = useState<LearningPlanInput['startLevel']>('zero');
  const [targetLevel, setTargetLevel] = useState<LearningPlanInput['targetLevel']>('A1');
  const [dailyMinutes, setDailyMinutes] = useState<LearningPlanInput['dailyMinutes']>(10);
  const [examDate, setExamDate] = useState('');
  const [showExamDate, setShowExamDate] = useState(false);
  const [prioritySkill, setPrioritySkill] = useState<LearningPlanInput['prioritySkill']>('speaking');
  const [wantsPlacement, setWantsPlacement] = useState(false);
  const [saving, setSaving] = useState(false);
  const fade = useRef(new Animated.Value(1)).current;
  const slide = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(0)).current;

  const studyStyle = getStudyStyle(userGoal, prioritySkill);
  const setupInput = useMemo<LearningPlanInput>(
    () => ({
      userGoal,
      startLevel,
      selfSelectedLevel: startLevel,
      targetLevel,
      dailyMinutes,
      examDate: showExamDate ? examDate : '',
      prioritySkill,
      studyStyle,
    }),
    [dailyMinutes, examDate, prioritySkill, showExamDate, startLevel, studyStyle, targetLevel, userGoal],
  );
  const planPreview = useMemo(() => createLearningPlan(setupInput), [setupInput]);
  const selectedGoal = goalCards.find((item) => item.id === userGoal) ?? goalCards[1]!;

  useEffect(() => {
    trackLocalEvent({ type: 'onboarding_started', screen: 'Onboarding' });
  }, []);
  const progressStep = Math.min(step + 1, setupStepCount);
  const progressWidth = (Math.round((progressStep / setupStepCount) * 100) + '%') as any;
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
    fade.setValue(0);
    slide.setValue(16);
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
    Animated.sequence([
      Animated.timing(bounce, {
        toValue: 1,
        duration: 170,
        useNativeDriver: true,
      }),
      Animated.timing(bounce, {
        toValue: 0,
        duration: 170,
        useNativeDriver: true,
      }),
    ]).start();
  }, [bounce, fade, slide, step]);

  const goBack = () => {
    if (saving) {
      return;
    }

    setStep((current) => Math.max(0, current - 1));
  };

  const finishSetup = async () => {
    setSaving(true);

    if (wantsPlacement) {
      navigation.navigate('PlacementTest', {
        setup: setupInput,
      });
      setSaving(false);
      return;
    }

    setStep(9);
    await wait(650);

    const learningPlan = createLearningPlan(setupInput);
    await onComplete(buildOnboardingCompletion({
      input: setupInput,
      learningPlan,
    }));
    setSaving(false);
  };

  const goNext = () => {
    if (step === 8) {
      void finishSetup();
      return;
    }

    setStep((current) => Math.min(8, current + 1));
  };

  const choosePlacement = (enabled: boolean) => {
    setWantsPlacement(enabled);
    setStep(5);
  };

  const renderStep = () => {
    if (step === 0) {
      return (
        <StepCard
          eyebrow="WortWeg"
          helper="Wolli sana kısa bir yol haritası hazırlayacak."
          title="Almancanı planlayalım"
        >
          <ValueIllustration title="Kısa yol" lines={['Ders', 'Tekrar', 'Konuşma']} />
          <AppButton icon={ArrowRight} onPress={goNext} title="Başla" />
        </StepCard>
      );
    }

    if (step === 1) {
      return (
        <StepCard
          eyebrow="1. Hedef"
          helper="Bir hedef seç."
          title="Neden Almanca öğreniyorsun?"
        >
          <View style={styles.goalGrid}>
            {goalCards.map((item) => (
              <GoalOption
                key={item.id}
                item={item}
                onPress={() => setUserGoal(item.id)}
                selected={userGoal === item.id}
              />
            ))}
          </View>
          <AppButton icon={ArrowRight} onPress={goNext} title="Devam" />
        </StepCard>
      );
    }

    if (step === 2) {
      return (
        <StepCard
          eyebrow="Wolli notu"
          helper="Ders ve tekrar sırası buna göre değişir."
          title="Hedefine göre rota"
        >
          <ValueIllustration title={selectedGoal.label} lines={['Ders', 'Tekrar', 'Pratik']} />
          <AppButton icon={ArrowRight} onPress={goNext} title="Devam" />
        </StepCard>
      );
    }

    if (step === 3) {
      return (
        <StepCard
          eyebrow="2. Seviye"
          helper="Emin değilsen kontrol yapabiliriz."
          title="Nereden başlıyorsun?"
        >
          <ChipGroup>
            {startLevelOptions.map((item) => (
              <Chip
                key={item.id}
                label={item.id === 'zero' ? 'Sıfır' : item.id === 'some' ? 'Biraz' : item.label}
                onPress={() => setStartLevel(item.id)}
                selected={startLevel === item.id}
                tone="plain"
              />
            ))}
          </ChipGroup>
          <AppButton icon={ArrowRight} onPress={goNext} title="Devam" />
        </StepCard>
      );
    }

    if (step === 4) {
      return (
        <StepCard
          eyebrow="Seviye kontrolü"
          helper="Çok kolay ya da zor başlamamak için."
          title="Seviye kontrolü yapalım mı?"
        >
          <ValueIllustration title="2 dakika" lines={['12 kısa soru', 'Hızlı sonuç']} />
          <AppButton icon={Check} onPress={() => choosePlacement(true)} title="Kontrol et" />
          <AppButton onPress={() => choosePlacement(false)} title="Atla" variant="secondary" />
        </StepCard>
      );
    }

    if (step === 5) {
      return (
        <StepCard
          eyebrow="3. Günlük süre"
          helper="Kısa çalışma yeter."
          title="Günde kaç dakika?"
        >
          <ChipGroup>
            {dailyMinuteOptions.map((item) => (
              <Chip key={item.id} label={item.label} onPress={() => setDailyMinutes(item.id)} selected={dailyMinutes === item.id} tone="green" />
            ))}
          </ChipGroup>
          <AppButton icon={ArrowRight} onPress={goNext} title="Devam" />
        </StepCard>
      );
    }

    if (step === 6) {
      return (
        <StepCard
          eyebrow="Günlük plan"
          helper="Planın küçük parçalara bölünecek."
          title="Günlük planın hazır"
        >
          <SchedulePreview minutes={dailyMinutes} />
          <AppButton icon={ArrowRight} onPress={goNext} title="Devam" />
        </StepCard>
      );
    }

    if (step === 7) {
      return (
        <StepCard
          eyebrow="4. Odak"
          helper="Bugünkü öneriler buna göre şekillenir."
          title="Neye ağırlık verelim?"
        >
          <ChipGroup>
            {prioritySkillOptions.map((item) => (
              <Chip key={item.id} label={item.label} onPress={() => setPrioritySkill(item.id)} selected={prioritySkill === item.id} tone="purple" />
            ))}
          </ChipGroup>
          <AppButton icon={ArrowRight} onPress={goNext} title="Devam" />
        </StepCard>
      );
    }

    if (step === 8) {
      return (
        <StepCard
          eyebrow="5. Hedef seviye"
          helper="Sınav tarihin varsa ekleyebilirsin."
          title="Hedef seviyen?"
        >
          <ChipGroup>
            {targetLevelOptions.map((item) => (
              <Chip key={item.id} label={item.label} onPress={() => setTargetLevel(item.id)} selected={targetLevel === item.id} tone="yellow" />
            ))}
          </ChipGroup>
          {showExamDate ? (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Sınav tarihi</Text>
              <TextInput
                autoCapitalize="none"
                onChangeText={setExamDate}
                placeholder="Örn. 2026-09-20"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={examDate}
              />
            </View>
          ) : (
            <AppButton onPress={() => setShowExamDate(true)} title="Sınav tarihim var" variant="secondary" />
          )}
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>Yol haritan hazır</Text>
            <Text style={styles.previewText}>{planPreview.titleTr} · {planPreview.currentLevel} → {planPreview.targetLevel}</Text>
          </View>
          <AppButton icon={Sparkles} loading={saving} onPress={finishSetup} title={wantsPlacement ? 'Teste geç' : 'Ana sayfaya geç'} />
        </StepCard>
      );
    }

    return (
      <StepCard
        eyebrow="Wolli çalışıyor"
        helper={wantsPlacement ? 'Önce kısa seviye kontrolünü açıyoruz.' : 'Planın hazır olunca yol haritana geçeceksin.'}
        title="Yol haritan hazırlanıyor"
      >
        <View style={styles.loadingDots}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotMuted]} />
          <View style={[styles.dot, styles.dotMuted]} />
        </View>
      </StepCard>
    );
  };

  return (
    <LinearGradient colors={[colors.gradientStart, colors.deepViolet]} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
          style={styles.keyboard}
        >
          <View style={styles.topRow}>
            {step > 0 && step < 9 ? (
              <Pressable accessibilityRole="button" onPress={goBack} style={styles.backButton}>
                <ArrowLeft color={colors.white} size={20} />
              </Pressable>
            ) : <View style={styles.backPlaceholder} />}
            <View style={styles.progressCopy}>
              <Text style={styles.progressLabel}>{step < 9 ? progressStep + ' / ' + setupStepCount : 'Hazırlanıyor'}</Text>
              <StepDots current={step < 9 ? progressStep : setupStepCount} total={setupStepCount} />
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: step < 9 ? progressWidth : '100%' }]} />
              </View>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            contentInsetAdjustmentBehavior="automatic"
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={[styles.mascotWrap, mascotStyle]}>
              <Mascot size={84} />
            </Animated.View>
            <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
              {renderStep()}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function StepCard({ children, eyebrow, helper, title }: { children: ReactNode; eyebrow: string; helper: string; title: string }) {
  return (
    <AnimatedCard>
    <View style={styles.panel}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.helper}>{helper}</Text>
      {children}
    </View>
    </AnimatedCard>
  );
}

function ChipGroup({ children }: { children: ReactNode }) {
  return <View style={styles.chips}>{children}</View>;
}

function GoalOption({ item, onPress, selected }: { item: GoalCard; onPress: () => void; selected: boolean }) {
  const Icon = item.icon;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.goalCard, selected && styles.goalCardSelected, pressed && styles.pressed]}
    >
      <View style={[styles.goalIcon, selected && styles.goalIconSelected]}>
        <Icon color={selected ? colors.white : colors.royalPurple} size={20} strokeWidth={2.5} />
      </View>
      <Text style={[styles.goalTitle, selected && styles.goalTitleSelected]}>{item.label}</Text>
    </Pressable>
  );
}

function ValueIllustration({ lines, title }: { lines: string[]; title: string }) {
  return (
    <View style={styles.valueCard}>
      <View style={styles.valueIcon}>
        <Sparkles color={colors.yellow} size={22} strokeWidth={2.6} />
      </View>
      <View style={styles.valueCopy}>
        <Text style={styles.valueTitle}>{title}</Text>
        <View style={styles.valueLines}>
          {lines.map((line) => <Text key={line} style={styles.valueLine}>{line}</Text>)}
        </View>
      </View>
    </View>
  );
}

function SchedulePreview({ minutes }: { minutes: number }) {
  const blocks = minutes <= 5
    ? ['Mikro ders', 'SRS']
    : minutes <= 10
      ? ['Ders', 'SRS', 'Konuşma']
      : ['Ders', 'SRS', 'Konuşma', 'Yazma'];

  return (
    <View style={styles.scheduleCard}>
      <View style={styles.scheduleHeader}>
        <TimerReset color={colors.royalPurple} size={20} />
        <Text style={styles.scheduleTitle}>{minutes} dk/gün</Text>
      </View>
      <View style={styles.scheduleBlocks}>
        {blocks.map((block) => <Text key={block} style={styles.scheduleBlock}>{block}</Text>)}
      </View>
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
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: radius.sm,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  backPlaceholder: {
    height: 44,
    width: 44,
  },
  progressCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  progressLabel: {
    ...typography.small,
    color: colors.lavender,
    fontWeight: '900',
  },
  progressTrack: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.pill,
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.yellow,
    borderRadius: radius.pill,
    height: 8,
  },
  content: {
    flexGrow: 1,
    gap: spacing.lg,
    justifyContent: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
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
  eyebrow: {
    ...typography.small,
    color: colors.royalPurple,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    ...typography.title,
    color: colors.deepViolet,
  },
  helper: {
    ...typography.body,
    color: colors.muted,
  },
  goalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  goalCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexBasis: '47%',
    flexGrow: 1,
    gap: spacing.sm,
    minHeight: 94,
    padding: spacing.md,
  },
  goalCardSelected: {
    backgroundColor: colors.deepViolet,
    borderColor: colors.royalPurple,
  },
  goalIcon: {
    alignItems: 'center',
    backgroundColor: colors.lavender,
    borderRadius: radius.sm,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  goalIconSelected: {
    backgroundColor: colors.royalPurple,
  },
  goalTitle: {
    ...typography.small,
    color: colors.deepViolet,
    fontWeight: '900',
    textAlign: 'center',
  },
  goalTitleSelected: {
    color: colors.white,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
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
    gap: spacing.sm,
  },
  valueTitle: {
    ...typography.body,
    color: colors.white,
    fontWeight: '900',
  },
  valueLines: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  valueLine: {
    ...typography.small,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.sm,
    color: colors.lavender,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  scheduleCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  scheduleHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  scheduleTitle: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  scheduleBlocks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  scheduleBlock: {
    ...typography.small,
    backgroundColor: colors.lavender,
    borderRadius: radius.sm,
    color: colors.deepViolet,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  previewCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  previewTitle: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  previewText: {
    ...typography.small,
    color: colors.muted,
  },
  loadingDots: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 64,
  },
  dot: {
    backgroundColor: colors.royalPurple,
    borderRadius: radius.pill,
    height: 12,
    width: 12,
  },
  dotMuted: {
    backgroundColor: colors.lavender,
  },
  pressed: {
    opacity: 0.84,
  },
});
