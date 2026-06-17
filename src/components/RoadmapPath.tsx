import { CheckCircle2, Lock, PlayCircle } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../data/theme';

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
      {items.map((item, index) => {
        const disabled = item.locked || item.comingSoon || !item.onPress;
        const Icon = item.completed ? CheckCircle2 : item.locked || item.comingSoon ? Lock : PlayCircle;
        const iconColor = item.completed
          ? colors.green
          : item.current
            ? colors.royalPurple
            : colors.muted;

        return (
          <Pressable
            accessibilityRole="button"
            disabled={disabled}
            key={item.id}
            onPress={item.onPress}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <View style={styles.railWrap}>
              {index > 0 ? <View style={styles.railTop} /> : <View style={styles.railSpacer} />}
              <View style={[styles.node, item.current && styles.nodeCurrent, item.completed && styles.nodeDone]}>
                <Icon color={iconColor} size={18} strokeWidth={2.6} />
              </View>
              {index < items.length - 1 ? <View style={styles.railBottom} /> : <View style={styles.railSpacer} />}
            </View>
            <View style={[styles.card, item.current && styles.cardCurrent, disabled && styles.cardLocked]}>
              <Text style={[styles.title, item.current && styles.titleCurrent]} numberOfLines={1}>{item.title}</Text>
              {item.meta ? <Text style={styles.meta} numberOfLines={1}>{item.meta}</Text> : null}
              {item.comingSoon ? <Text style={styles.badge}>Yakında</Text> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    minHeight: 72,
  },
  railWrap: {
    alignItems: 'center',
    width: 36,
  },
  railTop: {
    backgroundColor: colors.border,
    flex: 1,
    width: 2,
  },
  railBottom: {
    backgroundColor: colors.border,
    flex: 1,
    width: 2,
  },
  railSpacer: {
    flex: 1,
    width: 2,
  },
  node: {
    alignItems: 'center',
    backgroundColor: colors.surfaceStrong,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  nodeCurrent: {
    backgroundColor: colors.lavender,
    borderColor: colors.royalPurple,
  },
  nodeDone: {
    backgroundColor: '#DFF7EB',
    borderColor: '#B7EBCF',
  },
  card: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    gap: 2,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  cardCurrent: {
    backgroundColor: colors.lavender,
    borderColor: colors.royalPurple,
  },
  cardLocked: {
    opacity: 0.62,
  },
  title: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  titleCurrent: {
    color: colors.royalPurple,
  },
  meta: {
    ...typography.small,
    color: colors.muted,
  },
  badge: {
    ...typography.small,
    color: colors.royalPurple,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.82,
  },
});
