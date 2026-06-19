import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CheckCircle2, Info, XCircle } from 'lucide-react-native';

import { colors, radius, shadows, spacing, typography } from '../data/theme';

type FeedbackBannerProps = {
  tone: 'success' | 'error' | 'info';
  title: string;
  children?: ReactNode;
};

export function FeedbackBanner({ children, title, tone }: FeedbackBannerProps) {
  const Icon = tone === 'success' ? CheckCircle2 : tone === 'error' ? XCircle : Info;
  const iconColor = colors.comicBorderColor;

  return (
    <View style={[styles.banner, tone === 'success' && styles.success, tone === 'error' && styles.error, tone === 'info' && styles.info]}>
      <View style={styles.iconWrap}>
        <Icon color={iconColor} size={21} strokeWidth={3} />
      </View>
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
    borderColor: colors.comicBorderColor,
    borderRadius: radius.lg,
    borderWidth: colors.comicBorderWidth,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    ...shadows.comicSmall,
  },
  success: { backgroundColor: '#DFFFD7' },
  error: { backgroundColor: '#FFE1E1' },
  info: { backgroundColor: colors.paperLavender },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
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
