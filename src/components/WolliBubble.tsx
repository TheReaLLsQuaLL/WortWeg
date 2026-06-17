import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../data/theme';
import { Mascot } from './Mascot';

type WolliBubbleProps = {
  children?: ReactNode;
  text?: string;
};

export function WolliBubble({ children, text }: WolliBubbleProps) {
  return (
    <View style={styles.wrap}>
      <Mascot size={54} />
      <View style={styles.bubble}>
        {text ? <Text style={styles.text}>{text}</Text> : children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  bubble: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderTopLeftRadius: radius.sm,
    borderWidth: 1,
    flex: 1,
    padding: spacing.md,
  },
  text: {
    ...typography.body,
    color: colors.deepViolet,
  },
});
