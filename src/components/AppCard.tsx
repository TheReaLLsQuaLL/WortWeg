import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, shadows, spacing } from '../data/theme';

type AppCardProps = {
  children: ReactNode;
  tone?: 'default' | 'muted' | 'violet';
  style?: StyleProp<ViewStyle>;
};

export function AppCard({ children, tone = 'default', style }: AppCardProps) {
  return (
    <View style={[styles.base, tone === 'muted' && styles.muted, tone === 'violet' && styles.violet, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.card,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.lg,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.md,
    padding: spacing.lg,
    ...shadows.comic,
  },
  muted: {
    backgroundColor: colors.cardMuted,
  },
  violet: {
    backgroundColor: colors.primaryPurple,
    borderColor: colors.comicBorderColor,
  },
});
