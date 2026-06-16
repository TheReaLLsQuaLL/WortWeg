import { StyleSheet, Text, View } from 'react-native';

import { articleColors, colors, radius, spacing, typography } from '../data/theme';
import type { Article } from '../types/lesson';

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
        {article ? (
          <View
            style={[
              styles.article,
              { backgroundColor: articleColors[article] },
            ]}
          >
            <Text style={styles.articleText}>{article}</Text>
          </View>
        ) : null}
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
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  article: {
    alignItems: 'center',
    borderRadius: radius.sm,
    height: 34,
    justifyContent: 'center',
    minWidth: 48,
    paddingHorizontal: spacing.sm,
  },
  articleText: {
    ...typography.small,
    color: colors.white,
    fontWeight: '900',
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
    color: colors.deepViolet,
  },
});
