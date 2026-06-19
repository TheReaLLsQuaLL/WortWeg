import { Flame, Star } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadows, spacing, typography } from '../data/theme';
import { HalftoneAccent } from './HalftoneAccent';
import { Mascot } from './Mascot';
import { StatPill } from './StatPill';

type TopBarProps = {
  title: string;
  subtitle?: string;
  xp?: number;
  streak?: number;
  variant?: 'paper' | 'dark';
};

export function TopBar({ title, subtitle, xp, streak, variant = 'paper' }: TopBarProps) {
  const dark = variant === 'dark';

  return (
    <View style={[styles.container, dark && styles.darkContainer]}>
      {!dark ? <HalftoneAccent opacity={0.08} size="small" style={styles.texture} /> : null}
      <View style={styles.titleRow}>
        <View style={styles.avatarWrap}>
          <Mascot size={48} />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.title, dark && styles.darkTitle]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, dark && styles.darkSubtitle]} numberOfLines={1}>
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
    backgroundColor: colors.paper,
    borderBottomColor: colors.comicBorderColor,
    borderBottomWidth: colors.comicBorderWidth,
    gap: spacing.md,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  darkContainer: {
    backgroundColor: colors.deepViolet,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  avatarWrap: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.lg,
    borderWidth: colors.comicBorderWidth,
    height: 58,
    justifyContent: 'center',
    width: 58,
    ...shadows.comicSmall,
  },
  copy: {
    flex: 1,
  },
  title: {
    ...typography.heading,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  darkTitle: {
    color: colors.white,
  },
  subtitle: {
    ...typography.small,
    color: colors.muted,
    fontWeight: '800',
  },
  darkSubtitle: {
    color: colors.lavender,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  texture: {
    height: 96,
    position: 'absolute',
    right: -20,
    top: -12,
    width: 160,
  },
});
