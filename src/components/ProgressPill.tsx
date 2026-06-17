import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../data/theme';

type ProgressPillProps = {
  label: string;
  tone?: 'purple' | 'green' | 'yellow' | 'plain';
};

export function ProgressPill({ label, tone = 'purple' }: ProgressPillProps) {
  return (
    <View style={[styles.base, styles[tone]]}>
      <Text style={[styles.text, tone === 'yellow' && styles.yellowText]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radius.pill,
    minHeight: 28,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  purple: { backgroundColor: colors.lavender },
  green: { backgroundColor: '#DFF7EB' },
  yellow: { backgroundColor: '#FFF2C4' },
  plain: { backgroundColor: colors.surfaceStrong },
  text: {
    ...typography.small,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  yellowText: {
    color: '#7A5600',
  },
});
