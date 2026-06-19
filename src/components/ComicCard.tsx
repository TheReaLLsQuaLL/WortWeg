import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, shadows, spacing } from '../data/theme';

type ComicCardProps = {
  children: ReactNode;
  tone?: 'paper' | 'lavender' | 'purple' | 'yellow';
  accentColor?: string;
  style?: StyleProp<ViewStyle>;
};

export function ComicCard({ children, tone = 'paper', accentColor, style }: ComicCardProps) {
  return (
    <View
      style={[
        styles.base,
        tone === 'lavender' && styles.lavender,
        tone === 'purple' && styles.purple,
        tone === 'yellow' && styles.yellow,
        accentColor ? { borderTopColor: accentColor, borderTopWidth: 6 } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.lg,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.md,
    padding: spacing.lg,
    ...shadows.comic,
  },
  lavender: {
    backgroundColor: colors.softLavenderPanel,
  },
  purple: {
    backgroundColor: colors.primaryPurple,
  },
  yellow: {
    backgroundColor: colors.yellowCta,
  },
});
