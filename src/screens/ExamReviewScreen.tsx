import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react-native';

import { AppButton } from '../components/AppButton';
import { AppScrollView } from '../components/layout';
import { colors, radius, shadows, spacing, typography } from '../data/theme';
import type { RootStackParamList } from '../navigation/AppNavigator';

type ExamReviewScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ExamReview'
>;

export function ExamReviewScreen({ navigation, route }: ExamReviewScreenProps) {
  const { reviewItems } = route.params;

  const mistakes = reviewItems.filter((item) => !item.isCorrect);

  const retryMistakes = () => {
    navigation.navigate('ExamRetry', {
      initialQuestions: mistakes.map((m) => m.question),
    });
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        <AppButton
          icon={ArrowLeft}
          onPress={() => navigation.goBack()}
          title="Geri"
          variant="ghost"
        />
        <Text style={styles.headerTitle}>Sınav Özeti</Text>
        <View style={styles.headerSpacer} />
      </View>
      <AppScrollView contentContainerStyle={styles.content}>
        {reviewItems.map((item, index) => (
          <View
            key={item.question.id + '-' + index}
            style={[
              styles.card,
              item.isCorrect ? styles.cardCorrect : styles.cardWrong,
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.kicker}>Soru {index + 1}</Text>
              {item.isCorrect ? (
                <View style={[styles.badge, styles.badgeCorrect]}>
                  <CheckCircle2 color={colors.green} size={16} />
                  <Text style={[styles.badgeText, { color: colors.green }]}>Doğru</Text>
                </View>
              ) : (
                <View style={[styles.badge, styles.badgeWrong]}>
                  <XCircle color={colors.red} size={16} />
                  <Text style={[styles.badgeText, { color: colors.red }]}>Yanlış</Text>
                </View>
              )}
            </View>

            <Text style={styles.prompt}>{item.question.promptTr}</Text>
            {item.question.text ? (
              <Text style={styles.questionText}>{item.question.text}</Text>
            ) : null}
            <Text style={styles.question}>{item.question.questionTr}</Text>

            <View style={styles.answerBox}>
              <Text style={styles.label}>Senin cevabın:</Text>
              <Text style={[styles.answer, item.isCorrect ? styles.textGreen : styles.textRed]}>
                {item.userAnswer}
              </Text>
            </View>

            {!item.isCorrect ? (
              <View style={styles.answerBox}>
                <Text style={styles.label}>Doğru cevap:</Text>
                <Text style={[styles.answer, styles.textGreen]}>{item.correctAnswer}</Text>
              </View>
            ) : null}

            {item.feedbackTr ? (
              <View style={styles.feedbackBox}>
                <Text style={styles.label}>Açıklama:</Text>
                <Text style={styles.feedbackText}>{item.feedbackTr}</Text>
              </View>
            ) : null}
          </View>
        ))}

        {mistakes.length > 0 ? (
          <View style={styles.retryBox}>
            <Text style={styles.retryText}>
              {mistakes.length} soruda hata yaptın. Sadece yanlışlarını tekrar çözerek pekiştirmek ister misin?
            </Text>
            <AppButton
              onPress={retryMistakes}
              title="Yanlışları Tekrar Çöz"
            />
          </View>
        ) : (
          <View style={styles.retryBox}>
            <Text style={styles.successText}>
              Harika! Tüm soruları doğru cevapladın.
            </Text>
            <AppButton
              onPress={() => navigation.navigate('Main')}
              title="Ana ekrana dön"
              variant="secondary"
            />
          </View>
        )}
      </AppScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.lavenderBackground,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomColor: colors.comicBorderColor,
    borderBottomWidth: colors.comicBorderWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  headerTitle: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  headerSpacer: {
    width: 80,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.lg,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.md,
    padding: spacing.md,
    ...shadows.comicSmall,
  },
  cardCorrect: {
    borderTopColor: colors.green,
    borderTopWidth: 6,
  },
  cardWrong: {
    borderTopColor: colors.red,
    borderTopWidth: 6,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  kicker: {
    ...typography.small,
    color: colors.royalPurple,
    fontWeight: '900',
  },
  badge: {
    alignItems: 'center',
    borderRadius: radius.sm,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  badgeCorrect: {
    backgroundColor: '#DFFFD7',
  },
  badgeWrong: {
    backgroundColor: '#FFE1E1',
  },
  badgeText: {
    ...typography.small,
    fontWeight: '900',
  },
  prompt: {
    ...typography.small,
    color: colors.muted,
  },
  questionText: {
    ...typography.body,
    color: colors.deepViolet,
  },
  question: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  answerBox: {
    gap: spacing.xs,
  },
  feedbackBox: {
    backgroundColor: colors.paperLavender,
    borderRadius: radius.md,
    gap: spacing.xs,
    padding: spacing.sm,
  },
  label: {
    ...typography.small,
    color: colors.muted,
  },
  answer: {
    ...typography.body,
    fontWeight: '800',
  },
  feedbackText: {
    ...typography.small,
    color: colors.deepViolet,
  },
  textGreen: {
    color: colors.green,
  },
  textRed: {
    color: colors.red,
  },
  retryBox: {
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  retryText: {
    ...typography.body,
    color: colors.deepViolet,
    textAlign: 'center',
  },
  successText: {
    ...typography.body,
    color: colors.green,
    fontWeight: '900',
    textAlign: 'center',
  },
});
