import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ArrowRight, RotateCcw } from 'lucide-react-native';

import { AppButton } from '../components/AppButton';
import { AppScrollView, Screen } from '../components/layout';
import { TopBar } from '../components/TopBar';
import { colors, radius, spacing, typography } from '../data/theme';
import { createLearningPlan } from '../services/planService';
import { buildOnboardingCompletion, type OnboardingCompletion } from '../services/onboardingService';
import { getPlacementLevelLabel } from '../services/placementService';
import type { LearningPlanInput, StartLevelId } from '../types/learningPlan';
import type { PlacementResult } from '../types/placement';

export type PlacementResultRoute = {
  params: {
    setup: LearningPlanInput;
    profileName?: string;
    result: PlacementResult;
  };
};

type PlacementResultScreenProps = {
  route: PlacementResultRoute;
  onComplete: (result: OnboardingCompletion) => Promise<void>;
};

const getStartLevelLabel = (level?: StartLevelId) => {
  if (level === 'zero') {
    return 'A0 / Sıfırdan';
  }

  if (level === 'some') {
    return 'Biraz biliyorum';
  }

  return level ?? 'A0';
};

const getConfidenceLabel = (confidence: PlacementResult['confidence']) => {
  if (confidence === 'high') {
    return 'yüksek güven';
  }

  if (confidence === 'medium') {
    return 'orta güven';
  }

  return 'düşük güven';
};

export function PlacementResultScreen({ route, onComplete }: PlacementResultScreenProps) {
  const { setup, profileName, result } = route.params;
  const [savingMode, setSavingMode] = useState<'recommended' | 'selected' | null>(null);
  const selfSelectedLevel = setup.selfSelectedLevel ?? setup.startLevel;

  const finish = async (useRecommendation: boolean) => {
    setSavingMode(useRecommendation ? 'recommended' : 'selected');
    const input: LearningPlanInput = {
      ...setup,
      startLevel: useRecommendation ? result.recommendedStartLevel : selfSelectedLevel,
      selfSelectedLevel,
      placementResult: result,
      usePlacementRecommendation: useRecommendation,
    };
    const learningPlan = createLearningPlan(input);

    await onComplete(buildOnboardingCompletion({
      input,
      learningPlan,
      name: profileName,
      placementResult: result,
    }));
    setSavingMode(null);
  };

  return (
    <Screen backgroundColor={colors.deepViolet}>
      <TopBar subtitle="Seviye kontrolü" title="Başlangıç önerisi" />
      <AppScrollView contentContainerStyle={styles.content} style={styles.scroll}>
        <View style={styles.heroCard}>
          <Text style={styles.kicker}>Önerilen seviye</Text>
          <Text style={styles.level}>{getPlacementLevelLabel(result.recommendedStartLevel)}</Text>
          <Text style={styles.score}>{result.score}/{result.total} doğru · {getConfidenceLabel(result.confidence)}</Text>
          <Text style={styles.heroText}>{result.explanationTr}</Text>
        </View>

        <View style={styles.compareCard}>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Senin seçimin</Text>
            <Text style={styles.metaValue}>{getStartLevelLabel(selfSelectedLevel)}</Text>
          </View>
          <View style={styles.metaBoxStrong}>
            <Text style={styles.metaLabel}>Wolli önerisi</Text>
            <Text style={styles.metaValue}>{getPlacementLevelLabel(result.recommendedStartLevel)}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <AppButton
            icon={ArrowRight}
            loading={savingMode === 'recommended'}
            onPress={() => void finish(true)}
            title="Önerilen seviyeden başla"
          />
          <AppButton
            icon={RotateCcw}
            loading={savingMode === 'selected'}
            onPress={() => void finish(false)}
            title="Kendi seçtiğim seviyeden başla"
            variant="secondary"
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
  heroCard: {
    backgroundColor: colors.deepViolet,
    borderRadius: radius.lg,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  kicker: {
    ...typography.small,
    color: colors.yellow,
    fontWeight: '900',
  },
  level: {
    color: colors.white,
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 48,
  },
  score: {
    ...typography.body,
    color: colors.lavender,
    fontWeight: '900',
  },
  heroText: {
    ...typography.body,
    color: colors.lavender,
  },
  compareCard: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metaBox: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  metaBoxStrong: {
    backgroundColor: colors.lavender,
    borderColor: colors.royalPurple,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  metaLabel: {
    ...typography.small,
    color: colors.muted,
  },
  metaValue: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  actions: {
    gap: spacing.md,
  },
});
