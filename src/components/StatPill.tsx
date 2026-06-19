import type { ComponentType } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../data/theme';

type IconProps = { color?: string; size?: number; strokeWidth?: number; fill?: string };

type StatPillProps = {
  label: string;
  icon?: ComponentType<IconProps>;
  tone?: 'yellow' | 'purple' | 'white';
};

export function StatPill({ icon: Icon, label, tone = 'white' }: StatPillProps) {
  const iconColor = tone === 'yellow' ? colors.comicBorderColor : colors.primaryPurple;

  return (
    <View style={[styles.base, tone === 'yellow' && styles.yellow, tone === 'purple' && styles.purple]}>
      {Icon ? <Icon color={iconColor} fill={tone === 'yellow' ? iconColor : undefined} size={16} strokeWidth={2.6} /> : null}
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.pill,
    borderWidth: colors.comicBorderWidth,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 34,
    paddingHorizontal: spacing.md,
  },
  yellow: {
    backgroundColor: colors.yellowCta,
  },
  purple: {
    backgroundColor: colors.softLavenderPanel,
  },
  text: {
    ...typography.small,
    color: colors.comicBorderColor,
    fontWeight: '900',
  },
});
