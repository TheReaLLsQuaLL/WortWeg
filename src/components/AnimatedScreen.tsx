import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, StyleSheet } from 'react-native';

import { motion } from '../data/theme';

type AnimatedScreenProps = {
  children: ReactNode;
};

export function AnimatedScreen({ children }: AnimatedScreenProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(motion.cardSlide)).current;

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (!mounted) return;
      if (reduceMotion) {
        opacity.setValue(1);
        translateY.setValue(0);
        return;
      }
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: motion.base, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: motion.base, useNativeDriver: true }),
      ]).start();
    });

    return () => {
      mounted = false;
    };
  }, [opacity, translateY]);

  return <Animated.View style={[styles.fill, { opacity, transform: [{ translateY }] }]}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
