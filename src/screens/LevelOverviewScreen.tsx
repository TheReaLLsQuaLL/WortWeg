import { ArrowLeft, BookOpen, Clock, Lock } from 'lucide-react-native';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import type { RouteProp } from '@react-navigation/native';

import { AppScrollView, Screen } from '../components/layout';
import { curriculumLevels, getModulesForLevel } from '../data/curriculum';
import { getPlayableLessonByModuleId } from '../data/lessons';
import { colors, radius, spacing, typography } from '../data/theme';
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

  const openModule = (moduleId: string) => {
    const playableLesson = getPlayableLessonByModuleId(moduleId);

    if (!playableLesson) {
      Alert.alert('Yakında', 'Yakında oynanabilir olacak.');
      return;
    }

    navigation.navigate('LessonIntro', { lessonId: playableLesson.id });
  };

  return (
    <Screen backgroundColor={colors.deepViolet}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft color={colors.white} size={22} />
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
          <Text style={styles.heroMeta}>{level.isPlaceholder ? 'Yakında' : 'Tahmini ' + level.estimatedWeeks + ' hafta'}</Text>
        </View>

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
                  <View style={styles.timePill}>
                    <Clock color={colors.royalPurple} size={14} />
                    <Text style={styles.timeText}>{module.estimatedMinutes} dk</Text>
                  </View>
                </View>
                <Text style={styles.body}>{module.goalTr}</Text>
                {!playableLesson ? <Text style={styles.comingSoon}>Yakında oynanabilir olacak.</Text> : null}
                <Text style={styles.warning}>{module.turkishLearnerWarnings[0]}</Text>
                <View style={styles.taskGrid}>
                  <TaskBlock title="Konuşma" items={module.speakingTasks} />
                  <TaskBlock title="Okuma" items={module.readingTasks} />
                  <TaskBlock title="Yazma" items={module.writingTasks} />
                  <TaskBlock title="Sınav" items={module.examTasks} />
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
  heroCard: { backgroundColor: colors.deepViolet, borderRadius: radius.lg, gap: spacing.sm, padding: spacing.lg },
  heroTitle: { color: colors.yellow, fontSize: 42, fontWeight: '900', letterSpacing: 0, lineHeight: 48 },
  heroText: { ...typography.body, color: colors.lavender },
  heroMeta: { ...typography.small, color: colors.yellow },
  section: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  sectionTitle: { ...typography.body, color: colors.deepViolet, fontWeight: '900' },
  body: { ...typography.body, color: colors.muted },
  muted: { ...typography.small, color: colors.muted },
  warning: { ...typography.small, color: colors.deepViolet, fontWeight: '800' },
  comingSoon: { ...typography.small, color: colors.royalPurple, fontWeight: '900' },
  skillRow: { backgroundColor: colors.surface, borderRadius: radius.md, gap: spacing.xs, padding: spacing.md },
  skillName: { ...typography.small, color: colors.royalPurple, fontWeight: '900' },
  moduleCard: { backgroundColor: colors.surface, borderRadius: radius.md, gap: spacing.md, padding: spacing.md },
  placeholderCard: { opacity: 0.7 },
  moduleHeader: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  moduleIcon: { alignItems: 'center', backgroundColor: colors.lavender, borderRadius: radius.sm, height: 38, justifyContent: 'center', width: 38 },
  moduleCopy: { flex: 1, gap: 2 },
  moduleTitle: { ...typography.body, color: colors.deepViolet, fontWeight: '900' },
  timePill: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs },
  timeText: { ...typography.small, color: colors.royalPurple },
  taskGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  taskBlock: { backgroundColor: colors.white, borderRadius: radius.sm, flexBasis: '47%', flexGrow: 1, gap: spacing.xs, padding: spacing.sm },
  taskTitle: { ...typography.small, color: colors.deepViolet, fontWeight: '900' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tag: { ...typography.small, backgroundColor: colors.lavender, borderRadius: radius.sm, color: colors.deepViolet, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  pressed: { opacity: 0.82 },
});
