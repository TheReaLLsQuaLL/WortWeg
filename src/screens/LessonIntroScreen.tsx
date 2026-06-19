import { useEffect } from 'react';
import { ArrowLeft, Play } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RouteProp } from '@react-navigation/native';

import { AppButton } from '../components/AppButton';
import { HalftoneAccent } from '../components/HalftoneAccent';
import { ProgressPill } from '../components/ProgressPill';
import { useDetailFooterSpacing } from '../components/layout';
import { ArticleWord } from '../components/ArticleWord';
import { SpeakerButton } from '../components/SpeakerButton';
import { ARTICLE_HINTS, ARTICLES } from '../data/constants';
import { getLessonById } from '../data/lessons';
import {
  articleColors,
  articleLightColors,
  colors,
  radius,
  shadows,
  spacing,
  typography,
} from '../data/theme';
import type {
  RootNavigation,
  RootStackParamList,
} from '../navigation/AppNavigator';
import { trackLocalEvent } from '../services/localEventLog';

type LessonIntroScreenProps = {
  navigation: RootNavigation;
  route: RouteProp<RootStackParamList, 'LessonIntro'>;
};

export function LessonIntroScreen({ navigation, route }: LessonIntroScreenProps) {
  const lesson = getLessonById(route.params.lessonId);
  const { contentPaddingBottom, footerPaddingBottom } = useDetailFooterSpacing();

  useEffect(() => {
    if (lesson) {
      trackLocalEvent({
        type: 'lesson_started',
        screen: 'LessonIntro',
        metadata: { lessonId: lesson.id, level: lesson.cefr },
      });
    }
  }, [lesson]);

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
          <HalftoneAccent color={colors.yellowCta} opacity={0.1} size="small" style={styles.introTexture} />
          <Text style={styles.title}>{lesson.subtitle}</Text>
          {lesson.titleDe ? <Text style={styles.kickerDark}>{lesson.titleDe}</Text> : null}
          <Text style={styles.body}>{lesson.goalTr ?? lesson.descriptionTr}</Text>
          <View style={styles.metaPills}>
            <ProgressPill label={lesson.estimatedMinutes + ' dk'} tone="yellow" />
            <ProgressPill label={lesson.vocabulary.length + ' kelime'} tone="purple" />
            <ProgressPill label={lesson.baseExercises.length + ' alıştırma'} tone="green" />
          </View>
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
          <Text style={styles.sectionTitle}>Gramer</Text>
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
              <View key={line.speaker + '-' + line.line} style={styles.dialogLine}>
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

        {lesson.commonMistakeTr ? (
          <View style={styles.warningBox}>
            <Text style={styles.sectionTitle}>Dikkat</Text>
            <Text style={styles.body}>{lesson.commonMistakeTr}</Text>
          </View>
        ) : null}

        {lesson.speakingPrompt ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{lesson.speakingPrompt.titleTr}</Text>
            <View style={styles.promptBox}>
              <View style={styles.dialogText}>
                <Text style={styles.exampleGerman}>{lesson.speakingPrompt.promptDe}</Text>
                <Text style={styles.exampleTurkish}>{lesson.speakingPrompt.promptTr}</Text>
              </View>
              <SpeakerButton text={lesson.speakingPrompt.promptDe} />
            </View>
          </View>
        ) : null}

        {lesson.writingPrompt ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{lesson.writingPrompt.titleTr}</Text>
            <Text style={styles.body}>{lesson.writingPrompt.promptTr}</Text>
            {lesson.writingPrompt.sampleAnswerDe ? (
              <View style={styles.exampleRow}>
                <Text style={styles.exampleGerman}>{lesson.writingPrompt.sampleAnswerDe}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {lesson.reviewSummaryTr ? (
          <View style={styles.reviewBox}>
            <Text style={styles.sectionTitle}>Özet</Text>
            <Text style={styles.body}>{lesson.reviewSummaryTr}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kelimeler</Text>
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
          title="Derse başla"
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
    borderBottomColor: colors.comicBorderColor,
    borderBottomWidth: colors.comicBorderWidth,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: colors.primaryPurple,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.md,
    borderWidth: colors.comicBorderWidth,
    height: 46,
    justifyContent: 'center',
    width: 46,
    ...shadows.comicSmall,
  },
  headerCopy: {
    flex: 1,
  },
  kicker: {
    ...typography.small,
    color: colors.yellow,
  },
  kickerDark: {
    ...typography.small,
    color: colors.royalPurple,
    fontWeight: '900',
  },
  headerTitle: {
    ...typography.heading,
    color: colors.white,
    fontWeight: '900',
  },
  content: {
    backgroundColor: colors.lavenderBackground,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  intro: {
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderTopColor: colors.yellowCta,
    borderTopWidth: 10,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.sm,
    overflow: 'hidden',
    padding: spacing.xl,
    ...shadows.lift,
  },
  introTexture: {
    height: 120,
    position: 'absolute',
    right: -18,
    top: -18,
    width: 150,
  },
  title: {
    ...typography.heading,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  metaPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  body: {
    ...typography.body,
    color: colors.muted,
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
    borderColor: colors.comicBorderColor,
    borderRadius: radius.lg,
    borderWidth: 2,
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
    backgroundColor: colors.paperLavender,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
    shadowOpacity: 0,
    elevation: 0,
  },
  warningBox: {
    backgroundColor: colors.comicYellowWash,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.sm,
    padding: spacing.lg,
    ...shadows.comicSmall,
  },
  promptBox: {
    alignItems: 'center',
    backgroundColor: colors.paperLavender,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  reviewBox: {
    backgroundColor: colors.comicBlueWash,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.sm,
    padding: spacing.lg,
    ...shadows.comic,
  },
  noteTitle: {
    ...typography.small,
    color: colors.royalPurple,
  },
  exampleRow: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
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
    backgroundColor: colors.paperLavender,
    borderColor: colors.border,
    borderRadius: radius.lg,
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
    borderTopColor: colors.comicBorderColor,
    borderTopWidth: colors.comicBorderWidth,
    bottom: 0,
    elevation: 10,
    left: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    position: 'absolute',
    right: 0,
    shadowColor: colors.deepViolet,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 0,
  },
  center: {
    backgroundColor: colors.lavenderBackground,
    flex: 1,
    gap: spacing.lg,
    justifyContent: 'center',
    padding: spacing.xl,
  },
});
