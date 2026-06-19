import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, shadows, spacing, typography } from '../data/theme';

type ComicSpeechBubbleProps = {
  children?: ReactNode;
  text?: string;
  tone?: 'paper' | 'lavender' | 'yellow';
  style?: StyleProp<ViewStyle>;
};

export function ComicSpeechBubble({ children, text, tone = 'paper', style }: ComicSpeechBubbleProps) {
  return (
    <View style={[styles.wrap, style]}>
      <View style={[styles.bubble, tone === 'lavender' && styles.lavender, tone === 'yellow' && styles.yellow]}>
        {text ? <Text style={styles.text}>{text}</Text> : children}
      </View>
      <View style={[styles.tail, tone === 'lavender' && styles.tailLavender, tone === 'yellow' && styles.tailYellow]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    position: 'relative',
  },
  bubble: {
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.lg,
    borderTopLeftRadius: radius.sm,
    borderWidth: colors.comicBorderWidth,
    padding: spacing.md,
    ...shadows.comicSmall,
  },
  lavender: {
    backgroundColor: colors.softLavenderPanel,
  },
  yellow: {
    backgroundColor: colors.yellowCta,
  },
  tail: {
    backgroundColor: colors.white,
    borderBottomColor: colors.comicBorderColor,
    borderBottomWidth: colors.comicBorderWidth,
    borderLeftColor: colors.comicBorderColor,
    borderLeftWidth: colors.comicBorderWidth,
    bottom: -5,
    height: 14,
    left: 18,
    position: 'absolute',
    transform: [{ rotate: '-45deg' }],
    width: 14,
  },
  tailLavender: {
    backgroundColor: colors.softLavenderPanel,
  },
  tailYellow: {
    backgroundColor: colors.yellowCta,
  },
  text: {
    ...typography.body,
    color: colors.comicBorderColor,
    fontWeight: '800',
  },
});
