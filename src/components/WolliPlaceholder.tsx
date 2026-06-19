import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../data/theme';

export type WolliPlaceholderPose =
  | 'WOLLI_WELCOME'
  | 'WOLLI_POINTING'
  | 'WOLLI_LISTENING'
  | 'WOLLI_THINKING'
  | 'WOLLI_CELEBRATION'
  | 'WOLLI_CALM'
  | 'WOLLI_TINY';

type WolliPlaceholderProps = {
  pose?: WolliPlaceholderPose;
  size?: number;
};

export function WolliPlaceholder({ pose = 'WOLLI_CALM', size = 72 }: WolliPlaceholderProps) {
  return (
    <View accessibilityLabel={pose} style={[styles.wrap, { height: size, width: size, borderRadius: size * 0.28 }]}> 
      <Text style={[styles.w, { fontSize: Math.max(18, size * 0.34) }]}>W</Text>
      {size >= 58 ? <Text style={styles.label} numberOfLines={1}>{pose.replace('WOLLI_', '')}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    backgroundColor: colors.softLavenderPanel,
    borderColor: colors.comicBorderColor,
    borderWidth: colors.comicBorderWidth,
    justifyContent: 'center',
    padding: spacing.xs,
  },
  w: {
    color: colors.primaryPurple,
    fontWeight: '900',
    lineHeight: 34,
  },
  label: {
    ...typography.micro,
    color: colors.comicBorderColor,
    fontSize: 8,
    lineHeight: 10,
    textAlign: 'center',
  },
});
