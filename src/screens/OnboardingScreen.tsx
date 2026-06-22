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
  Map,
  Plane,
  Sparkles,
} from 'lucide-react-native';

import { AnimatedCard } from '../components/AnimatedCard';
import { AppButton } from '../components/AppButton';
import { HalftoneAccent } from '../components/HalftoneAccent';
import { Mascot } from '../components/Mascot';
import { OnboardingProgressHeader } from '../components/OnboardingProgressHeader';
import {
  dailyMinuteOptions,
  goalOptions,
  prioritySkillOptions,
  startLevelOptions,
  targetLevelOptions,
} from '../data/planOptions';
import { articleColors, articleLightColors, colors, radius, shadows, spacing, typography } from '../data/theme';
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
  | 'mini_demo'
  | 'placement'
  | 'daily_time'
  | 'focus'
  | 'target'
  | 'ready';

const onboardingSteps: OnboardingStepId[] = [
  'welcome',
  'goal',
  'level',
  'mini_demo',
  'placement',
  'daily_time',
  'focus',
  'target',
  'ready',
];

const readyStepIndex = onboardingSteps.indexOf('ready');

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

type ArticleDemoId = 'der' | 'die' | 'das';

const articleDemoCards: Array<{
  id: ArticleDemoId;
  word: string;
  explanationTr: string;
}> = [
  {
    id: 'der',
    word: 'Apfel',
    explanationTr: 'der: sadece erkek/canlı demek değildir; kalıpla öğrenilir.',
  },
  {
    id: 'die',
    word: 'Schule',
    explanationTr: 'die: birçok kadın isim ve bazı kelime gruplarında görülür.',
  },
  {
    id: 'das',
    word: 'Haus',
    explanationTr: 'das: bazı nötr isimlerde kalıp olarak öğrenilir.',
  },
];

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
  const [selectedDemoCard, setSelectedDemoCard] = useState<ArticleDemoId | null>(null);
  const [saving, setSaving] = useState(false);
  const fade = useRef(new Animated.Value(1)).current;
  const slide = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(0)).current;
  const planRevealTrackedRef = useRef(false);

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

  useEffect(() => {
    if (stepId !== 'ready' || planRevealTrackedRef.current) {
      return;
    }

    planRevealTrackedRef.current = true;
    trackLocalEvent({
      type: 'onboarding_plan_revealed',
      screen: 'Onboarding',
      metadata: {
        stepId,
        userGoal: setupValues.userGoal,
        selectedLevel: setupValues.startLevel,
        level: planPreview.currentLevel,
      },
    });
  }, [planPreview.currentLevel, setupValues.startLevel, setupValues.userGoal, stepId]);

  const trackOption = (selectedOptionId: string) => {
    trackLocalEvent({
      type: 'onboarding_option_selected',
      screen: 'Onboarding',
      metadata: {
        stepId,
        selectedOptionId,
        userGoal: userGoal ?? undefined,
        selectedLevel: startLevel ?? undefined,
      },
    });
  };

  const chooseDemoCard = (demoCardId: ArticleDemoId) => {
    setSelectedDemoCard(demoCardId);
    trackLocalEvent({
      type: 'onboarding_demo_card_tapped',
      screen: 'Onboarding',
      metadata: { stepId, demoCardId },
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

      setStep(readyStepIndex);
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

    if (stepId === 'mini_demo') {
      return { title: 'Anladım', disabled: false, icon: Check };
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

    return { title: 'Haritamı gör', disabled: false, icon: Map };
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
                  animationKey={stepId}
                  index={goalCards.findIndex((goal) => goal.id === item.id)}
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
            {startLevelOptions.map((item, index) => (
              <OptionCard
                key={item.id}
                animationKey={stepId}
                index={index}
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

    if (stepId === 'mini_demo') {
      return (
        <StepPanel
          title="WortWeg nasıl öğretir?"
          helper="Almancayı Türkçe mantıkla, renklerle ve kısa pratiklerle öğrenirsin."
        >
          <MiniArticleDemo selectedId={selectedDemoCard} onSelect={chooseDemoCard} stepKey={stepId} />
        </StepPanel>
      );
    }

    if (stepId === 'placement') {
      return (
        <StepPanel title="2 dakikalık seviye kontrolü?" helper="Çok kolay ya da çok zor dersten başlamamak için.">
          <View style={styles.optionStack}>
            <OptionCard
              animationKey={stepId}
              index={0}
              icon={<Check color={wantsPlacement === true ? colors.white : colors.royalPurple} size={20} strokeWidth={2.5} />}
              label="Kontrol et"
              onPress={() => {
                setWantsPlacement(true);
                trackOption('placement_yes');
              }}
              selected={wantsPlacement === true}
            />
            <OptionCard
              animationKey={stepId}
              index={1}
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
            {dailyMinuteOptions.map((item, index) => (
              <OptionCard
                key={item.id}
                animationKey={stepId}
                index={index}
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
          <DailyPlanMeter selectedMinutes={dailyMinutes} />
        </StepPanel>
      );
    }

    if (stepId === 'focus') {
      return (
        <StepPanel title="Neye ağırlık verelim?" helper="İlk dersleri buna göre seçeceğiz.">
          <View style={styles.optionGrid}>
            {prioritySkillOptions.map((item, index) => (
              <OptionCard
                key={item.id}
                animationKey={stepId}
                index={index}
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
            {targetLevelOptions.map((item, index) => (
              <OptionCard
                key={item.id}
                animationKey={stepId}
                index={index}
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
      <StepPanel title="Yol haritan hazır" helper="İlk adımın hazır. Şimdi başlayalım.">
        <PlanRevealRoadmap />
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
    <LinearGradient colors={[colors.lavenderBackground, colors.paperLavender, colors.lavenderBackground]} style={styles.gradient}>
      <HalftoneAccent opacity={0.1} size="large" style={styles.backgroundTextureTop} />
      <HalftoneAccent color={colors.primaryPurple} opacity={0.08} size="medium" style={styles.backgroundTextureBottom} />
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
          <Animated.View style={[styles.mascotWrap, stepId === 'welcome' && mascotStyle]}>
            {stepId === 'welcome' ? (
              <View style={styles.mascotFrame}>
                <HalftoneAccent color={colors.yellowCta} opacity={0.16} size="medium" style={styles.mascotTexture} />
                <Mascot size={118} />
                <View style={styles.mascotSticker}>
                  <Text style={styles.mascotStickerText}>WOLLI</Text>
                </View>
              </View>
            ) : (
              <View style={styles.mascotMiniRow}>
                <View style={styles.mascotMiniAvatar}>
                  <Mascot size={44} />
                </View>
                <View style={styles.mascotMiniBubble}>
                  <Text style={styles.mascotMiniLabel}>WOLLI</Text>
                  <Text style={styles.mascotMiniText}>
                    {stepId === 'mini_demo'
                      ? 'Renkler artikelı hatırlamana yardım edecek.'
                      : stepId === 'ready'
                        ? 'İlk adımın hazır.'
                        : 'Yol haritanı netleştiriyoruz.'}
                  </Text>
                </View>
              </View>
            )}
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
        <HalftoneAccent opacity={0.07} size="small" style={styles.panelTexture} />
        <View style={styles.panelBurstLarge} />
        <View style={styles.panelBurstSmall} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.helper}>{helper}</Text>
        {children}
      </View>
    </AnimatedCard>
  );
}

function OptionCard({
  animationKey,
  icon,
  index = 0,
  label,
  onPress,
  selected,
}: {
  animationKey: string;
  icon: ReactNode;
  index?: number;
  label: string;
  onPress: () => void;
  selected: boolean;
}) {
  const entrance = useRef(new Animated.Value(0)).current;
  const selectedScale = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    entrance.setValue(0);
    Animated.timing(entrance, {
      toValue: 1,
      duration: 220,
      delay: Math.min(index, 5) * 45,
      useNativeDriver: true,
    }).start();
  }, [animationKey, entrance, index]);

  useEffect(() => {
    Animated.spring(selectedScale, {
      toValue: selected ? 1 : 0,
      friction: 8,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, [selected, selectedScale]);

  const translateY = entrance.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });
  const scale = selectedScale.interpolate({ inputRange: [0, 1], outputRange: [1, 1.025] });

  return (
    <Animated.View style={[styles.optionCardWrap, { opacity: entrance, transform: [{ translateY }, { scale }] }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={onPress}
        style={({ pressed }) => [styles.optionCard, selected && styles.optionCardSelected, pressed && styles.pressed]}
      >
        <View style={[styles.optionIcon, selected && styles.optionIconSelected]}>{icon}</View>
        <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]} numberOfLines={2}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

function MiniArticleDemo({
  onSelect,
  selectedId,
  stepKey,
}: {
  onSelect: (id: ArticleDemoId) => void;
  selectedId: ArticleDemoId | null;
  stepKey: string;
}) {
  const activeId = selectedId ?? 'der';
  const selected = articleDemoCards.find((card) => card.id === activeId) ?? articleDemoCards[0]!;

  return (
    <View style={styles.demoWrap}>
      <View style={styles.articleGrid}>
        {articleDemoCards.map((card, index) => {
          const selected = activeId === card.id;
          return (
            <ArticleDemoCard
              key={card.id}
              card={card}
              index={index}
              onPress={() => onSelect(card.id)}
              selected={selected}
              stepKey={stepKey}
            />
          );
        })}
      </View>
      <View style={styles.demoExplanation}>
        <Text style={[styles.demoArticle, { color: articleColors[selected.id] }]}>{selected.id}</Text>
        <Text style={styles.demoExplanationText}>{selected.explanationTr}</Text>
      </View>
    </View>
  );
}

function ArticleDemoCard({
  card,
  index,
  onPress,
  selected,
  stepKey,
}: {
  card: (typeof articleDemoCards)[number];
  index: number;
  onPress: () => void;
  selected: boolean;
  stepKey: string;
}) {
  const entrance = useRef(new Animated.Value(0)).current;
  const flip = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    entrance.setValue(0);
    Animated.timing(entrance, {
      toValue: 1,
      duration: 240,
      delay: index * 70,
      useNativeDriver: true,
    }).start();
  }, [entrance, index, stepKey]);

  useEffect(() => {
    Animated.spring(flip, {
      toValue: selected ? 1 : 0,
      friction: 8,
      tension: 130,
      useNativeDriver: true,
    }).start();
  }, [flip, selected]);

  const translateY = entrance.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });
  const scale = flip.interpolate({ inputRange: [0, 1], outputRange: [1, 1.035] });

  return (
    <Animated.View style={{ flex: 1, minWidth: 88, opacity: entrance, transform: [{ translateY }, { scale }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={onPress}
        style={({ pressed }) => [
          styles.articleCard,
          { backgroundColor: articleLightColors[card.id], borderColor: articleColors[card.id] },
          selected && styles.articleCardSelected,
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.articleBadge, { color: articleColors[card.id] }]}>{card.id}</Text>
        <Text style={styles.articleWord}>{card.word}</Text>
      </Pressable>
    </Animated.View>
  );
}

function DailyPlanMeter({ selectedMinutes }: { selectedMinutes: DailyMinutes | null }) {
  const progress = useRef(new Animated.Value(0)).current;
  const target = selectedMinutes === 20 ? 1 : selectedMinutes === 15 ? 0.75 : selectedMinutes === 10 ? 0.5 : selectedMinutes === 5 ? 0.25 : 0.08;

  useEffect(() => {
    Animated.timing(progress, { toValue: target, duration: 260, useNativeDriver: false }).start();
  }, [progress, target]);

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ['8%', '100%'] });

  return (
    <View style={styles.dailyMeterCard}>
      <View style={styles.dailyMeterTop}>
        <Text style={styles.dailyMeterTitle}>Günlük plan</Text>
        <Text style={styles.dailyMeterValue}>{selectedMinutes ? selectedMinutes + ' dk' : 'seç'}</Text>
      </View>
      <View style={styles.dailyMeterTrack}>
        <Animated.View style={[styles.dailyMeterFill, { width }]} />
      </View>
    </View>
  );
}

function PlanRevealRoadmap() {
  const nodes = ['Başlangıç', 'İlk ders', 'Kelime', 'Konuşma', 'Hedef'];

  return (
    <View style={styles.roadmapCard}>
      {nodes.map((label, index) => (
        <RoadmapRevealNode key={label} index={index} label={label} />
      ))}
    </View>
  );
}

function RoadmapRevealNode({ index, label }: { index: number; label: string }) {
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    entrance.setValue(0);
    Animated.timing(entrance, {
      toValue: 1,
      duration: 240,
      delay: index * 90,
      useNativeDriver: true,
    }).start();
  }, [entrance, index]);

  const translateY = entrance.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });

  return (
    <Animated.View style={[styles.roadmapNodeWrap, { opacity: entrance, transform: [{ translateY }] }]}>
      <View style={[styles.roadmapNode, index === 0 && styles.roadmapNodeActive]}>
        {index === 0 ? <Check color={colors.white} size={14} strokeWidth={3} /> : <Map color={colors.royalPurple} size={14} strokeWidth={2.6} />}
      </View>
      <Text style={styles.roadmapNodeLabel} numberOfLines={1}>{label}</Text>
    </Animated.View>
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
    paddingBottom: spacing.xxl,
  },
  mascotWrap: {
    alignItems: 'center',
  },
  mascotFrame: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    height: 170,
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
    ...shadows.comic,
  },
  mascotMiniRow: {
    alignItems: 'center',
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginBottom: -spacing.xs,
  },
  mascotMiniAvatar: {
    alignItems: 'center',
    backgroundColor: colors.yellowCta,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.lg,
    borderWidth: colors.comicBorderWidth,
    height: 58,
    justifyContent: 'center',
    width: 58,
    ...shadows.comicSmall,
  },
  mascotMiniBubble: {
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.lg,
    borderWidth: colors.comicBorderWidth,
    flex: 1,
    gap: 2,
    maxWidth: 290,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.comicSmall,
  },
  mascotMiniLabel: {
    ...typography.micro,
    color: colors.primaryPurple,
    fontWeight: '900',
  },
  mascotMiniText: {
    ...typography.small,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  mascotTexture: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  mascotSticker: {
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.sm,
    borderWidth: colors.comicBorderWidth,
    bottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    position: 'absolute',
    right: spacing.md,
    transform: [{ rotate: '-3deg' }],
    ...shadows.comicSmall,
  },
  mascotStickerText: {
    ...typography.micro,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  panel: {
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.lg,
    overflow: 'visible',
    padding: spacing.xl,
    position: 'relative',
    ...shadows.lift,
  },
  panelTexture: {
    height: 112,
    position: 'absolute',
    right: -18,
    top: -18,
    width: 144,
  },
  panelBurstLarge: {
    backgroundColor: colors.comicYellowWash,
    borderRadius: 999,
    height: 126,
    opacity: 0.66,
    position: 'absolute',
    right: -48,
    top: -54,
    width: 126,
  },
  panelBurstSmall: {
    backgroundColor: colors.comicBlueWash,
    borderRadius: 999,
    bottom: -42,
    height: 92,
    left: -36,
    opacity: 0.55,
    position: 'absolute',
    width: 92,
  },
  title: {
    ...typography.title,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  helper: {
    ...typography.body,
    color: colors.muted,
    fontWeight: '700',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionStack: {
    gap: spacing.sm,
  },
  optionCardWrap: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  optionCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.sm,
    minHeight: 104,
    padding: spacing.md,
    ...shadows.comic,
  },
  optionCardSelected: {
    backgroundColor: colors.primaryPurple,
    borderColor: colors.comicBorderColor,
    ...shadows.lift,
  },
  optionIcon: {
    alignItems: 'center',
    backgroundColor: colors.yellowCta,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.lg,
    borderWidth: colors.comicBorderWidth,
    height: 44,
    justifyContent: 'center',
    minWidth: 44,
    paddingHorizontal: spacing.xs,
    ...shadows.comicSmall,
  },
  optionIconSelected: {
    backgroundColor: colors.deepViolet,
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
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    ...shadows.comic,
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
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.md,
    borderWidth: colors.comicBorderWidth,
    color: colors.deepViolet,
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  readyCard: {
    backgroundColor: colors.paperLavender,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.lg,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.sm,
    padding: spacing.md,
    ...shadows.comicSmall,
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
  wolliBubble: {
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.md,
    borderWidth: colors.comicBorderWidth,
    marginTop: spacing.sm,
    maxWidth: 260,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  wolliBubbleText: {
    ...typography.small,
    color: colors.deepViolet,
    fontWeight: '900',
    textAlign: 'center',
  },
  demoWrap: {
    gap: spacing.md,
  },
  articleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  articleCard: {
    alignItems: 'center',
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.xs,
    minHeight: 122,
    justifyContent: 'center',
    padding: spacing.md,
    ...shadows.comicSmall,
  },
  articleCardSelected: {
    ...shadows.lift,
  },
  articleBadge: {
    ...typography.body,
    fontWeight: '900',
  },
  articleWord: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  demoExplanation: {
    alignItems: 'center',
    backgroundColor: colors.paper,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.lg,
    borderWidth: colors.comicBorderWidth,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    ...shadows.comicSmall,
  },
  demoArticle: {
    ...typography.body,
    fontWeight: '900',
    minWidth: 34,
  },
  demoExplanationText: {
    ...typography.small,
    color: colors.deepViolet,
    flex: 1,
    fontWeight: '800',
  },
  dailyMeterCard: {
    backgroundColor: colors.primaryPurple,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.md,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.sm,
    padding: spacing.md,
  },
  dailyMeterTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dailyMeterTitle: {
    ...typography.small,
    color: colors.lavender,
    fontWeight: '900',
  },
  dailyMeterValue: {
    ...typography.small,
    color: colors.yellow,
    fontWeight: '900',
  },
  dailyMeterTrack: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.pill,
    height: 8,
    overflow: 'hidden',
  },
  dailyMeterFill: {
    backgroundColor: colors.yellow,
    borderRadius: radius.pill,
    height: 8,
  },
  roadmapCard: {
    backgroundColor: colors.deepViolet,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  roadmapNodeWrap: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
  },
  roadmapNode: {
    alignItems: 'center',
    backgroundColor: colors.lavender,
    borderRadius: radius.pill,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  roadmapNodeActive: {
    backgroundColor: colors.green,
  },
  roadmapNodeLabel: {
    ...typography.small,
    color: colors.white,
    fontWeight: '900',
    textAlign: 'center',
  },
  footerLink: {
    alignItems: 'center',
    minHeight: 36,
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  footerLinkText: {
    ...typography.small,
    color: colors.royalPurple,
    fontWeight: '900',
  },
  footer: {
    backgroundColor: colors.lavenderBackground,
    borderTopColor: colors.comicBorderColor,
    borderTopWidth: colors.comicBorderWidth,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  backgroundTextureTop: {
    height: 180,
    position: 'absolute',
    right: -24,
    top: 16,
    width: 220,
  },
  backgroundTextureBottom: {
    bottom: 92,
    height: 150,
    left: -30,
    position: 'absolute',
    width: 190,
  },
  pressed: {
    opacity: 0.84,
  },
});
