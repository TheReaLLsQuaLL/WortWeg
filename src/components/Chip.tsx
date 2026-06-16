import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, radius, spacing, typography } from '../data/theme';

type ChipProps = Omit<PressableProps, 'style'> & {
  label: string;
  selected?: boolean;
  tone?: 'purple' | 'yellow' | 'green' | 'plain';
  style?: StyleProp<ViewStyle>;
};

export function Chip({
  label,
  selected = false,
  tone = 'plain',
  style,
  ...pressableProps
}: ChipProps) {
  const backgroundColor = selected
    ? colors.deepViolet
    : tone === 'yellow'
      ? '#FFF2C4'
      : tone === 'green'
        ? '#DFF7EB'
        : tone === 'purple'
          ? colors.lavender
          : colors.white;

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        { backgroundColor },
        selected && styles.selected,
        pressed && styles.pressed,
        style,
      ]}
      {...pressableProps}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  label: {
    ...typography.small,
    color: colors.deepViolet,
  },
  selected: {
    borderColor: colors.deepViolet,
  },
  selectedLabel: {
    color: colors.white,
  },
  pressed: {
    opacity: 0.8,
  },
});
