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
import type { PlacementResult, PlacementSkill } from '../types/placement';

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

const skillLabels: Record<PlacementSkill, string> = {
  grammar: 'Gramer',
  vocabulary: 'Kelime',
  reading: 'Okuma',
  wordOrder: 'Kelime sırası',
  functional: 'Günlük kullanım',
};

const getStartLevelLabel = (level?: StartLevelId) => {
  if (level === 'zero') {
    return 'A0 / Sıfırdan';
  }

  if (level === 'some') {
    return 'A1 öncesi / Biraz biliyorum';
  }

  return level ?? 'A0';
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
      <TopBar subtitle="Yerel test sonucu" title="Başlangıç önerisi" />
      <AppScrollView contentContainerStyle={styles.content} style={styles.scroll}>
        <View style={styles.heroCard}>
          <Text style={styles.kicker}>Sonuç</Text>
          <Text style={styles.score}>{result.score}/{result.total}</Text>
          <Text style={styles.heroTitle}>Önerilen başlangıç: {getPlacementLevelLabel(result.recommendedStartLevel)}</Text>
          <Text style={styles.heroText}>{result.explanationTr}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seviye karşılaştırması</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaBox}>
              <Text style={styles.metaLabel}>Seçtiğin</Text>
              <Text style={styles.metaValue}>{getStartLevelLabel(selfSelectedLevel)}</Text>
            </View>
            <View style={styles.metaBox}>
              <Text style={styles.metaLabel}>Öneri</Text>
              <Text style={styles.metaValue}>{getPlacementLevelLabel(result.recommendedStartLevel)}</Text>
            </View>
          </View>
          <Text style={styles.body}>Güven: {result.confidence === 'high' ? 'yüksek' : result.confidence === 'medium' ? 'orta' : 'düşük'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Beceri kırılımı</Text>
          {Object.entries(result.skillBreakdown).map(([skill, item]) => (
            <View key={skill} style={styles.skillRow}>
              <Text style={styles.skillName}>{skillLabels[skill as PlacementSkill]}</Text>
              <Text style={styles.skillScore}>{item.correct}/{item.total}</Text>
            </View>
          ))}
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
  score: {
    color: colors.white,
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 46,
  },
  heroTitle: {
    ...typography.heading,
    color: colors.white,
  },
  heroText: {
    ...typography.body,
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
  body: {
    ...typography.body,
    color: colors.muted,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metaBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
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
  skillRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  skillName: {
    ...typography.body,
    color: colors.deepViolet,
  },
  skillScore: {
    ...typography.body,
    color: colors.royalPurple,
    fontWeight: '900',
  },
  actions: {
    gap: spacing.md,
  },
});
