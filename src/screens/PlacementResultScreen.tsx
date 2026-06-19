import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react-native';

import { AppButton } from '../components/AppButton';
import { AppScrollView, Screen } from '../components/layout';
import { HalftoneAccent } from '../components/HalftoneAccent';
import { TopBar } from '../components/TopBar';
import { colors, radius, shadows, spacing, typography } from '../data/theme';
import { createLearningPlan } from '../services/planService';
import { trackLocalEvent } from '../services/localEventLog';
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
  const isB1CappedForAlpha = result.privateAlphaCappedFrom === 'B1';
  const recommendationLabel = isB1CappedForAlpha
    ? 'A2 pekiştirme'
    : getPlacementLevelLabel(result.recommendedStartLevel);
  const roadmapText = isB1CappedForAlpha
    ? 'B1 yakında. Şimdilik A2 pekiştirme planıyla devam edelim.'
    : getPlacementLevelLabel(result.recommendedStartLevel) + ' seviyesinden başlayabilir.';

  const finish = async (useRecommendation: boolean) => {
    setSavingMode(useRecommendation ? 'recommended' : 'selected');
    trackLocalEvent({
      type: 'placement_completed',
      screen: 'PlacementResult',
      metadata: { level: result.recommendedStartLevel },
    });
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
          <HalftoneAccent color={colors.yellowCta} opacity={0.1} size="small" style={styles.heroTexture} />
          <Text style={styles.kicker}>Önerilen seviye</Text>
          <Text style={styles.level}>{recommendationLabel}</Text>
          <Text style={styles.score}>{result.score}/{result.total} doğru · {getConfidenceLabel(result.confidence)}</Text>
          <Text style={styles.heroText}>{result.explanationTr}</Text>
          {isB1CappedForAlpha ? (
            <View style={styles.alphaNotice}>
              <Text style={styles.alphaNoticeText}>B1 özel alpha sonrası açılacak.</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.compareCard}>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Senin seçimin</Text>
            <Text style={styles.metaValue}>{getStartLevelLabel(selfSelectedLevel)}</Text>
          </View>
          <View style={styles.metaBoxStrong}>
            <Text style={styles.metaLabel}>Wolli önerisi</Text>
            <Text style={styles.metaValue}>{recommendationLabel}</Text>
          </View>
        </View>

        <View style={styles.roadmapPreview}>
          <Text style={styles.previewTitle}>Sıradaki adım</Text>
          <View style={styles.previewStep}>
            <View style={styles.previewDotMuted}>
              <CheckCircle2 color={colors.muted} size={16} strokeWidth={2.8} />
            </View>
            <View style={styles.previewCopy}>
              <Text style={styles.previewLabel}>Seçilen başlangıç</Text>
              <Text style={styles.previewText}>{getStartLevelLabel(selfSelectedLevel)}</Text>
            </View>
          </View>
          <View style={styles.previewStepActive}>
            <View style={styles.previewDotActive}>
              <ArrowRight color={colors.deepViolet} size={16} strokeWidth={3} />
            </View>
            <View style={styles.previewCopy}>
              <Text style={styles.previewLabelActive}>Yol haritan</Text>
              <Text style={styles.previewTextActive}>{roadmapText}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <AppButton
            icon={ArrowRight}
            loading={savingMode === 'recommended'}
            onPress={() => void finish(true)}
            title="Yol haritamı hazırla"
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
    backgroundColor: colors.lavenderBackground,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  heroCard: {
    backgroundColor: colors.deepViolet,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.sm,
    overflow: 'hidden',
    padding: spacing.lg,
    ...shadows.comic,
  },
  heroTexture: {
    bottom: 0,
    position: 'absolute',
    right: -16,
    top: -16,
    width: 140,
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
  alphaNotice: {
    alignSelf: 'flex-start',
    backgroundColor: colors.yellowCta,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.sm,
    borderWidth: colors.comicBorderWidth,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  alphaNoticeText: {
    ...typography.small,
    color: colors.comicBorderColor,
    fontWeight: '900',
  },
  compareCard: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metaBox: {
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.lg,
    borderWidth: colors.comicBorderWidth,
    flex: 1,
    gap: spacing.xs,
    padding: spacing.md,
    ...shadows.comicSmall,
  },
  metaBoxStrong: {
    backgroundColor: colors.comicYellowWash,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.lg,
    borderWidth: colors.comicBorderWidth,
    flex: 1,
    gap: spacing.xs,
    padding: spacing.md,
    ...shadows.comicSmall,
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
  roadmapPreview: {
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.md,
    padding: spacing.lg,
    ...shadows.comic,
  },
  previewTitle: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  previewStep: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    opacity: 0.74,
  },
  previewStepActive: {
    alignItems: 'center',
    backgroundColor: colors.paperLavender,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.lg,
    borderWidth: colors.comicBorderWidth,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  previewDotMuted: {
    alignItems: 'center',
    backgroundColor: colors.paperLavender,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  previewDotActive: {
    alignItems: 'center',
    backgroundColor: colors.yellowCta,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.pill,
    borderWidth: colors.comicBorderWidth,
    height: 38,
    justifyContent: 'center',
    width: 38,
    ...shadows.comicSmall,
  },
  previewCopy: { flex: 1, gap: 2 },
  previewLabel: { ...typography.small, color: colors.muted, fontWeight: '900' },
  previewLabelActive: { ...typography.small, color: colors.royalPurple, fontWeight: '900' },
  previewText: { ...typography.body, color: colors.deepViolet, fontWeight: '800' },
  previewTextActive: { ...typography.body, color: colors.deepViolet, fontWeight: '900' },
  actions: {
    gap: spacing.md,
  },
});
