import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '../data/theme';

type HalftoneAccentProps = {
  color?: string;
  opacity?: number;
  size?: 'small' | 'medium' | 'large';
  style?: StyleProp<ViewStyle>;
};

const DOTS = Array.from({ length: 36 }, (_, index) => index);

export function HalftoneAccent({
  color = colors.comicBorderColor,
  opacity = 0.12,
  size = 'medium',
  style,
}: HalftoneAccentProps) {
  const dotSize = size === 'large' ? 4 : size === 'small' ? 2 : 3;
  const gap = size === 'large' ? 8 : size === 'small' ? 5 : 6;

  return (
    <View pointerEvents="none" style={[styles.container, style]}>
      {DOTS.map((dot) => (
        <View
          key={dot}
          style={{
            backgroundColor: color,
            borderRadius: dotSize / 2,
            height: dotSize,
            margin: gap / 2,
            opacity,
            width: dotSize,
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignContent: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'hidden',
  },
});
