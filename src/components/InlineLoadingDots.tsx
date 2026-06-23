import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

type InlineLoadingDotsProps = {
  color?: string;
  size?: number;
};

export function InlineLoadingDots({ color = '#17172A', size = 6 }: InlineLoadingDotsProps) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createBounce = (anim: Animated.Value, delay: number) => {
      return Animated.sequence([
        Animated.delay(delay),
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: -size,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.delay(400),
          ])
        ),
      ]);
    };

    Animated.parallel([
      createBounce(dot1, 0),
      createBounce(dot2, 100),
      createBounce(dot3, 200),
    ]).start();

    return () => {
      dot1.stopAnimation();
      dot2.stopAnimation();
      dot3.stopAnimation();
    };
  }, [dot1, dot2, dot3, size]);

  const dotStyle = {
    backgroundColor: color,
    borderRadius: size / 2,
    height: size,
    width: size,
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[dotStyle, { transform: [{ translateY: dot1 }] }]} />
      <Animated.View style={[dotStyle, { transform: [{ translateY: dot2 }] }]} />
      <Animated.View style={[dotStyle, { transform: [{ translateY: dot3 }] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    minHeight: 12,
  },
});
