import type { ComponentType } from 'react';
import { StyleSheet, View } from 'react-native';
import { CheckCircle2, Lock, PlayCircle } from 'lucide-react-native';

import { colors, radius, shadows } from '../data/theme';

type IconProps = { color?: string; size?: number; strokeWidth?: number };

type RoadmapNodeProps = {
  completed?: boolean;
  current?: boolean;
  locked?: boolean;
};

export function RoadmapNode({ completed, current, locked }: RoadmapNodeProps) {
  const Icon: ComponentType<IconProps> = completed ? CheckCircle2 : locked ? Lock : PlayCircle;
  const iconColor = completed ? colors.comicBorderColor : current ? colors.comicBorderColor : colors.muted;

  return (
    <View style={[styles.node, current && styles.current, completed && styles.done, locked && styles.locked]}>
      <Icon color={iconColor} size={18} strokeWidth={2.8} />
    </View>
  );
}

const styles = StyleSheet.create({
  node: {
    alignItems: 'center',
    backgroundColor: colors.paper,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.pill,
    borderWidth: colors.comicBorderWidth,
    height: 42,
    justifyContent: 'center',
    width: 42,
    ...shadows.comicSmall,
  },
  current: {
    backgroundColor: colors.yellowCta,
  },
  done: {
    backgroundColor: colors.successGreen,
  },
  locked: {
    backgroundColor: colors.surfaceStrong,
    borderColor: colors.border,
  },
});
