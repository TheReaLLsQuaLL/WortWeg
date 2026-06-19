import { ArrowLeft } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, shadows, spacing, typography } from '../data/theme';

type OnboardingProgressHeaderProps = {
  current: number;
  total: number;
  canGoBack?: boolean;
  onBack?: () => void;
};

export function OnboardingProgressHeader({
  current,
  total,
  canGoBack = false,
  onBack,
}: OnboardingProgressHeaderProps) {
  const insets = useSafeAreaInsets();
  const safeCurrent = Math.min(Math.max(current, 1), total);
  const progress = total > 0 ? safeCurrent / total : 0;
  const topPadding = Math.max(insets.top + spacing.md, spacing.xl);

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Geri"
        disabled={!canGoBack}
        onPress={onBack}
        style={({ pressed }) => [
          styles.backButton,
          !canGoBack && styles.backButtonHidden,
          pressed && canGoBack && styles.pressed,
        ]}
      >
        {canGoBack ? <ArrowLeft color={colors.white} size={20} /> : null}
      </Pressable>

      <View style={styles.progressWrap}>
        <View style={styles.progressTopRow}>
          <Text style={styles.stepText}>{safeCurrent}/{total}</Text>
          <Text style={styles.caption}>Yol haritası</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { flex: progress }]} />
          <View style={{ flex: 1 - progress }} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.lavenderBackground,
    flexDirection: 'row',
    gap: spacing.md,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.primaryPurple,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.md,
    borderWidth: colors.comicBorderWidth,
    height: 46,
    justifyContent: 'center',
    width: 46,
    ...shadows.comicSmall,
  },
  backButtonHidden: {
    opacity: 0,
  },
  progressWrap: {
    flex: 1,
    gap: spacing.xs,
  },
  progressTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepText: {
    ...typography.small,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  caption: {
    ...typography.small,
    color: colors.muted,
    fontWeight: '900',
  },
  track: {
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.pill,
    borderWidth: colors.comicBorderWidth,
    flexDirection: 'row',
    height: 13,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: colors.yellowCta,
    borderRightColor: colors.comicBorderColor,
    borderRightWidth: 2,
    height: 13,
  },
  pressed: {
    opacity: 0.78,
  },
});
