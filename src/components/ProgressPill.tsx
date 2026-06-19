import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadows, spacing, typography } from '../data/theme';

type ProgressPillProps = {
  label: string;
  tone?: 'purple' | 'green' | 'yellow' | 'plain';
};

export function ProgressPill({ label, tone = 'purple' }: ProgressPillProps) {
  return (
    <View style={[styles.base, styles[tone]]}>
      <Text style={[styles.text, tone === 'purple' && styles.purpleText]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderColor: colors.comicBorderColor,
    borderRadius: radius.pill,
    borderWidth: 2,
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    ...shadows.comicSmall,
  },
  purple: { backgroundColor: colors.primaryPurple },
  green: { backgroundColor: colors.successGreen },
  yellow: { backgroundColor: colors.yellowCta },
  plain: { backgroundColor: colors.white },
  text: {
    ...typography.small,
    color: colors.comicBorderColor,
    fontWeight: '900',
  },
  purpleText: {
    color: colors.white,
  },
});
