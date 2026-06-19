import { StyleSheet, Text, View } from 'react-native';

import { articleColors, colors, radius, spacing, typography } from '../data/theme';
import type { Article } from '../types/lesson';

type ArticleBadgeProps = {
  article: Article;
  size?: 'sm' | 'md';
};

export function ArticleBadge({ article, size = 'md' }: ArticleBadgeProps) {
  return (
    <View style={[styles.base, size === 'sm' && styles.small, { backgroundColor: articleColors[article] }]}> 
      <Text style={[styles.text, size === 'sm' && styles.smallText]}>{article}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderColor: colors.comicBorderColor,
    borderRadius: radius.sm,
    borderWidth: colors.comicBorderWidth,
    justifyContent: 'center',
    minHeight: 36,
    minWidth: 54,
    paddingHorizontal: spacing.sm,
    ...{
      elevation: 2,
      shadowColor: colors.comicBorderColor,
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 0,
    },
  },
  small: {
    minHeight: 28,
    minWidth: 42,
  },
  text: {
    ...typography.small,
    color: colors.white,
    fontWeight: '900',
  },
  smallText: {
    ...typography.micro,
    color: colors.white,
  },
});
