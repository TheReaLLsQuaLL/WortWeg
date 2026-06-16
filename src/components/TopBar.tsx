import { Flame, Star } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../data/theme';
import { Mascot } from './Mascot';

type TopBarProps = {
  title: string;
  subtitle?: string;
  xp?: number;
  streak?: number;
};

export function TopBar({ title, subtitle, xp, streak }: TopBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Mascot size={48} />
        <View style={styles.copy}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Star color={colors.yellow} size={16} fill={colors.yellow} />
          <Text style={styles.statText}>{xp ?? 0}</Text>
        </View>
        <View style={styles.stat}>
          <Flame color={colors.yellow} size={16} />
          <Text style={styles.statText}>{streak ?? 0}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.deepViolet,
    gap: spacing.md,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  copy: {
    flex: 1,
  },
  title: {
    ...typography.heading,
    color: colors.white,
  },
  subtitle: {
    ...typography.small,
    color: colors.lavender,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stat: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 34,
    paddingHorizontal: spacing.md,
  },
  statText: {
    ...typography.small,
    color: colors.white,
  },
});
