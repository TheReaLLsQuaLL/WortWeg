import { ArrowLeft, BookOpen, Clock, Lock } from 'lucide-react-native';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import type { RouteProp } from '@react-navigation/native';

import { AppScrollView, Screen } from '../components/layout';
import { curriculumLevels, getModulesForLevel } from '../data/curriculum';
import { getB1PreviewLessons, getPlayableLessonByModuleId } from '../data/lessons';
import { colors, radius, shadows, spacing, typography } from '../data/theme';
import type { RootNavigation, RootStackParamList } from '../navigation/AppNavigator';

 type LevelOverviewScreenProps = {
  navigation: RootNavigation;
  route: RouteProp<RootStackParamList, 'LevelOverview'>;
};

const skillLabels = {
  reading: 'Okuma',
  listening: 'Dinleme',
  speaking: 'Konuşma',
  writing: 'Yazma',
  grammar: 'Gramer',
  vocabulary: 'Kelime',
  pronunciation: 'Telaffuz',
};

export function LevelOverviewScreen({ navigation, route }: LevelOverviewScreenProps) {
  const level = curriculumLevels.find((item) => item.id === route.params.levelId) ?? curriculumLevels[1]!;
  const modules = getModulesForLevel(level.id);
  const playableCount = modules.filter((module) => getPlayableLessonByModuleId(module.id)).length;
  const comingSoonCount = Math.max(0, modules.length - playableCount);
  const levelComingSoon = level.isPlaceholder || playableCount === 0;
  const previewLessons = level.id === 'B1' ? getB1PreviewLessons() : [];

  const openModule = (moduleId: string) => {
    const playableLesson = getPlayableLessonByModuleId(moduleId);

    if (!playableLesson) {
      Alert.alert('Yakında', 'Yakında oynanabilir olacak.');
      return;
    }

    navigation.navigate('LessonIntro', { lessonId: playableLesson.id });
  };

  return (
    <Screen backgroundColor={colors.lavenderBackground}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft color={colors.deepViolet} size={22} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.kicker}>{level.titleDe}</Text>
          <Text style={styles.headerTitle}>{level.titleTr}</Text>
        </View>
      </View>

      <AppScrollView contentContainerStyle={styles.content} style={styles.scroll}>
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>{level.id}</Text>
          <Text style={styles.heroText}>{level.descriptionTr}</Text>
          <View style={styles.heroStats}>
            <Text style={styles.heroMeta}>{levelComingSoon ? 'Yakında' : 'Tahmini ' + level.estimatedWeeks + ' hafta'}</Text>
            <Text style={styles.heroMeta}>{playableCount} oynanabilir</Text>
            {previewLessons.length > 0 ? <Text style={styles.heroMeta}>Ön izleme var</Text> : null}
            {comingSoonCount > 0 ? <Text style={styles.heroMetaMuted}>{comingSoonCount} yakında</Text> : null}
          </View>
        </View>

        {previewLessons.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>B1 Ön İzleme</Text>
            <Text style={styles.body}>Bu kısa ön izleme. Tam B1 yolu yakında.</Text>
            {previewLessons.map((lesson) => (
              <Pressable
                key={lesson.id}
                onPress={() => navigation.navigate('LessonIntro', { lessonId: lesson.id })}
                style={({ pressed }) => [styles.previewCard, pressed && styles.pressed]}
              >
                <View style={styles.moduleIcon}>
                  <BookOpen color={colors.royalPurple} size={18} />
                </View>
                <View style={styles.moduleCopy}>
                  <Text style={styles.moduleTitle}>{lesson.title}</Text>
                  <Text style={styles.muted}>{lesson.estimatedMinutes} dk · {lesson.baseExercises.length} alıştırma</Text>
                </View>
                <View style={styles.statusPill}>
                  <Text style={styles.statusText}>Ön izleme</Text>
                </View>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hedefler</Text>
          {level.canDoTr.map((item) => <Text key={item} style={styles.body}>• {item}</Text>)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detay</Text>
          {Object.entries(level.skillGoals).map(([skill, goal]) => (
            <View key={skill} style={styles.skillRow}>
              <Text style={styles.skillName}>{skillLabels[skill as keyof typeof skillLabels]}</Text>
              <Text style={styles.muted}>{goal}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Modüller</Text>
          {modules.map((module) => {
            const playableLesson = getPlayableLessonByModuleId(module.id);
            const moduleStatus = playableLesson ? 'Oynanabilir' : 'Yakında';

            return (
              <Pressable
                key={module.id}
                onPress={() => openModule(module.id)}
                style={({ pressed }) => [
                  styles.moduleCard,
                  !playableLesson && styles.placeholderCard,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.moduleHeader}>
                  <View style={styles.moduleIcon}>
                    {!playableLesson ? <Lock color={colors.muted} size={18} /> : <BookOpen color={colors.royalPurple} size={18} />}
                  </View>
                  <View style={styles.moduleCopy}>
                    <Text style={styles.moduleTitle}>{module.order}. {module.titleTr}</Text>
                    <Text style={styles.muted}>{module.titleDe}</Text>
                  </View>
                  <View style={[styles.statusPill, !playableLesson && styles.statusPillLocked]}>
                    <Text style={[styles.statusText, !playableLesson && styles.statusTextLocked]}>{moduleStatus}</Text>
                  </View>
                  <View style={styles.timePill}>
                    <Clock color={colors.royalPurple} size={14} />
                    <Text style={styles.timeText}>{module.estimatedMinutes} dk</Text>
                  </View>
                </View>
                <Text style={styles.body}>{module.goalTr}</Text>
                <View style={styles.warningStrip}>
                  <Text style={styles.warning}>{!playableLesson ? 'Bu modül yakında oynanabilir olacak.' : module.turkishLearnerWarnings[0]}</Text>
                </View>
                <View style={styles.taskGrid}>
                  <TaskBlock title="Konuşma" items={module.speakingTasks} />
                  <TaskBlock title="Yazma" items={module.writingTasks} />
                </View>
                <View style={styles.tags}>
                  {module.topics.slice(0, 5).map((topic) => <Text key={topic} style={styles.tag}>{topic}</Text>)}
                </View>
              </Pressable>
            );
          })}
        </View>
      </AppScrollView>
    </Screen>
  );
}

function TaskBlock({ items, title }: { items: string[]; title: string }) {
  return (
    <View style={styles.taskBlock}>
      <Text style={styles.taskTitle}>{title}</Text>
      <Text style={styles.muted} numberOfLines={3}>{items[0]}</Text>
    </View>
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
  heroCard: {
    backgroundColor: colors.deepViolet,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.md,
    padding: spacing.lg,
    ...shadows.comic,
  },
  heroTitle: { color: colors.yellow, fontSize: 42, fontWeight: '900', letterSpacing: 0, lineHeight: 48 },
  heroText: { ...typography.body, color: colors.lavender },
  heroStats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  heroMeta: {
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
  heroMetaMuted: {
    ...typography.small,
    backgroundColor: colors.paperLavender,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.pill,
    borderWidth: colors.comicBorderWidth,
    color: colors.deepViolet,
    fontWeight: '900',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  section: {
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.md,
    padding: spacing.lg,
    ...shadows.comicSmall,
  },
  sectionTitle: { ...typography.body, color: colors.deepViolet, fontWeight: '900' },
  body: { ...typography.body, color: colors.muted },
  muted: { ...typography.small, color: colors.muted },
  warning: { ...typography.small, color: colors.deepViolet, fontWeight: '800' },
  skillRow: { backgroundColor: colors.paperLavender, borderRadius: radius.md, gap: spacing.xs, padding: spacing.md },
  skillName: { ...typography.small, color: colors.royalPurple, fontWeight: '900' },
  moduleCard: {
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.md,
    padding: spacing.md,
    ...shadows.comicSmall,
  },
  previewCard: {
    alignItems: 'center',
    backgroundColor: colors.comicYellowWash,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    padding: spacing.md,
    ...shadows.comicSmall,
  },
  placeholderCard: { backgroundColor: colors.paperLavender, opacity: 0.82, ...shadows.none },
  moduleHeader: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  moduleIcon: {
    alignItems: 'center',
    backgroundColor: colors.comicYellowWash,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.lg,
    borderWidth: colors.comicBorderWidth,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  moduleCopy: { flex: 1, gap: 2 },
  moduleTitle: { ...typography.body, color: colors.deepViolet, fontWeight: '900' },
  statusPill: {
    backgroundColor: colors.comicYellowWash,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.pill,
    borderWidth: colors.comicBorderWidth,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  statusPillLocked: {
    backgroundColor: colors.white,
    borderColor: colors.border,
  },
  statusText: { ...typography.small, color: colors.deepViolet, fontWeight: '900' },
  statusTextLocked: { color: colors.muted },
  timePill: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs },
  timeText: { ...typography.small, color: colors.royalPurple },
  warningStrip: {
    backgroundColor: colors.paperLavender,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  taskGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  taskBlock: { backgroundColor: colors.paperLavender, borderRadius: radius.md, flexBasis: '47%', flexGrow: 1, gap: spacing.xs, padding: spacing.sm },
  taskTitle: { ...typography.small, color: colors.deepViolet, fontWeight: '900' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tag: { ...typography.small, backgroundColor: colors.lavender, borderRadius: radius.sm, color: colors.deepViolet, fontWeight: '800', paddingHorizontal: spacing.sm, paddingVertical: 2 },
  pressed: { opacity: 0.82 },
});
