import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, BookOpen, CheckCircle2, NotebookTabs } from 'lucide-react-native';

import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { EmptyState } from '../components/EmptyState';
import { HalftoneAccent } from '../components/HalftoneAccent';
import { AppScrollView, Screen } from '../components/layout';
import { getLessonById } from '../data/lessons';
import { colors, radius, shadows, spacing, typography } from '../data/theme';
import type { CommitUserState, RootNavigation } from '../navigation/AppNavigator';
import { trackLocalEvent } from '../services/localEventLog';
import type { Mistake, UserState } from '../types/userState';

type MistakesScreenProps = {
  navigation: RootNavigation;
  userState: UserState;
  onUpdateState: CommitUserState;
};

export function MistakesScreen({ navigation, onUpdateState, userState }: MistakesScreenProps) {
  const [activeMistakeId, setActiveMistakeId] = useState<string | null>(null);
  const mistakes = [...userState.mistakes].reverse();
  const mistakeGroups = mistakes.reduce<Array<{ lessonId: string; title: string; items: Mistake[] }>>((groups, mistake) => {
    const lessonTitle = getLessonById(mistake.lessonId)?.title ?? 'Ders';
    const existingGroup = groups.find((group) => group.lessonId === mistake.lessonId);

    if (existingGroup) {
      existingGroup.items.push(mistake);
      return groups;
    }

    return [...groups, { lessonId: mistake.lessonId, title: lessonTitle, items: [mistake] }];
  }, []);

  const clearMistake = async (mistakeId: string) => {
    const mistake = userState.mistakes.find((item) => item.id === mistakeId);

    await onUpdateState((state) => ({
      ...state,
      mistakes: state.mistakes.filter((item) => item.id !== mistakeId),
    }));
    setActiveMistakeId(null);
    trackLocalEvent({
      type: 'mistakes_item_reviewed',
      screen: 'Mistakes',
      action: 'understood',
      metadata: { actionId: 'understood', lessonId: mistake?.lessonId },
    });
  };

  const retryMistakeLesson = (mistake: Mistake) => {
    trackLocalEvent({
      type: 'mistakes_item_reviewed',
      screen: 'Mistakes',
      action: 'retry_lesson',
      metadata: { actionId: 'retry_lesson', lessonId: mistake.lessonId },
    });
    navigation.navigate('LessonIntro', { lessonId: mistake.lessonId });
  };

  return (
    <Screen backgroundColor={colors.lavenderBackground}>
      <View style={styles.header}>
        <HalftoneAccent color={colors.yellowCta} opacity={0.1} size="small" style={styles.headerTexture} />
        <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <ArrowLeft color={colors.white} size={22} strokeWidth={3} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.kicker}>Hatalarını tekrar et</Text>
          <Text style={styles.headerTitle}>Hatalar</Text>
        </View>
      </View>

      <AppScrollView contentContainerStyle={styles.content} style={styles.scroll}>
        <AppCard style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <NotebookTabs color={colors.comicBorderColor} size={26} strokeWidth={3} />
          </View>
          <View style={styles.summaryCopy}>
            <Text style={styles.sectionTitle}>Yanlış yaptığın cümleleri gör</Text>
            <Text style={styles.body}>
              {mistakes.length > 0
                ? mistakes.length + ' hata kayıtlı. Cevabı açıp tekrar çözebilirsin.'
                : 'Henüz hata yok. Harika gidiyorsun.'}
            </Text>
          </View>
        </AppCard>

        {mistakes.length === 0 ? (
          <EmptyState
            actionTitle="Derse dön"
            body="Yanlış cevapların burada kısa notlarla birikecek."
            icon={CheckCircle2}
            onActionPress={() => navigation.navigate('Main', { initialTab: 'home' })}
            title="Henüz hata yok"
          />
        ) : (
          mistakeGroups.map((group) => (
            <View key={group.lessonId} style={styles.mistakeGroup}>
              <Text style={styles.mistakeGroupTitle}>{group.title}</Text>
              {group.items.map((mistake) => {
                const open = activeMistakeId === mistake.id;

                return (
                  <View key={mistake.id} style={styles.mistakeCard}>
                    <Text style={styles.mistakePrompt}>{mistake.prompt}</Text>
                    <Text style={styles.body}>Cevabın: {mistake.userAnswer}</Text>
                    {open ? (
                      <>
                        <Text style={styles.body}>Doğru: {mistake.expectedAnswer}</Text>
                        <Text style={styles.body}>{mistake.feedbackTr}</Text>
                        <View style={styles.buttonRow}>
                          <AppButton
                            icon={BookOpen}
                            onPress={() => retryMistakeLesson(mistake)}
                            title="Tekrar çöz"
                            variant="secondary"
                            style={styles.rowButton}
                          />
                          <AppButton
                            icon={CheckCircle2}
                            onPress={() => clearMistake(mistake.id)}
                            title="Anladım"
                            variant="secondary"
                            style={styles.rowButton}
                          />
                        </View>
                      </>
                    ) : (
                      <AppButton
                        onPress={() => setActiveMistakeId(mistake.id)}
                        title="Cevabı göster"
                        variant="secondary"
                      />
                    )}
                  </View>
                );
              })}
            </View>
          ))
        )}
      </AppScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    backgroundColor: colors.deepViolet,
    borderBottomColor: colors.comicBorderColor,
    borderBottomWidth: colors.comicBorderWidth,
    flexDirection: 'row',
    gap: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
  },
  headerTexture: {
    height: 96,
    position: 'absolute',
    right: -18,
    top: -14,
    width: 150,
  },
  backButton: {
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
    color: colors.yellowCta,
    fontWeight: '900',
  },
  headerTitle: {
    ...typography.heading,
    color: colors.white,
    fontWeight: '900',
  },
  scroll: {
    backgroundColor: colors.lavenderBackground,
  },
  content: {
    backgroundColor: colors.lavenderBackground,
    gap: spacing.md,
    padding: spacing.lg,
  },
  summaryCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  summaryIcon: {
    alignItems: 'center',
    backgroundColor: colors.yellowCta,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    height: 58,
    justifyContent: 'center',
    width: 58,
    ...shadows.comicSmall,
  },
  summaryCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.heading,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  body: {
    ...typography.body,
    color: colors.muted,
  },
  mistakeGroup: {
    gap: spacing.sm,
  },
  mistakeGroupTitle: {
    ...typography.small,
    color: colors.royalPurple,
    fontWeight: '900',
  },
  mistakeCard: {
    backgroundColor: colors.paperLavender,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.sm,
    padding: spacing.md,
    ...shadows.comicSmall,
  },
  mistakePrompt: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rowButton: {
    flex: 1,
  },
  pressed: {
    opacity: 0.78,
  },
});
