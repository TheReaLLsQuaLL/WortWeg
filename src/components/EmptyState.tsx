import type { ComponentType } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadows, spacing, typography } from '../data/theme';
import { AppButton } from './AppButton';

type IconProps = { color?: string; size?: number; strokeWidth?: number };

type EmptyStateProps = {
  title: string;
  body: string;
  actionTitle?: string;
  icon?: ComponentType<IconProps>;
  framed?: boolean;
  onActionPress?: () => void;
};

export function EmptyState({ actionTitle, body, framed = true, icon: Icon, onActionPress, title }: EmptyStateProps) {
  return (
    <View style={[styles.card, !framed && styles.unframed]}>
      {Icon ? (
        <View style={styles.iconWrap}>
          <Icon color={colors.comicBorderColor} size={28} strokeWidth={3} />
        </View>
      ) : null}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      {actionTitle && onActionPress ? <AppButton onPress={onActionPress} title={actionTitle} variant="secondary" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.md,
    padding: spacing.xl,
    ...shadows.comic,
  },
  unframed: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: colors.yellowCta,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.lg,
    borderWidth: colors.comicBorderWidth,
    height: 58,
    justifyContent: 'center',
    width: 58,
    ...shadows.comicSmall,
  },
  title: {
    ...typography.heading,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  body: {
    ...typography.body,
    color: colors.muted,
  },
});
