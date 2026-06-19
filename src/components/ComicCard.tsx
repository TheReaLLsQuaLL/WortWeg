import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, shadows, spacing } from '../data/theme';
import { HalftoneAccent } from './HalftoneAccent';

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
        accentColor ? { borderTopColor: accentColor, borderTopWidth: 10 } : null,
        style,
      ]}
    >
      {accentColor ? <HalftoneAccent color={accentColor} opacity={0.08} size="small" style={styles.texture} /> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.md,
    overflow: 'hidden',
    padding: spacing.xl,
    position: 'relative',
    ...shadows.lift,
  },
  lavender: {
    backgroundColor: colors.paperLavender,
  },
  purple: {
    backgroundColor: colors.primaryPurple,
  },
  yellow: {
    backgroundColor: colors.yellowCta,
  },
  texture: {
    height: 96,
    position: 'absolute',
    right: -16,
    top: -16,
    width: 132,
  },
});
