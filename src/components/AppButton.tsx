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
  const contentColor = variant === 'danger' ? colors.white : colors.comicBorderColor;

  return (
    <Pressable
      accessibilityRole="button"
      android_ripple={{
        color: variant === 'danger' ? 'rgba(255,255,255,0.18)' : 'rgba(26,26,46,0.08)',
        foreground: true,
      }}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        variant === 'danger' && styles.danger,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && !loading && styles.pressed,
        style,
      ]}
      {...pressableProps}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={contentColor} />
        ) : (
          <>
            {Icon ? <Icon color={contentColor} size={18} strokeWidth={2.8} /> : null}
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
    borderRadius: radius.md,
    borderWidth: colors.comicBorderWidth,
    justifyContent: 'center',
    minHeight: 52,
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
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  label: {
    ...typography.body,
    fontWeight: '900',
  },
  secondary: {
    backgroundColor: colors.paperLavender,
    ...shadows.comicSmall,
  },
  ghost: {
    backgroundColor: colors.paper,
    borderColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  danger: {
    backgroundColor: colors.errorCoral,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.96,
    transform: [{ translateX: colors.comicShadowOffset / 2 }, { translateY: colors.comicShadowOffset / 2 }, { scale: motion.pressScale }],
  },
});
