import { ArrowLeft, Play } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RouteProp } from '@react-navigation/native';

import { AppButton } from '../components/AppButton';
import { useDetailFooterSpacing } from '../components/layout';
import { ArticleWord } from '../components/ArticleWord';
import { SpeakerButton } from '../components/SpeakerButton';
import { ARTICLE_HINTS, ARTICLES } from '../data/constants';
import { getLessonById } from '../data/lessons.a1';
import {
  articleColors,
  articleLightColors,
  colors,
  radius,
  spacing,
  typography,
} from '../data/theme';
import type {
  RootNavigation,
  RootStackParamList,
} from '../navigation/AppNavigator';

type LessonIntroScreenProps = {
  navigation: RootNavigation;
  route: RouteProp<RootStackParamList, 'LessonIntro'>;
};

export function LessonIntroScreen({ navigation, route }: LessonIntroScreenProps) {
  const lesson = getLessonById(route.params.lessonId);
  const { contentPaddingBottom, footerPaddingBottom } = useDetailFooterSpacing();

  if (!lesson) {
    return (
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.title}>Ders bulunamadı</Text>
          <AppButton
            onPress={() => navigation.goBack()}
            title="Geri dön"
            variant="secondary"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={styles.iconButton}
        >
          <ArrowLeft color={colors.white} size={22} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.kicker}>Ünite {lesson.unit} · {lesson.cefr}</Text>
          <Text style={styles.headerTitle}>{lesson.title}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: contentPaddingBottom }]}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.intro}>
          <Text style={styles.title}>{lesson.subtitle}</Text>
          <Text style={styles.body}>{lesson.descriptionTr}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hedefler</Text>
          {lesson.objectives.map((objective) => (
            <Text key={objective} style={styles.bullet}>
              • {objective}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kısa gramer</Text>
          {lesson.grammar.map((note) => (
            <View key={note.title} style={styles.note}>
              <Text style={styles.noteTitle}>{note.title}</Text>
              <Text style={styles.body}>{note.bodyTr}</Text>
              {note.examples.map((example) => (
                <View key={example.german} style={styles.exampleRow}>
                  <Text style={styles.exampleGerman}>{example.german}</Text>
                  <Text style={styles.exampleTurkish}>{example.turkish}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {lesson.dialog ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mini diyalog</Text>
            {lesson.dialog.map((line) => (
              <View key={`${line.speaker}-${line.line}`} style={styles.dialogLine}>
                <View style={styles.dialogText}>
                  <Text style={styles.noteTitle}>{line.speaker}</Text>
                  <Text style={styles.exampleGerman}>{line.line}</Text>
                  <Text style={styles.exampleTurkish}>{line.translationTr}</Text>
                </View>
                <SpeakerButton text={line.line} />
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kelime kartları</Text>
          {lesson.vocabulary.some((word) => word.article) ? (
            <View style={styles.articleLegend}>
              {ARTICLES.map((article) => (
                <View
                  key={article}
                  style={[
                    styles.articleLegendItem,
                    { backgroundColor: articleLightColors[article] },
                  ]}
                >
                  <Text
                    style={[
                      styles.articleLegendArticle,
                      { color: articleColors[article] },
                    ]}
                  >
                    {article}
                  </Text>
                  <Text style={styles.articleLegendText}>
                    {ARTICLE_HINTS[article]}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
          {lesson.vocabulary.map((word) => (
            <ArticleWord
              article={word.article}
              example={word.example}
              german={word.german}
              key={word.id}
              turkish={word.turkish}
            />
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: footerPaddingBottom }]}>
        <AppButton
          icon={Play}
          onPress={() =>
            navigation.navigate('ExercisePlayer', { lessonId: lesson.id })
          }
          title="Alıştırmaya başla"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.deepViolet,
    flex: 1,
  },
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
  headerCopy: {
    flex: 1,
  },
  kicker: {
    ...typography.small,
    color: colors.yellow,
  },
  headerTitle: {
    ...typography.heading,
    color: colors.white,
  },
  content: {
    backgroundColor: colors.surface,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  intro: {
    gap: spacing.sm,
  },
  title: {
    ...typography.heading,
    color: colors.deepViolet,
  },
  body: {
    ...typography.body,
    color: colors.muted,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  articleLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  articleLegendItem: {
    alignItems: 'center',
    borderRadius: radius.sm,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  articleLegendArticle: {
    ...typography.small,
    fontWeight: '900',
  },
  articleLegendText: {
    ...typography.small,
    color: colors.deepViolet,
  },
  bullet: {
    ...typography.body,
    color: colors.deepViolet,
  },
  note: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  noteTitle: {
    ...typography.small,
    color: colors.royalPurple,
  },
  exampleRow: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    gap: 2,
    padding: spacing.md,
  },
  exampleGerman: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '800',
  },
  exampleTurkish: {
    ...typography.small,
    color: colors.muted,
  },
  dialogLine: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  dialogText: {
    flex: 1,
  },
  footer: {
    backgroundColor: colors.white,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    bottom: 0,
    elevation: 10,
    left: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    position: 'absolute',
    right: 0,
    shadowColor: colors.deepViolet,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  center: {
    backgroundColor: colors.surface,
    flex: 1,
    gap: spacing.lg,
    justifyContent: 'center',
    padding: spacing.xl,
  },
});
