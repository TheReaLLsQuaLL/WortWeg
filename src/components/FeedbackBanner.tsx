import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CheckCircle2, Info, XCircle } from 'lucide-react-native';

import { colors, radius, spacing, typography } from '../data/theme';

type FeedbackBannerProps = {
  tone: 'success' | 'error' | 'info';
  title: string;
  children?: ReactNode;
};

export function FeedbackBanner({ children, title, tone }: FeedbackBannerProps) {
  const Icon = tone === 'success' ? CheckCircle2 : tone === 'error' ? XCircle : Info;
  const iconColor = tone === 'success' ? colors.green : tone === 'error' ? colors.red : colors.royalPurple;

  return (
    <View style={[styles.banner, tone === 'success' && styles.success, tone === 'error' && styles.error, tone === 'info' && styles.info]}>
      <Icon color={iconColor} size={20} strokeWidth={2.6} />
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {typeof children === 'string' ? <Text style={styles.body}>{children}</Text> : children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: 'flex-start',
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  success: { backgroundColor: '#DFF7EB' },
  error: { backgroundColor: '#FFE5E5' },
  info: { backgroundColor: colors.lavender },
  copy: { flex: 1, gap: spacing.xs },
  title: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  body: {
    ...typography.small,
    color: colors.deepViolet,
  },
});
