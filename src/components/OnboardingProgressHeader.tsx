import { ArrowLeft } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '../data/theme';

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

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
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
        {canGoBack ? <ArrowLeft color={colors.comicBorderColor} size={20} /> : null}
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
    flexDirection: 'row',
    gap: spacing.md,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.paper,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.sm,
    borderWidth: colors.comicBorderWidth,
    height: 44,
    justifyContent: 'center',
    width: 44,
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
    color: colors.comicBorderColor,
    fontWeight: '900',
  },
  caption: {
    ...typography.small,
    color: colors.muted,
    fontWeight: '800',
  },
  track: {
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderWidth: 2,
    borderRadius: radius.pill,
    flexDirection: 'row',
    height: 10,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: colors.yellowCta,
    borderRadius: radius.pill,
    height: 10,
  },
  pressed: {
    opacity: 0.78,
  },
});
