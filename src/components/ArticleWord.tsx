import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadows, spacing, typography } from '../data/theme';
import type { Article } from '../types/lesson';
import { ArticleBadge } from './ArticleBadge';

type ArticleWordProps = {
  article?: Article;
  german: string;
  turkish: string;
  example?: string;
};

export function ArticleWord({
  article,
  german,
  turkish,
  example,
}: ArticleWordProps) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        {article ? <ArticleBadge article={article} /> : null}
        <View style={styles.copy}>
          <Text style={styles.german}>{german}</Text>
          <Text style={styles.turkish}>{turkish}</Text>
        </View>
      </View>
      {example ? <Text style={styles.example}>{example}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.lg,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.sm,
    padding: spacing.md,
    ...shadows.comicSmall,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  copy: {
    flex: 1,
  },
  german: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  turkish: {
    ...typography.small,
    color: colors.muted,
  },
  example: {
    ...typography.small,
    backgroundColor: colors.paperLavender,
    borderRadius: radius.md,
    color: colors.deepViolet,
    padding: spacing.sm,
  },
});
