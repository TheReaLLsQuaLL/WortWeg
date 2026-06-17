import { ArrowLeft, CheckCircle2, Lock, MapPinned } from 'lucide-react-native';
import { useEffect } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScrollView, Screen } from '../components/layout';
import { curriculumLevels, getModulesForLevel } from '../data/curriculum';
import { getLessonsForLevel, getPlayableLessonByModuleId } from '../data/lessons';
import { colors, radius, spacing, typography } from '../data/theme';
import type { RootNavigation } from '../navigation/AppNavigator';
import { trackLocalEvent } from '../services/localEventLog';
import type { TrackId } from '../types/curriculum';
import type { UserState } from '../types/userState';

type CurriculumMapScreenProps = {
  navigation: RootNavigation;
  userState: UserState;
};

const trackLabels: Record<TrackId, string> = {
  exam_a1: 'sınav',
  exam_b1: 'sınav',
  daily_life: 'günlük yaşam',
  speaking_confidence: 'konuşma',
  work_german: 'iş',
  travel: 'seyahat',
  family_reunion: 'aile/yaşam',
  university: 'okul',
  fast_track: 'hızlı',
  balanced: 'dengeli',
};

const getCompletedModuleCount = (userState: UserState, levelId: string) =>
  getLessonsForLevel(levelId as Parameters<typeof getLessonsForLevel>[0])
    .filter((lesson) => userState.completedLessons.includes(lesson.id)).length;

const openModule = (navigation: RootNavigation, moduleId: string) => {
  const lesson = getPlayableLessonByModuleId(moduleId);

  if (!lesson) {
    Alert.alert('Yakında', 'Bu modül yakında oynanabilir olacak.');
    return;
  }

  navigation.navigate('LessonIntro', { lessonId: lesson.id });
};

export function CurriculumMapScreen({ navigation, userState }: CurriculumMapScreenProps) {
  const plan = userState.learningPlan;

  useEffect(() => {
    trackLocalEvent({ type: 'curriculum_opened', screen: 'CurriculumMap' });
  }, []);

  return (
    <Screen backgroundColor={colors.deepViolet}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft color={colors.white} size={22} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.kicker}>Seviyeler</Text>
          <Text style={styles.headerTitle}>Yol haritası</Text>
        </View>
      </View>

      <AppScrollView contentContainerStyle={styles.content} style={styles.scroll}>
        {curriculumLevels.map((level) => {
          const modules = getModulesForLevel(level.id);
          const completedCount = getCompletedModuleCount(userState, level.id);
          const activeLevel = plan?.currentLevel === level.id;

          return (
            <View key={level.id} style={[styles.levelSection, activeLevel && styles.activeLevel]}>
              <Pressable onPress={() => navigation.navigate('LevelOverview', { levelId: level.id })} style={({ pressed }) => [styles.levelHeader, pressed && styles.pressed]}>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelBadgeText}>{level.id}</Text>
                </View>
                <View style={styles.levelCopy}>
                  <Text style={styles.levelTitle}>{level.titleTr}</Text>
                  <Text style={styles.muted} numberOfLines={2}>{level.descriptionTr}</Text>
                </View>
                <MapPinned color={activeLevel ? colors.yellow : colors.royalPurple} size={20} />
              </Pressable>

              {modules.slice(0, level.isPlaceholder ? 1 : 4).map((module, index) => {
                const playableLesson = getPlayableLessonByModuleId(module.id);
                const unlocked = Boolean(playableLesson) ? index <= completedCount : false;
                const completed = playableLesson ? userState.completedLessons.includes(playableLesson.id) : false;
                const labels = Object.entries(module.trackBoosts)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([track]) => trackLabels[track as TrackId]);

                return (
                  <Pressable
                    key={module.id}
                    onPress={() => openModule(navigation, module.id)}
                    style={({ pressed }) => [styles.moduleRow, !unlocked && styles.lockedModule, pressed && styles.pressed]}
                  >
                    <View style={styles.moduleIcon}>
                      {completed ? <CheckCircle2 color={colors.green} size={20} /> : unlocked ? <Text style={styles.moduleNumber}>{module.order}</Text> : <Lock color={colors.muted} size={18} />}
                    </View>
                    <View style={styles.moduleCopy}>
                      <Text style={styles.moduleTitle}>{module.titleTr}</Text>
                      <Text style={styles.muted} numberOfLines={2}>{module.goalTr}</Text>
                      <View style={styles.tags}>
                        {labels.map((label) => <Text key={label} style={styles.tag}>{label}</Text>)}
                        <Text style={styles.tag}>{module.estimatedMinutes} dk</Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}

              {!level.isPlaceholder && modules.length > 4 ? (
                <Pressable onPress={() => navigation.navigate('LevelOverview', { levelId: level.id })} style={({ pressed }) => [styles.moreButton, pressed && styles.pressed]}>
                  <Text style={styles.moreText}>Tüm {modules.length} modül</Text>
                </Pressable>
              ) : null}
            </View>
          );
        })}
      </AppScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    backgroundColor: colors.deepViolet,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.sm,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  headerCopy: { flex: 1 },
  kicker: { ...typography.small, color: colors.yellow },
  headerTitle: { ...typography.heading, color: colors.white },
  scroll: { backgroundColor: colors.surface },
  content: { backgroundColor: colors.surface, gap: spacing.lg, padding: spacing.lg },
  levelSection: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  activeLevel: { borderColor: colors.royalPurple },
  levelHeader: { alignItems: 'center', flexDirection: 'row', gap: spacing.md, minHeight: 72 },
  levelBadge: {
    alignItems: 'center',
    backgroundColor: colors.deepViolet,
    borderRadius: radius.md,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  levelBadgeText: { ...typography.body, color: colors.white, fontWeight: '900' },
  levelCopy: { flex: 1, gap: 2 },
  levelTitle: { ...typography.body, color: colors.deepViolet, fontWeight: '900' },
  muted: { ...typography.small, color: colors.muted },
  moduleRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 92,
    padding: spacing.md,
  },
  lockedModule: { opacity: 0.56 },
  moduleIcon: {
    alignItems: 'center',
    backgroundColor: colors.lavender,
    borderRadius: radius.sm,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  moduleNumber: { ...typography.small, color: colors.royalPurple, fontWeight: '900' },
  moduleCopy: { flex: 1, gap: spacing.xs },
  moduleTitle: { ...typography.body, color: colors.deepViolet, fontWeight: '900' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tag: {
    ...typography.small,
    backgroundColor: colors.lavender,
    borderRadius: radius.sm,
    color: colors.deepViolet,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  moreButton: { alignItems: 'center', minHeight: 44, justifyContent: 'center' },
  moreText: { ...typography.small, color: colors.royalPurple, fontWeight: '900' },
  pressed: { opacity: 0.82 },
});
