import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../data/theme';

type LessonProgressBarProps = {
  current: number;
  total: number;
};

export function LessonProgressBar({ current, total }: LessonProgressBarProps) {
  const progress = total > 0 ? Math.min(1, Math.max(0, current / total)) : 0;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{current}/{total}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { flex: progress }]} />
        <View style={{ flex: 1 - progress }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  label: {
    ...typography.small,
    color: colors.yellow,
    fontWeight: '900',
  },
  track: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.pill,
    flexDirection: 'row',
    height: 8,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: colors.yellow,
  },
});
