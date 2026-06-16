import { RotateCcw } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../components/AppButton';
import { AppScrollView, Screen } from '../components/layout';
import { ArticleWord } from '../components/ArticleWord';
import { SpeakerButton } from '../components/SpeakerButton';
import { XP } from '../data/constants';
import { colors, radius, spacing, typography } from '../data/theme';
import {
  answerReviewCard,
  getDueReviewCards,
  getKnownReviewCardCount,
  replaceReviewCard,
  type ReviewQuality,
} from '../lib/srs';
import { awardXpForStudy } from '../lib/storage';
import type { CommitUserState } from '../navigation/AppNavigator';
import type { UserState } from '../types/userState';
import { useState } from 'react';
import { TopBar } from '../components/TopBar';

type VocabScreenProps = {
  userState: UserState;
  onUpdateState: CommitUserState;
};

export function VocabScreen({ userState, onUpdateState }: VocabScreenProps) {
  const [revealed, setRevealed] = useState(false);
  const dueCards = getDueReviewCards(userState.reviewCards);
  const knownCards = getKnownReviewCardCount(userState.reviewCards);
  const card = dueCards[0];

  const review = async (quality: ReviewQuality) => {
    if (!card) {
      return;
    }

    const updatedCard = answerReviewCard(card, quality);
    await onUpdateState((state) =>
      awardXpForStudy(
        {
          ...state,
          reviewCards: replaceReviewCard(state.reviewCards, updatedCard),
        },
        quality === 'again' ? 0 : XP.reviewCorrect,
      ),
    );
    setRevealed(false);
  };

  return (
    <Screen backgroundColor={colors.deepViolet}>
      <TopBar
        streak={userState.streak}
        subtitle={`${dueCards.length} kelime tekrar zamanı`}
        title="Kelime tekrar"
        xp={userState.xp}
      />
      <AppScrollView contentContainerStyle={styles.content} style={styles.scroll}>
        {card ? (
          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View>
                <Text style={styles.kicker}>SRS kartı</Text>
                <Text style={styles.title}>{card.german}</Text>
                <Text style={styles.body}>Kutu {card.box + 1}/5</Text>
              </View>
              <SpeakerButton text={card.german} />
            </View>

            {revealed ? (
              <View style={styles.answerBox}>
                <Text style={styles.answer}>{card.turkish}</Text>
                {card.article ? (
                  <Text style={styles.articleHint}>Artikel: {card.article}</Text>
                ) : null}
              </View>
            ) : (
              <AppButton
                icon={RotateCcw}
                onPress={() => setRevealed(true)}
                title="Cevabı göster"
                variant="secondary"
              />
            )}

            {revealed ? (
              <View style={styles.reviewButtons}>
                <AppButton
                  onPress={() => review('again')}
                  title="Tekrar"
                  variant="danger"
                />
                <AppButton
                  onPress={() => review('hard')}
                  title="Zor"
                  variant="secondary"
                />
                <AppButton onPress={() => review('good')} title="İyi" />
                <AppButton
                  onPress={() => review('easy')}
                  title="Kolay"
                  variant="secondary"
                />
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.title}>Bugün tekrar yok</Text>
            <Text style={styles.body}>
              Ders tamamladıkça kelimeler buraya gelir. Zamanı gelen kartları
              SRS aralıklarıyla tekrar edersin.
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kayıtlı kelimeler</Text>
          <Text style={styles.body}>
            {userState.reviewCards.length} kart · {knownCards} kelime hafızada
          </Text>
          {userState.reviewCards.length === 0 ? (
            <Text style={styles.body}>Henüz kelime kartı yok.</Text>
          ) : (
            userState.reviewCards.map((item) => (
              <ArticleWord
                article={item.article}
                german={item.german}
                key={item.id}
                turkish={`${item.turkish} · tekrar: ${item.dueDate}`}
              />
            ))
          )}
        </View>
      </AppScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.deepViolet,
    flex: 1,
  },
  scroll: {
    backgroundColor: colors.surface,
  },
  content: {
    backgroundColor: colors.surface,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  reviewCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  reviewHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  kicker: {
    ...typography.small,
    color: colors.royalPurple,
  },
  title: {
    ...typography.heading,
    color: colors.deepViolet,
  },
  answerBox: {
    backgroundColor: colors.lavender,
    borderRadius: radius.md,
    gap: spacing.xs,
    padding: spacing.md,
  },
  answer: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  articleHint: {
    ...typography.small,
    color: colors.deepViolet,
  },
  reviewButtons: {
    gap: spacing.sm,
  },
  emptyState: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
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
});
