import { StyleSheet, View } from 'react-native';

import { colors } from '../data/theme';

type MascotProps = {
  size?: number;
};

export function Mascot({ size = 72 }: MascotProps) {
  const eyeSize = size * 0.2;
  const pupilSize = size * 0.08;

  return (
    <View style={{ height: size, width: size }} accessibilityLabel="WortWeg maskotu">
      <View style={[styles.shadow, { width: size * 0.62, left: size * 0.19 }]} />
      <View
        style={[
          styles.body,
          {
            height: size * 0.84,
            width: size * 0.72,
            borderRadius: size * 0.26,
            left: size * 0.14,
            top: size * 0.1,
          },
        ]}
      >
      <View style={styles.cap} />
      <View style={[styles.wing, styles.leftWing]} />
      <View style={[styles.wing, styles.rightWing]} />
      <View style={styles.eyes}>
        <View style={[styles.eye, { height: eyeSize, width: eyeSize, borderRadius: eyeSize / 2 }]}>
          <View
            style={[
              styles.pupil,
              { height: pupilSize, width: pupilSize, borderRadius: pupilSize / 2 },
            ]}
          />
        </View>
        <View style={[styles.eye, { height: eyeSize, width: eyeSize, borderRadius: eyeSize / 2 }]}>
          <View
            style={[
              styles.pupil,
              { height: pupilSize, width: pupilSize, borderRadius: pupilSize / 2 },
            ]}
          />
        </View>
      </View>
      <View style={styles.beak} />
      <View style={styles.belly} />
      <View style={[styles.foot, styles.leftFoot]} />
      <View style={[styles.foot, styles.rightFoot]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    alignItems: 'center',
    backgroundColor: '#8B6FE8',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'absolute',
  },
  shadow: {
    backgroundColor: 'rgba(30,27,58,0.16)',
    borderRadius: 999,
    bottom: 0,
    height: 6,
    position: 'absolute',
  },
  cap: {
    backgroundColor: colors.yellow,
    borderBottomColor: '#F0A82E',
    borderBottomWidth: 5,
    borderRadius: 24,
    height: 24,
    left: 8,
    position: 'absolute',
    right: 8,
    top: 5,
    zIndex: 1,
  },
  wing: {
    backgroundColor: '#7A5FE0',
    height: 26,
    position: 'absolute',
    top: 34,
    width: 18,
  },
  leftWing: {
    borderBottomLeftRadius: 18,
    borderTopLeftRadius: 18,
    left: -7,
    transform: [{ rotate: '-12deg' }],
  },
  rightWing: {
    borderBottomRightRadius: 18,
    borderTopRightRadius: 18,
    right: -7,
    transform: [{ rotate: '12deg' }],
  },
  eyes: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    zIndex: 2,
  },
  eye: {
    alignItems: 'center',
    backgroundColor: colors.white,
    justifyContent: 'center',
  },
  pupil: {
    backgroundColor: colors.deepViolet,
  },
  beak: {
    borderLeftColor: 'transparent',
    borderLeftWidth: 7,
    borderRightColor: 'transparent',
    borderRightWidth: 7,
    borderTopColor: colors.yellow,
    borderTopWidth: 10,
    height: 0,
    width: 0,
    zIndex: 2,
  },
  belly: {
    backgroundColor: '#C9BCF5',
    borderRadius: 30,
    bottom: -18,
    height: 44,
    position: 'absolute',
    width: 50,
  },
  foot: {
    backgroundColor: colors.yellow,
    borderRadius: 999,
    bottom: 1,
    height: 8,
    position: 'absolute',
    width: 16,
    zIndex: 3,
  },
  leftFoot: {
    left: 16,
  },
  rightFoot: {
    right: 16,
  },
});
