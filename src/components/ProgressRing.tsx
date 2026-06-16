import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, typography } from '../data/theme';

type ProgressRingProps = {
  progress: number;
  label?: string;
  size?: number;
};

export function ProgressRing({
  progress,
  label = 'ilerleme',
  size = 76,
}: ProgressRingProps) {
  const percent = Math.max(0, Math.min(100, Math.round(progress * 100)));

  return (
    <View
      style={[
        styles.outer,
        {
          height: size,
          width: size,
          borderRadius: size / 2,
          borderColor: percent >= 100 ? colors.green : colors.royalPurple,
        },
      ]}
    >
      <Text style={styles.percent}>{percent}%</Text>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 6,
    justifyContent: 'center',
  },
  percent: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  label: {
    ...typography.small,
    color: colors.muted,
    fontSize: 10,
    lineHeight: 12,
    maxWidth: 58,
    textAlign: 'center',
  },
});
