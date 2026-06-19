import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react-native';

import { AppButton } from '../components/AppButton';
import { AppScrollView, Screen } from '../components/layout';
import { HalftoneAccent } from '../components/HalftoneAccent';
import { TopBar } from '../components/TopBar';
import { colors, radius, shadows, spacing, typography } from '../data/theme';
import type { RootNavigation } from '../navigation/AppNavigator';
import { getPlacementQuestions, scorePlacementTest, type PlacementAnswerMap } from '../services/placementService';
import { trackLocalEvent } from '../services/localEventLog';
import type { LearningPlanInput } from '../types/learningPlan';

export type PlacementTestRoute = {
  params: {
    setup: LearningPlanInput;
    profileName?: string;
  };
};

type PlacementTestScreenProps = {
  navigation: RootNavigation;
  route: PlacementTestRoute;
};

export function PlacementTestScreen({ navigation, route }: PlacementTestScreenProps) {
  const seedRef = useRef('placement-' + Date.now().toString(36));
  const questions = useMemo(() => getPlacementQuestions(seedRef.current), []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<PlacementAnswerMap>({});
  const question = questions[currentIndex]!;
  const selectedChoiceId = answers[question.id];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const progressWidth = (progress + '%') as `${number}%`;

  useEffect(() => {
    trackLocalEvent({ type: 'placement_started', screen: 'PlacementTest' });
  }, []);

  const choose = (choiceId: string) => {
    setAnswers((current) => ({
      ...current,
      [question.id]: choiceId,
    }));
  };

  const next = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((index) => index + 1);
      return;
    }

    const result = scorePlacementTest(answers, questions, route.params.setup.startLevel);
    navigation.navigate('PlacementResult', {
      setup: route.params.setup,
      profileName: route.params.profileName,
      result,
    });
  };

  return (
    <Screen backgroundColor={colors.deepViolet}>
      <TopBar subtitle="Kısa yerel test" title="Seviye kontrolü" />
      <AppScrollView contentContainerStyle={styles.content} style={styles.scroll}>
        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Soru {currentIndex + 1}/{questions.length}</Text>
            <Text style={styles.progressMeta}>{question.levelSignal}</Text>
          </View>
          <View style={styles.progressShell}>
            <View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
        </View>

        <View style={styles.card}>
          <HalftoneAccent color={colors.yellowCta} opacity={0.08} size="small" style={styles.cardTexture} />
          <Text style={styles.kicker}>Kısa kontrol</Text>
          <Text style={styles.prompt}>{question.promptTr}</Text>
          {question.promptDe ? <Text style={styles.promptDe}>{question.promptDe}</Text> : null}

          <View style={styles.choices}>
            {question.choices.map((choice) => {
              const selected = selectedChoiceId === choice.id;

              return (
                <Pressable
                  key={choice.id}
                  accessibilityRole="button"
                  onPress={() => choose(choice.id)}
                  style={({ pressed }) => [
                    styles.choice,
                    selected && styles.choiceSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={[styles.radio, selected && styles.radioSelected]}>
                    {selected ? <CheckCircle2 color={colors.deepViolet} size={16} strokeWidth={2.8} /> : null}
                  </View>
                  <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{choice.text}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.navRow}>
          {currentIndex > 0 ? (
            <AppButton
              icon={ArrowLeft}
              onPress={() => setCurrentIndex((index) => Math.max(0, index - 1))}
              title="Geri"
              variant="secondary"
              style={styles.navButton}
            />
          ) : null}
          <AppButton
            icon={ArrowRight}
            onPress={next}
            title={currentIndex === questions.length - 1 ? 'Sonuç' : 'Devam'}
            disabled={!selectedChoiceId}
            style={styles.navButton}
          />
        </View>
      </AppScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: colors.surface,
  },
  content: {
    backgroundColor: colors.lavenderBackground,
    gap: spacing.md,
    padding: spacing.lg,
  },
  progressCard: {
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.sm,
    padding: spacing.md,
    ...shadows.comicSmall,
  },
  progressRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    ...typography.small,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  progressMeta: {
    ...typography.small,
    color: colors.royalPurple,
    fontWeight: '900',
  },
  progressShell: {
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderWidth: colors.comicBorderWidth,
    borderRadius: radius.pill,
    height: 18,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.yellowCta,
    borderRadius: radius.pill,
    height: '100%',
  },
  card: {
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    ...shadows.comic,
  },
  cardTexture: {
    height: 108,
    position: 'absolute',
    right: -16,
    top: -16,
    width: 132,
  },
  kicker: {
    ...typography.small,
    color: colors.royalPurple,
    fontWeight: '900',
  },
  prompt: {
    ...typography.heading,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  promptDe: {
    ...typography.body,
    color: colors.muted,
  },
  choices: {
    gap: spacing.sm,
  },
  choice: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 58,
    padding: spacing.md,
    ...shadows.comicSmall,
  },
  choiceSelected: {
    backgroundColor: colors.primaryPurple,
    borderColor: colors.comicBorderColor,
  },
  radio: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  radioSelected: {
    backgroundColor: colors.yellowCta,
    borderColor: colors.comicBorderColor,
  },
  choiceText: {
    ...typography.body,
    color: colors.deepViolet,
    flex: 1,
  },
  choiceTextSelected: {
    color: colors.white,
    fontWeight: '900',
  },
  navRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  navButton: {
    flex: 1,
  },
  pressed: {
    opacity: 0.84,
  },
});
