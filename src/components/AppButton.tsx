import type { ComponentType } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, motion, radius, shadows, spacing, typography } from '../data/theme';
import { HalftoneAccent } from './HalftoneAccent';

type IconProps = {
  color?: string;
  size?: number;
  strokeWidth?: number;
};

type AppButtonProps = Omit<PressableProps, 'style'> & {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  icon?: ComponentType<IconProps>;
  style?: StyleProp<ViewStyle>;
};

export function AppButton({
  title,
  variant = 'primary',
  loading = false,
  icon: Icon,
  disabled,
  style,
  ...pressableProps
}: AppButtonProps) {
  const isDisabled = Boolean(disabled);
  const contentColor = isDisabled
    ? colors.muted
    : variant === 'danger'
      ? colors.white
      : colors.comicBorderColor;

  return (
    <Pressable
      accessibilityRole="button"
      android_ripple={{
        color: variant === 'danger' ? 'rgba(255,255,255,0.18)' : 'rgba(23,23,42,0.10)',
        foreground: true,
      }}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        variant === 'danger' && styles.danger,
        isDisabled && styles.disabled,
        pressed && !disabled && !loading && styles.pressed,
        style,
      ]}
      {...pressableProps}
    >
      {variant === 'primary' && !isDisabled ? <HalftoneAccent opacity={0.08} size="small" style={styles.texture} /> : null}
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={contentColor} />
        ) : (
          <>
            {Icon ? <Icon color={contentColor} size={19} strokeWidth={3} /> : null}
            <Text style={[styles.label, { color: contentColor }]} numberOfLines={1}>
              {title}
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.yellowCta,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.lg,
    borderWidth: colors.comicBorderWidth,
    justifyContent: 'center',
    minHeight: 60,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.comic,
  },
  primary: {
    backgroundColor: colors.yellowCta,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 60,
    paddingHorizontal: spacing.lg,
  },
  label: {
    ...typography.body,
    fontWeight: '900',
  },
  secondary: {
    backgroundColor: colors.white,
    ...shadows.comicSmall,
  },
  ghost: {
    backgroundColor: colors.paperLavender,
    borderColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  danger: {
    backgroundColor: colors.errorCoral,
  },
  disabled: {
    backgroundColor: '#F5F0D8',
    borderColor: colors.border,
    elevation: 0,
    shadowOpacity: 0,
  },
  pressed: {
    opacity: 0.98,
    transform: [{ translateX: colors.comicShadowOffset / 2 }, { translateY: colors.comicShadowOffset / 2 }, { scale: motion.pressScale }],
  },
  texture: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
