import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../data/theme';
import { ComicSpeechBubble } from './ComicSpeechBubble';
import { Mascot } from './Mascot';

type WolliBubbleProps = {
  children?: ReactNode;
  text?: string;
};

export function WolliBubble({ children, text }: WolliBubbleProps) {
  return (
    <View style={styles.wrap}>
      <Mascot size={54} />
      <ComicSpeechBubble text={text} tone="paper">
        {children}
      </ComicSpeechBubble>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
});
