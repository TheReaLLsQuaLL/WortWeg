import { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react-native';

import { AppButton } from '../components/AppButton';
import { AppScrollView, Screen } from '../components/layout';
import { TopBar } from '../components/TopBar';
import { colors, radius, spacing, typography } from '../data/theme';
import type { RootNavigation } from '../navigation/AppNavigator';
import { getPlacementQuestions, scorePlacementTest, type PlacementAnswerMap } from '../services/placementService';
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
        <View style={styles.progressShell}>
          <View style={[styles.progressFill, { width: progressWidth }]} />
        </View>

        <View style={styles.card}>
          <Text style={styles.kicker}>Soru {currentIndex + 1}/{questions.length} · {question.levelSignal}</Text>
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
                    {selected ? <CheckCircle2 color={colors.white} size={16} strokeWidth={2.8} /> : null}
                  </View>
                  <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{choice.text}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.navRow}>
          <AppButton
            icon={ArrowLeft}
            onPress={() => setCurrentIndex((index) => Math.max(0, index - 1))}
            title="Geri"
            variant="secondary"
            disabled={currentIndex === 0}
            style={styles.navButton}
          />
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
    backgroundColor: colors.surface,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  progressShell: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radius.pill,
    height: 10,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.green,
    borderRadius: radius.pill,
    height: 10,
  },
  card: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  kicker: {
    ...typography.small,
    color: colors.royalPurple,
    fontWeight: '900',
  },
  prompt: {
    ...typography.heading,
    color: colors.deepViolet,
  },
  promptDe: {
    ...typography.body,
    color: colors.muted,
  },
  choices: {
    gap: spacing.md,
  },
  choice: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 56,
    padding: spacing.md,
  },
  choiceSelected: {
    backgroundColor: colors.lavender,
    borderColor: colors.royalPurple,
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
    backgroundColor: colors.royalPurple,
    borderColor: colors.royalPurple,
  },
  choiceText: {
    ...typography.body,
    color: colors.deepViolet,
    flex: 1,
  },
  choiceTextSelected: {
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
