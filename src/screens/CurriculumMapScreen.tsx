import { ArrowLeft, CheckCircle2, Lock, MapPinned } from 'lucide-react-native';
import { useEffect } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScrollView, Screen } from '../components/layout';
import { curriculumLevels, getModulesForLevel } from '../data/curriculum';
import { getLessonsForLevel, getPlayableLessonByModuleId } from '../data/lessons';
import { colors, radius, shadows, spacing, typography } from '../data/theme';
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
    <Screen backgroundColor={colors.lavenderBackground}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft color={colors.deepViolet} size={22} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.kicker}>Seviyeler</Text>
          <Text style={styles.headerTitle}>Yol haritası</Text>
        </View>
      </View>

      <AppScrollView contentContainerStyle={styles.content} style={styles.scroll}>
        {curriculumLevels.map((level) => {
          const modules = getModulesForLevel(level.id);
          const activeLevel = plan?.currentLevel === level.id;
          const previewModuleCount = level.id === 'A2' ? Math.max(4, getLessonsForLevel(level.id).length) : 4;
          const playableModules = modules
            .map((module) => getPlayableLessonByModuleId(module.id))
            .filter(Boolean);
          const completedPlayableCount = playableModules.filter((lesson) => userState.completedLessons.includes(lesson!.id)).length;
          const levelProgress = playableModules.length
            ? Math.round((completedPlayableCount / playableModules.length) * 100)
            : 0;
          const progressWidth = ((playableModules.length ? Math.max(4, levelProgress) : 0) + '%') as `${number}%`;
          const levelStatus = level.isPlaceholder
            ? 'Yakında'
            : playableModules.length
              ? playableModules.length + ' oynanabilir ders'
              : 'Yakında';

          return (
            <View key={level.id} style={[styles.levelSection, activeLevel && styles.activeLevel]}>
              <Pressable onPress={() => navigation.navigate('LevelOverview', { levelId: level.id })} style={({ pressed }) => [styles.levelHeader, pressed && styles.pressed]}>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelBadgeText}>{level.id}</Text>
                </View>
                <View style={styles.levelCopy}>
                  <View style={styles.levelTitleRow}>
                    <Text style={styles.levelTitle}>{level.titleTr}</Text>
                    <Text style={[styles.levelStatusBadge, level.isPlaceholder && styles.levelStatusLocked]}>{levelStatus}</Text>
                  </View>
                  <Text style={styles.muted} numberOfLines={2}>{level.descriptionTr}</Text>
                  <View style={styles.levelProgressTrack}>
                    <View style={[styles.levelProgressFill, { width: progressWidth }]} />
                  </View>
                </View>
                <MapPinned color={activeLevel ? colors.yellow : colors.royalPurple} size={20} />
              </Pressable>

              {modules.slice(0, level.isPlaceholder ? 1 : previewModuleCount).map((module, index) => {
                const playableLesson = getPlayableLessonByModuleId(module.id);
                const previousPlayableLesson = modules
                  .slice(0, index)
                  .map((item) => getPlayableLessonByModuleId(item.id))
                  .filter((item): item is NonNullable<typeof playableLesson> => Boolean(item))
                  .at(-1);
                const completed = playableLesson ? userState.completedLessons.includes(playableLesson.id) : false;
                const previousCompleted = previousPlayableLesson
                  ? userState.completedLessons.includes(previousPlayableLesson.id)
                  : true;
                const unlocked = Boolean(playableLesson) ? index === 0 || completed || previousCompleted : false;
                const labels = Object.entries(module.trackBoosts)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 2)
                  .map(([track]) => trackLabels[track as TrackId]);
                const moduleStatus = !playableLesson
                  ? 'Yakında'
                  : completed
                    ? 'Tamamlandı'
                    : unlocked
                      ? 'Oynanabilir'
                      : 'Kilitli';

                return (
                  <Pressable
                    key={module.id}
                    onPress={() => {
                      if (!unlocked) {
                        Alert.alert('Kilitli', playableLesson ? 'Önce önceki dersi bitir.' : 'Bu modül yakında oynanabilir olacak.');
                        return;
                      }

                      openModule(navigation, module.id);
                    }}
                    style={({ pressed }) => [styles.moduleRow, !unlocked && styles.lockedModule, pressed && styles.pressed]}
                  >
                    <View style={styles.moduleIcon}>
                      {completed ? <CheckCircle2 color={colors.green} size={20} /> : unlocked ? <Text style={styles.moduleNumber}>{module.order}</Text> : <Lock color={colors.muted} size={18} />}
                    </View>
                    <View style={styles.moduleCopy}>
                      <View style={styles.moduleTitleRow}>
                        <Text style={styles.moduleTitle}>{module.titleTr}</Text>
                        <Text style={[styles.moduleStatus, !unlocked && styles.moduleStatusLocked]}>{moduleStatus}</Text>
                      </View>
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
    backgroundColor: colors.paper,
    borderBottomColor: colors.comicBorderColor,
    borderBottomWidth: colors.comicBorderWidth,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.md,
    borderWidth: colors.comicBorderWidth,
    height: 46,
    justifyContent: 'center',
    width: 46,
    ...shadows.comicSmall,
  },
  headerCopy: { flex: 1 },
  kicker: { ...typography.small, color: colors.royalPurple, fontWeight: '900' },
  headerTitle: { ...typography.heading, color: colors.deepViolet, fontWeight: '900' },
  scroll: { backgroundColor: colors.lavenderBackground },
  content: { backgroundColor: colors.lavenderBackground, gap: spacing.lg, padding: spacing.lg },
  levelSection: {
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.md,
    padding: spacing.lg,
    ...shadows.comic,
  },
  activeLevel: { backgroundColor: colors.comicYellowWash, borderColor: colors.comicBorderColor },
  levelHeader: { alignItems: 'center', flexDirection: 'row', gap: spacing.md, minHeight: 78 },
  levelBadge: {
    alignItems: 'center',
    backgroundColor: colors.yellowCta,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    height: 60,
    justifyContent: 'center',
    width: 60,
    ...shadows.comic,
  },
  levelBadgeText: { ...typography.body, color: colors.comicBorderColor, fontWeight: '900' },
  levelCopy: { flex: 1, gap: 2 },
  levelTitleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'space-between',
  },
  levelTitle: { ...typography.heading, color: colors.deepViolet, fontWeight: '900' },
  levelStatusBadge: {
    ...typography.small,
    backgroundColor: colors.yellowCta,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.pill,
    borderWidth: colors.comicBorderWidth,
    color: colors.deepViolet,
    fontWeight: '900',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  levelStatusLocked: {
    backgroundColor: colors.paperLavender,
    color: colors.muted,
  },
  levelProgressTrack: {
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.pill,
    borderWidth: colors.comicBorderWidth,
    height: 12,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  levelProgressFill: {
    backgroundColor: colors.yellowCta,
    height: '100%',
  },
  muted: { ...typography.small, color: colors.muted },
  moduleRow: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 92,
    padding: spacing.md,
    ...shadows.comicSmall,
  },
  lockedModule: { backgroundColor: colors.paperLavender, opacity: 0.72 },
  moduleIcon: {
    alignItems: 'center',
    backgroundColor: colors.primaryPurple,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.lg,
    borderWidth: colors.comicBorderWidth,
    height: 48,
    justifyContent: 'center',
    width: 48,
    ...shadows.comicSmall,
  },
  moduleNumber: { ...typography.small, color: colors.white, fontWeight: '900' },
  moduleCopy: { flex: 1, gap: spacing.xs },
  moduleTitleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'space-between',
  },
  moduleTitle: { ...typography.body, color: colors.deepViolet, fontWeight: '900' },
  moduleStatus: {
    ...typography.small,
    backgroundColor: colors.comicYellowWash,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.pill,
    borderWidth: 2,
    color: colors.deepViolet,
    fontWeight: '900',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  moduleStatusLocked: {
    backgroundColor: colors.paperLavender,
    color: colors.muted,
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tag: {
    ...typography.small,
    backgroundColor: colors.yellowCta,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.pill,
    borderWidth: 2,
    color: colors.deepViolet,
    fontWeight: '900',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  moreButton: { alignItems: 'center', minHeight: 44, justifyContent: 'center' },
  moreText: { ...typography.small, color: colors.royalPurple, fontWeight: '900' },
  pressed: { opacity: 0.82 },
});
