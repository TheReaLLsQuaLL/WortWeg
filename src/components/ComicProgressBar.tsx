import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../data/theme';
import { HalftoneAccent } from './HalftoneAccent';

type ComicProgressBarProps = {
  current?: number;
  total?: number;
  progress?: number;
  label?: string;
  fillColor?: string;
};

export function ComicProgressBar({ current, total, progress, label, fillColor = colors.yellowCta }: ComicProgressBarProps) {
  const value = progress ?? (total && total > 0 && current !== undefined ? current / total : 0);
  const clamped = Math.min(1, Math.max(0, value));

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.track}>
        <View style={[styles.fill, { flex: clamped, backgroundColor: fillColor }]}>
          <HalftoneAccent opacity={0.1} size="small" style={styles.fillTexture} />
        </View>
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
    color: colors.deepViolet,
    fontWeight: '900',
  },
  track: {
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.pill,
    borderWidth: colors.comicBorderWidth,
    flexDirection: 'row',
    height: 14,
    overflow: 'hidden',
  },
  fill: {
    borderRightColor: colors.comicBorderColor,
    borderRightWidth: colors.comicBorderWidth,
    overflow: 'hidden',
    position: 'relative',
  },
  fillTexture: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
