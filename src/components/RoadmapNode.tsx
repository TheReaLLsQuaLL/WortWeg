import type { ComponentType } from 'react';
import { StyleSheet, View } from 'react-native';
import { CheckCircle2, Lock, PlayCircle } from 'lucide-react-native';

import { colors, radius } from '../data/theme';

type IconProps = { color?: string; size?: number; strokeWidth?: number };

type RoadmapNodeProps = {
  completed?: boolean;
  current?: boolean;
  locked?: boolean;
};

export function RoadmapNode({ completed, current, locked }: RoadmapNodeProps) {
  const Icon: ComponentType<IconProps> = completed ? CheckCircle2 : locked ? Lock : PlayCircle;
  const iconColor = completed ? colors.green : current ? colors.royalPurple : colors.muted;

  return (
    <View style={[styles.node, current && styles.current, completed && styles.done]}>
      <Icon color={iconColor} size={18} strokeWidth={2.6} />
    </View>
  );
}

const styles = StyleSheet.create({
  node: {
    alignItems: 'center',
    backgroundColor: colors.surfaceStrong,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  current: {
    backgroundColor: colors.lavender,
    borderColor: colors.royalPurple,
  },
  done: {
    backgroundColor: '#DFF7EB',
    borderColor: '#B7EBCF',
  },
});
