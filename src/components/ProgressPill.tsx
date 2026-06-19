import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadows, spacing, typography } from '../data/theme';

type ProgressPillProps = {
  label: string;
  tone?: 'purple' | 'green' | 'yellow' | 'plain';
};

export function ProgressPill({ label, tone = 'purple' }: ProgressPillProps) {
  return (
    <View style={[styles.base, styles[tone]]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderColor: colors.comicBorderColor,
    borderRadius: radius.pill,
    borderWidth: colors.comicBorderWidth,
    minHeight: 30,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    ...shadows.comicSmall,
  },
  purple: { backgroundColor: colors.softLavenderPanel },
  green: { backgroundColor: '#DFF7EB' },
  yellow: { backgroundColor: colors.yellowCta },
  plain: { backgroundColor: colors.white },
  text: {
    ...typography.small,
    color: colors.comicBorderColor,
    fontWeight: '900',
  },
});
