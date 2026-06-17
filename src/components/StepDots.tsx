import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../data/theme';

type StepDotsProps = {
  current: number;
  total: number;
};

export function StepDots({ current, total }: StepDotsProps) {
  return (
    <View style={styles.row} accessibilityLabel={String(current) + ' / ' + String(total)}>
      {Array.from({ length: total }).map((_, index) => {
        const active = index <= current - 1;
        return <View key={index} style={[styles.dot, active && styles.dotActive, index === current - 1 && styles.dotCurrent]} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.pill,
    height: 8,
    width: 8,
  },
  dotActive: {
    backgroundColor: colors.lavender,
  },
  dotCurrent: {
    backgroundColor: colors.yellow,
    width: 22,
  },
});
