import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

export type OwlyState = 'idle' | 'listening' | 'success' | 'mistake' | 'thinking' | 'talking';

type OwlyMascotProps = {
  state?: OwlyState;
  width?: number;
  height?: number;
};

const AnimatedG = Animated.createAnimatedComponent(G);

export function OwlyMascot({ state = 'idle', width = 160, height = 160 }: OwlyMascotProps) {
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const rightWingRot = useRef(new Animated.Value(0)).current;
  const leftWingRot = useRef(new Animated.Value(0)).current;
  const jumpAnim = useRef(new Animated.Value(0)).current;
  const headTilt = useRef(new Animated.Value(0)).current;
  const audioWaveAnim = useRef(new Animated.Value(0)).current;
  const beakAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    breatheAnim.stopAnimation();
    blinkAnim.stopAnimation();
    rightWingRot.stopAnimation();
    leftWingRot.stopAnimation();
    jumpAnim.stopAnimation();
    headTilt.stopAnimation();
    audioWaveAnim.stopAnimation();
    beakAnim.stopAnimation();

    if (state === 'idle' || state === 'mistake') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(breatheAnim, { toValue: 1.02, duration: 2000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.timing(breatheAnim, { toValue: 1, duration: 2000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.delay(3000),
          Animated.timing(blinkAnim, { toValue: 0.1, duration: 100, useNativeDriver: true }),
          Animated.timing(blinkAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
          Animated.delay(200),
          Animated.timing(blinkAnim, { toValue: 0.1, duration: 100, useNativeDriver: true }),
          Animated.timing(blinkAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ])
      ).start();

      Animated.spring(rightWingRot, { toValue: 0, useNativeDriver: true }).start();
      Animated.spring(leftWingRot, { toValue: 0, useNativeDriver: true }).start();
      Animated.spring(jumpAnim, { toValue: 0, useNativeDriver: true }).start();
      Animated.spring(headTilt, { toValue: 0, useNativeDriver: true }).start();
    }

    if (state === 'listening') {
      Animated.spring(rightWingRot, { toValue: -130, useNativeDriver: true }).start();
      
      Animated.loop(
        Animated.sequence([
          Animated.timing(headTilt, { toValue: 5, duration: 1000, useNativeDriver: true }),
          Animated.timing(headTilt, { toValue: 0, duration: 1000, useNativeDriver: true }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(audioWaveAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(audioWaveAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    }

    if (state === 'success') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(jumpAnim, { toValue: -30, duration: 300, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
          Animated.timing(jumpAnim, { toValue: 0, duration: 300, useNativeDriver: true, easing: Easing.in(Easing.cubic) }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(leftWingRot, { toValue: 120, duration: 250, useNativeDriver: true }),
          Animated.timing(leftWingRot, { toValue: 20, duration: 250, useNativeDriver: true }),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(rightWingRot, { toValue: -120, duration: 250, useNativeDriver: true }),
          Animated.timing(rightWingRot, { toValue: -20, duration: 250, useNativeDriver: true }),
        ])
      ).start();
    }

    if (state === 'thinking') {
      Animated.spring(headTilt, { toValue: -10, useNativeDriver: true }).start();
      Animated.spring(rightWingRot, { toValue: -60, useNativeDriver: true }).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(jumpAnim, { toValue: -8, duration: 1000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.timing(jumpAnim, { toValue: 0, duration: 1000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        ])
      ).start();
    }

    if (state === 'talking') {
      Animated.spring(rightWingRot, { toValue: -30, useNativeDriver: true }).start();
      Animated.spring(leftWingRot, { toValue: 30, useNativeDriver: true }).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(breatheAnim, { toValue: 1.02, duration: 1000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.timing(breatheAnim, { toValue: 1, duration: 1000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(beakAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
          Animated.timing(beakAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
          Animated.timing(beakAnim, { toValue: 0.5, duration: 100, useNativeDriver: true }),
          Animated.timing(beakAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
          Animated.delay(200),
        ])
      ).start();
    }
  }, [state, breatheAnim, blinkAnim, rightWingRot, leftWingRot, jumpAnim, headTilt, audioWaveAnim, beakAnim]);

  const rightWingStr = rightWingRot.interpolate({ inputRange: [-180, 180], outputRange: ['-180deg', '180deg'] });
  const leftWingStr = leftWingRot.interpolate({ inputRange: [-180, 180], outputRange: ['-180deg', '180deg'] });
  const headRotStr = headTilt.interpolate({ inputRange: [-180, 180], outputRange: ['-180deg', '180deg'] });
  const audioWaveScale = audioWaveAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.2] });
  const audioWaveOpacity = audioWaveAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
  const beakScaleY = beakAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] });

  const isMistake = state === 'mistake';
  const isHappy = state === 'success';
  const isListening = state === 'listening';

  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Svg viewBox="0 0 500 500" width="100%" height="100%">
        {isListening && (
          <AnimatedG transform={[{ scaleY: audioWaveScale as any }]} opacity={audioWaveOpacity} fill="#00E5FF">
            <Rect x="420" y="220" width="8" height="60" rx="4" />
            <Rect x="440" y="200" width="8" height="100" rx="4" />
            <Rect x="460" y="230" width="8" height="40" rx="4" />
          </AnimatedG>
        )}

        <AnimatedG transform={[{ translateY: jumpAnim as any }]}>
          <G fill="#FFB300" stroke="#D99800" strokeWidth="3" strokeLinejoin="round">
            <Path d="M 210 400 L 190 430 L 200 435 L 215 425 L 225 435 L 235 430 L 230 400 Z" />
            <Path d="M 290 400 L 270 430 L 280 435 L 285 425 L 295 435 L 305 430 L 290 400 Z" />
          </G>

          <Path d="M 160 380 Q 120 420 140 440 Q 160 410 180 390 Z" fill="#1E1B3A" stroke="#00E5FF" strokeWidth="4" strokeLinejoin="round" />

          <AnimatedG transform={[{ scaleY: breatheAnim as any }]}>
            <Ellipse cx="250" cy="270" rx="110" ry="130" fill="#1E1B3A" stroke="#141226" strokeWidth="4" />
            <Ellipse cx="250" cy="300" rx="80" ry="90" fill="#FFFFFF" opacity="0.08" />
            <Path d="M 140 250 Q 250 300 360 250 Q 370 270 360 290 Q 250 330 140 290 Z" fill="#141226" stroke="#00E5FF" strokeWidth="4" strokeLinejoin="round" />
            <Line x1="230" y1="285" x2="230" y2="340" stroke="#00E5FF" strokeWidth="6" strokeLinecap="round" />
            <Circle cx="230" cy="340" r="5" fill="#FFB300" />
            <Line x1="270" y1="285" x2="270" y2="325" stroke="#00E5FF" strokeWidth="6" strokeLinecap="round" />
            <Circle cx="270" cy="325" r="5" fill="#FFB300" />
          </AnimatedG>

          <AnimatedG transform={[{ rotate: headRotStr as any }]}>
            <Ellipse cx="250" cy="160" rx="125" ry="95" fill="#1E1B3A" />
            <Path d="M 150 90 Q 130 50 170 80" fill="none" stroke="#1E1B3A" strokeWidth="24" strokeLinecap="round" />
            <Path d="M 350 90 Q 370 50 330 80" fill="none" stroke="#1E1B3A" strokeWidth="24" strokeLinecap="round" />
            <Path d="M 135 160 Q 135 100 195 120 Q 250 145 250 160 Q 250 145 305 120 Q 365 100 365 160 Q 365 220 250 240 Q 135 220 135 160 Z" fill="#FFFFFF" />

            <AnimatedG transform={[{ scaleY: blinkAnim as any }]}>
              <G>
                <Circle cx="195" cy="165" r="35" fill="#1E1B3A" />
                <Circle cx="195" cy="165" r="28" fill="#FFB300" />
                {!isHappy && (
                  <G>
                    <Circle cx="195" cy="165" r="18" fill="#1E1B3A" />
                    <Circle cx="202" cy="158" r="6" fill="#FFFFFF" />
                  </G>
                )}
                {isHappy && (
                  <Path d="M 175 165 Q 195 140 215 165" fill="none" stroke="#1E1B3A" strokeWidth="8" strokeLinecap="round" />
                )}
                {isMistake && (
                  <Path d="M 170 145 Q 195 165 220 150" fill="none" stroke="#FF6B6B" strokeWidth="6" strokeLinecap="round" />
                )}
              </G>

              <G>
                <Circle cx="305" cy="165" r="35" fill="#1E1B3A" />
                <Circle cx="305" cy="165" r="28" fill="#FFB300" />
                {!isHappy && (
                  <G>
                    <Circle cx="305" cy="165" r="18" fill="#1E1B3A" />
                    <Circle cx="312" cy="158" r="6" fill="#FFFFFF" />
                  </G>
                )}
                {isHappy && (
                  <Path d="M 285 165 Q 305 140 325 165" fill="none" stroke="#1E1B3A" strokeWidth="8" strokeLinecap="round" />
                )}
                {isMistake && (
                  <Path d="M 280 150 Q 305 165 330 145" fill="none" stroke="#FF6B6B" strokeWidth="6" strokeLinecap="round" />
                )}
              </G>
            </AnimatedG>

            <AnimatedG transform={[{ scaleY: beakScaleY as any }]} originX="250" originY="190">
              <Path d="M 235 190 Q 250 175 265 190 L 255 220 Q 250 230 245 220 Z" fill="#FFB300" stroke="#D99800" strokeWidth="2" strokeLinejoin="round" />
            </AnimatedG>
          </AnimatedG>

          <AnimatedG transform={[{ rotate: leftWingStr as any }]} originX="140" originY="260">
            <Path d="M 140 260 Q 90 330 110 390 Q 140 360 150 340 Z" fill="#1E1B3A" stroke="#00E5FF" strokeWidth="4" strokeLinejoin="round" />
          </AnimatedG>
          <AnimatedG transform={[{ rotate: rightWingStr as any }]} originX="360" originY="260">
            <Path d="M 360 260 Q 410 330 390 390 Q 360 360 350 340 Z" fill="#1E1B3A" stroke="#00E5FF" strokeWidth="4" strokeLinejoin="round" />
          </AnimatedG>
        </AnimatedG>
      </Svg>
    </View>
  );
}
