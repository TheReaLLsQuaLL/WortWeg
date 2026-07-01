import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, shadows, spacing } from '../data/theme';
import { ComicSpeechBubble } from './ComicSpeechBubble';
import { OwlyMascot } from './OwlyMascot';

type WolliBubbleProps = {
  children?: ReactNode;
  text?: string;
};

export function WolliBubble({ children, text }: WolliBubbleProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.avatar}>
        <OwlyMascot state="talking" width={56} height={56} />
      </View>
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
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.yellowCta,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    height: 66,
    justifyContent: 'center',
    width: 66,
    ...shadows.comicSmall,
  },
});
