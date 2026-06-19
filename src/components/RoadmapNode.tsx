import type { ComponentType } from 'react';
import { StyleSheet, View } from 'react-native';
import { CheckCircle2, Lock, PlayCircle } from 'lucide-react-native';

import { colors, radius, shadows } from '../data/theme';

type IconProps = { color?: string; size?: number; strokeWidth?: number };

type RoadmapNodeProps = {
  completed?: boolean;
  current?: boolean;
  locked?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

export function RoadmapNode({ completed, current, locked, size = current ? 'lg' : completed ? 'md' : 'sm' }: RoadmapNodeProps) {
  const Icon: ComponentType<IconProps> = completed ? CheckCircle2 : locked ? Lock : PlayCircle;
  const iconColor = locked ? colors.muted : colors.comicBorderColor;

  return (
    <View style={[styles.node, styles[size], current && styles.current, completed && styles.done, locked && styles.locked]}>
      {current ? <View style={styles.currentRing} /> : null}
      <Icon color={iconColor} size={size === 'lg' ? 30 : size === 'md' ? 24 : 20} strokeWidth={3} />
    </View>
  );
}

const styles = StyleSheet.create({
  node: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.pill,
    borderWidth: colors.comicBorderWidth,
    height: 50,
    justifyContent: 'center',
    width: 50,
    ...shadows.comicSmall,
  },
  sm: {
    height: 48,
    width: 48,
  },
  md: {
    height: 58,
    width: 58,
  },
  lg: {
    height: 76,
    width: 76,
  },
  current: {
    backgroundColor: colors.yellowCta,
    ...shadows.comic,
  },
  done: {
    backgroundColor: colors.successGreen,
  },
  locked: {
    backgroundColor: colors.paperLavender,
    borderColor: colors.border,
  },
  currentRing: {
    borderColor: colors.primaryPurple,
    borderRadius: 999,
    borderWidth: 4,
    bottom: -8,
    left: -8,
    opacity: 0.32,
    position: 'absolute',
    right: -8,
    top: -8,
  },
});
