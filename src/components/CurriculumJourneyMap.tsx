import { useEffect, useMemo, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Check, Lock } from 'lucide-react-native';
import { colors, radius, shadows, spacing, typography } from '../data/theme';
import { OwlyMascot } from './OwlyMascot';
import type { Lesson } from '../types/lesson';
import { HalftoneAccent } from './HalftoneAccent';

type LessonNodeProps = {
  id: string;
  title: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  onPress?: () => void;
};

const CEFR_TITLES: Record<string, string> = {
  'A0': 'Einstieg',
  'A1': 'Grundlagen',
  'A2': 'Alltag',
  'B1': 'Konversation',
  'B2': 'Flüssiges Deutsch',
  'C1': 'Professionelles Deutsch',
  'C2': 'Meisterschaft',
};

function JourneyNode({ id, title, isCompleted, isCurrent, isLocked, onPress }: LessonNodeProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isCurrent) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isCurrent, pulseAnim]);

  const nodeColor = isCompleted ? colors.cyanAccent : isCurrent ? colors.yellowCta : colors.midnightAccent;
  const textColor = isCompleted || isCurrent ? colors.white : colors.muted;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isLocked}
      onPress={onPress}
      style={({ pressed }) => [
        styles.nodeContainer,
        pressed && !isLocked && { opacity: 0.8 }
      ]}
    >
      <View style={styles.nodeLeft}>
        <Animated.View
          style={[
            styles.nodeCircle,
            {
              backgroundColor: isCompleted ? colors.cyanAccent : colors.midnightSurface,
              borderColor: nodeColor,
              transform: [{ scale: pulseAnim }]
            },
            isCurrent && styles.nodeCurrentShadow,
            isCompleted && styles.nodeCompletedShadow,
          ]}
        >
          {isCompleted ? (
            <Check color={colors.midnightBackground} size={16} strokeWidth={3} />
          ) : isLocked ? (
            <Lock color={colors.muted} size={14} />
          ) : isCurrent ? (
            <View style={styles.nodeCurrentInner} />
          ) : null}
        </Animated.View>
        <View style={[styles.nodeLine, { backgroundColor: isCompleted ? colors.cyanAccent : colors.midnightAccent }]} />
      </View>
      <View style={styles.nodeContent}>
        <Text style={[styles.nodeTitle, { color: textColor }]}>{title}</Text>
      </View>
    </Pressable>
  );
}

type CurriculumJourneyMapProps = {
  lessonPath: (Lesson & { cefr: string })[];
  completedLessonIds: string[];
  nextLessonId?: string;
  onPressLesson: (lessonId: string) => void;
};

export function CurriculumJourneyMap({ lessonPath, completedLessonIds, nextLessonId, onPressLesson }: CurriculumJourneyMapProps) {
  
  const groupedLevels = useMemo(() => {
    const groups: { cefr: string; title: string; lessons: (Lesson & { cefr: string })[] }[] = [];
    lessonPath.forEach((lesson) => {
      let group = groups.find(g => g.cefr === lesson.cefr);
      if (!group) {
        group = { cefr: lesson.cefr, title: CEFR_TITLES[lesson.cefr] || 'Weiter', lessons: [] };
        groups.push(group);
      }
      group.lessons.push(lesson);
    });
    return groups;
  }, [lessonPath]);

  const completedCount = completedLessonIds.length;
  const totalCount = lessonPath.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <View style={styles.container}>
      <HalftoneAccent color={colors.cyanAccent} opacity={0.05} size="large" style={styles.mapTexture} />
      <View style={styles.header}>
        <View>
          <Text style={styles.journeyTitle}>German Journey</Text>
          <Text style={styles.journeyMeta}>%{progressPercent} complete · {completedCount}/{totalCount} lessons</Text>
        </View>
      </View>

      <View style={styles.mapContainer}>
        {groupedLevels.map((group, groupIndex) => (
          <View key={group.cefr} style={styles.levelGroup}>
            <View style={styles.levelHeader}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>{group.cefr}</Text>
              </View>
              <Text style={styles.levelTitle}>{group.title}</Text>
            </View>

            <View style={styles.lessonList}>
              {group.lessons.map((lesson, index) => {
                const isCompleted = completedLessonIds.includes(lesson.id);
                const isCurrent = lesson.id === nextLessonId;
                const isLocked = !isCompleted && !isCurrent;
                
                // Hide the line on the last lesson of the last group
                const isLastInGroup = index === group.lessons.length - 1;
                const isLastGroup = groupIndex === groupedLevels.length - 1;
                const isAbsoluteLast = isLastInGroup && isLastGroup;

                return (
                  <View key={lesson.id} style={styles.lessonRow}>
                    <View style={styles.nodeContainerWrapper}>
                       <JourneyNode
                        id={lesson.id}
                        title={lesson.title}
                        isCompleted={isCompleted}
                        isCurrent={isCurrent}
                        isLocked={isLocked}
                        onPress={() => {
                          if (!isLocked) onPressLesson(lesson.id);
                        }}
                      />
                      {isAbsoluteLast && <View style={styles.hideLastLine} />}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.midnightSurface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    overflow: 'hidden',
    position: 'relative',
    borderColor: colors.midnightAccent,
    borderWidth: colors.comicBorderWidth,
  },
  mapTexture: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 220,
    height: 180,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  journeyTitle: {
    ...typography.heading,
    color: colors.white,
  },
  journeyMeta: {
    ...typography.small,
    color: colors.cyanAccent,
    fontWeight: '800',
  },
  mapContainer: {
    paddingLeft: spacing.sm,
  },
  levelGroup: {
    marginBottom: spacing.xl,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  levelBadge: {
    backgroundColor: colors.cyanAccent,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  levelBadgeText: {
    ...typography.small,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  levelTitle: {
    ...typography.body,
    color: colors.white,
    fontWeight: '800',
  },
  lessonList: {
    marginLeft: 12,
  },
  lessonRow: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  nodeContainerWrapper: {
    position: 'relative',
  },
  nodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nodeLeft: {
    alignItems: 'center',
    width: 32,
    marginRight: spacing.md,
  },
  nodeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.midnightSurface,
    zIndex: 2,
  },
  nodeCurrentInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.yellowCta,
  },
  nodeLine: {
    position: 'absolute',
    top: 32,
    width: 3,
    height: 60, // Arbitrary line length
    backgroundColor: colors.midnightAccent,
    zIndex: 1,
  },
  hideLastLine: {
    position: 'absolute',
    top: 32,
    left: 14,
    width: 4,
    height: 60,
    backgroundColor: colors.midnightSurface,
    zIndex: 1,
  },
  nodeContent: {
    flex: 1,
  },
  nodeTitle: {
    ...typography.body,
    fontWeight: '700',
  },
  nodeCurrentShadow: {
    shadowColor: colors.yellowCta,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 4,
  },
  nodeCompletedShadow: {
    shadowColor: colors.cyanAccent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 3,
  },
});
