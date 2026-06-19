import { Flame, Star } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../data/theme';
import { Mascot } from './Mascot';
import { StatPill } from './StatPill';

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
        <StatPill icon={Star} label={String(xp ?? 0)} tone="yellow" />
        <StatPill icon={Flame} label={String(streak ?? 0)} tone="purple" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.deepViolet,
    borderBottomColor: colors.comicBorderColor,
    borderBottomWidth: 2,
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
});
