import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadows, spacing, typography } from '../data/theme';
import { AnimatedCard } from './AnimatedCard';
import { HalftoneAccent } from './HalftoneAccent';
import { RoadmapNode } from './RoadmapNode';

export type RoadmapPathItem = {
  id: string;
  title: string;
  meta?: string;
  completed?: boolean;
  current?: boolean;
  locked?: boolean;
  comingSoon?: boolean;
  onPress?: () => void;
};

type RoadmapPathProps = {
  items: RoadmapPathItem[];
};

export function RoadmapPath({ items }: RoadmapPathProps) {
  return (
    <View style={styles.container}>
      <HalftoneAccent opacity={0.05} size="small" style={styles.mapTexture} />
      <View style={styles.pathRail} />
      {items.map((item, index) => {
        const disabled = item.locked || item.comingSoon || !item.onPress;
        const leftSide = index % 2 === 0;
        return (
          <AnimatedCard key={item.id} delayMs={index * 45}>
            <Pressable
              accessibilityRole="button"
              disabled={disabled}
              onPress={item.onPress}
              style={({ pressed }) => [styles.stop, pressed && styles.pressed]}
            >
              <View style={styles.nodeSlot}>
                <RoadmapNode completed={item.completed} current={item.current} locked={item.locked || item.comingSoon} />
              </View>
              <View
                style={[
                  styles.card,
                  leftSide ? styles.cardLeft : styles.cardRight,
                  item.current && styles.cardCurrent,
                  item.completed && styles.cardDone,
                  disabled && styles.cardLocked,
                ]}
              >
                {item.current ? <HalftoneAccent opacity={0.09} size="small" style={styles.cardTexture} /> : null}
                {item.current ? <Text style={styles.currentBadge}>Şimdi</Text> : null}
                <Text style={[styles.title, item.current && styles.titleCurrent]} numberOfLines={1}>{item.title}</Text>
                {item.meta ? <Text style={styles.meta} numberOfLines={1}>{item.meta}</Text> : null}
                {item.comingSoon ? <Text style={styles.badge}>Yakında</Text> : null}
              </View>
            </Pressable>
          </AnimatedCard>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 420,
    overflow: 'hidden',
    paddingVertical: spacing.lg,
    position: 'relative',
  },
  mapTexture: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  pathRail: {
    backgroundColor: colors.yellowCta,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.pill,
    borderWidth: colors.comicBorderWidth,
    bottom: spacing.xl,
    left: '50%',
    marginLeft: -4,
    position: 'absolute',
    top: spacing.xl,
    width: 8,
  },
  stop: {
    minHeight: 118,
    position: 'relative',
    justifyContent: 'center',
  },
  nodeSlot: {
    alignItems: 'center',
    left: '50%',
    marginLeft: -38,
    position: 'absolute',
    top: 22,
    width: 76,
    zIndex: 3,
  },
  card: {
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.lg,
    borderWidth: colors.comicBorderWidth,
    gap: 2,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    width: '56%',
    ...shadows.comicSmall,
  },
  cardLeft: {
    alignSelf: 'flex-start',
    marginRight: 90,
    transform: [{ rotate: '-1deg' }],
  },
  cardRight: {
    alignSelf: 'flex-end',
    marginLeft: 90,
    transform: [{ rotate: '1deg' }],
  },
  cardCurrent: {
    backgroundColor: colors.yellowCta,
    minHeight: 78,
    ...shadows.comic,
  },
  cardDone: {
    backgroundColor: '#EAFFE8',
  },
  cardLocked: {
    backgroundColor: colors.paperLavender,
    opacity: 0.7,
    ...shadows.none,
  },
  currentBadge: {
    ...typography.micro,
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryPurple,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.sm,
    borderWidth: colors.comicBorderWidth,
    color: colors.white,
    fontWeight: '900',
    marginBottom: 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  title: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  titleCurrent: {
    color: colors.comicBorderColor,
  },
  meta: {
    ...typography.small,
    color: colors.muted,
    fontWeight: '800',
  },
  badge: {
    ...typography.small,
    color: colors.royalPurple,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.82,
  },
  cardTexture: {
    bottom: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    width: 96,
  },
});
