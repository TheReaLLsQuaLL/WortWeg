import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { motion } from '../data/theme';

type AnimatedCardProps = {
  children: ReactNode;
  delayMs?: number;
  style?: StyleProp<ViewStyle>;
};

export function AnimatedCard({ children, delayMs = 0, style }: AnimatedCardProps) {
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
        Animated.timing(opacity, { toValue: 1, duration: motion.base, delay: delayMs, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: motion.base, delay: delayMs, useNativeDriver: true }),
      ]).start();
    });

    return () => {
      mounted = false;
    };
  }, [delayMs, opacity, translateY]);

  return <Animated.View style={[styles.wrap, style, { opacity, transform: [{ translateY }] }]}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
});
