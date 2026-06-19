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
          <Icon color={colors.royalPurple} size={24} strokeWidth={2.6} />
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
    backgroundColor: colors.paper,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.sm,
    padding: spacing.lg,
    ...shadows.comic,
  },
  unframed: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: colors.softLavenderPanel,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.md,
    borderWidth: colors.comicBorderWidth,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  title: {
    ...typography.heading,
    color: colors.deepViolet,
  },
  body: {
    ...typography.body,
    color: colors.muted,
  },
});
