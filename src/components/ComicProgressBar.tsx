import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../data/theme';

type ComicProgressBarProps = {
  current?: number;
  total?: number;
  progress?: number;
  label?: string;
  fillColor?: string;
};

export function ComicProgressBar({ current, total, progress, label, fillColor = colors.cyanAccent }: ComicProgressBarProps) {
  const value = progress ?? (total && total > 0 && current !== undefined ? current / total : 0);
  const clamped = Math.min(1, Math.max(0, value));

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.track}>
        <View style={[styles.fill, { flex: clamped, backgroundColor: fillColor }]} />
        <View style={{ flex: 1 - clamped }} />
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
    color: colors.yellowCta,
    fontWeight: '900',
  },
  track: {
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.pill,
    borderWidth: colors.comicBorderWidth,
    flexDirection: 'row',
    height: 12,
    overflow: 'hidden',
  },
  fill: {
    borderRightColor: colors.comicBorderColor,
    borderRightWidth: colors.comicBorderWidth,
  },
});
