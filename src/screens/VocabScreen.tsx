import { BookOpen, CheckCircle2, Home, RotateCcw } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../components/AppButton';
import { HalftoneAccent } from '../components/HalftoneAccent';
import { AppScrollView, Screen } from '../components/layout';
import { ArticleWord } from '../components/ArticleWord';
import { Mascot } from '../components/Mascot';
import { SpeakerButton } from '../components/SpeakerButton';
import { TopBar } from '../components/TopBar';
import { XP } from '../data/constants';
import { articleColors, colors, radius, shadows, spacing, typography } from '../data/theme';
import {
  answerReviewCard,
  getDueReviewCards,
  getKnownReviewCardCount,
  replaceReviewCard,
  type ReviewQuality,
} from '../lib/srs';
import { awardXpForStudy } from '../lib/storage';
import type { CommitUserState, RootNavigation } from '../navigation/AppNavigator';
import { trackLocalEvent } from '../services/localEventLog';
import type { UserState } from '../types/userState';

type VocabScreenProps = {
  navigation: RootNavigation;
  userState: UserState;
  onUpdateState: CommitUserState;
};

export function VocabScreen({ navigation, userState, onUpdateState }: VocabScreenProps) {
  const [revealed, setRevealed] = useState(false);
  const [reviewedThisSession, setReviewedThisSession] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionQueueIds, setSessionQueueIds] = useState<string[]>(() =>
    getDueReviewCards(userState.reviewCards).map((item) => item.id),
  );
  const [repeatQueuedIds, setRepeatQueuedIds] = useState<string[]>([]);
  const dueCards = useMemo(() => getDueReviewCards(userState.reviewCards), [userState.reviewCards]);
  const reviewCardById = useMemo(
    () => new Map(userState.reviewCards.map((item) => [item.id, item])),
    [userState.reviewCards],
  );
  const dueCardIds = useMemo(() => dueCards.map((item) => item.id), [dueCards]);
  const dueCardIdsKey = dueCardIds.join('|');
  const sessionQueue = sessionQueueIds
    .map((id) => reviewCardById.get(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const knownCards = getKnownReviewCardCount(userState.reviewCards);
  const card = sessionQueue[0];
  const safeReviewedThisSession = Number.isFinite(reviewedThisSession)
    ? Math.max(0, reviewedThisSession)
    : 0;
  const sessionTotalCount = Math.max(safeReviewedThisSession + sessionQueue.length, sessionQueue.length);
  const currentCardPosition = sessionTotalCount > 0
    ? Math.min(safeReviewedThisSession + 1, sessionTotalCount)
    : 0;

  useEffect(() => {
    trackLocalEvent({ type: 'srs_opened', screen: 'Vocab' });
  }, []);

  useEffect(() => {
    if (sessionStarted || sessionCompleted) {
      return;
    }

    setSessionQueueIds(dueCardIds);
    setRepeatQueuedIds([]);
    setReviewedThisSession(0);
    setRevealed(false);
  }, [dueCardIdsKey, dueCardIds, sessionCompleted, sessionStarted]);

  const review = async (quality: Extract<ReviewQuality, 'again' | 'good'>) => {
    if (!card) {
      return;
    }

    const updatedCard = answerReviewCard(card, quality);
    const currentQueueIds = sessionQueue.map((item) => item.id);
    const remainingQueueIds = currentQueueIds.slice(1);
    const wasAlreadyQueuedForRepeat = repeatQueuedIds.includes(card.id);
    const shouldRepeatInSession = quality === 'again' && !wasAlreadyQueuedForRepeat;
    const nextQueueIds = shouldRepeatInSession
      ? [...remainingQueueIds, card.id]
      : remainingQueueIds;
    const nextRepeatQueuedIds = shouldRepeatInSession
      ? [...repeatQueuedIds, card.id]
      : repeatQueuedIds;

    setSessionStarted(true);
    await onUpdateState((state) =>
      awardXpForStudy(
        {
          ...state,
          reviewCards: replaceReviewCard(state.reviewCards, updatedCard),
        },
        quality === 'again' ? 0 : XP.reviewCorrect,
      ),
    );

    const nextReviewedCount = safeReviewedThisSession + 1;
    setReviewedThisSession(nextReviewedCount);
    setSessionQueueIds(nextQueueIds);
    setRepeatQueuedIds(nextRepeatQueuedIds);
    setRevealed(false);

    trackLocalEvent({
      type: 'srs_card_reviewed',
      screen: 'Vocab',
      metadata: {
        lessonId: card.lessonId,
        result: quality === 'again' ? 'incorrect' : 'correct',
        count: nextReviewedCount,
      },
    });

    if (nextQueueIds.length === 0) {
      setSessionCompleted(true);
      trackLocalEvent({
        type: 'srs_completed',
        screen: 'Vocab',
        metadata: { count: nextReviewedCount },
      });
    }
  };

  const subtitle = sessionCompleted
    ? 'Bugünlük tekrar tamam'
    : sessionQueue.length > 0
      ? sessionQueue.length + ' kartlık tekrar'
      : userState.reviewCards.length > 0
        ? 'Bugünlük tekrar tamam'
        : 'Ders bitirince kartlar açılır';

  return (
    <Screen backgroundColor={colors.lavenderBackground}>
      <TopBar
        streak={userState.streak}
        subtitle={subtitle}
        title="Kelime tekrar"
        xp={userState.xp}
      />
      <AppScrollView contentContainerStyle={styles.content} style={styles.scroll}>
        {card ? (
          <View style={styles.reviewCard}>
            <HalftoneAccent opacity={0.08} size="small" style={styles.reviewTexture} />
            {card.article ? (
              <View style={[styles.articleDogEar, { backgroundColor: articleColors[card.article] }]}>
                <Text style={styles.articleDogEarText}>{card.article}</Text>
              </View>
            ) : null}
            <View style={styles.reviewHeader}>
              <View style={styles.flexCopy}>
                <Text style={styles.kicker}>Kart {currentCardPosition} / {sessionTotalCount}</Text>
                <Text style={styles.title}>{card.german}</Text>
                <Text style={styles.body}>Kutu {card.box + 1}/5</Text>
              </View>
              <SpeakerButton text={card.german} />
            </View>

            {revealed ? (
              <View style={styles.answerBox}>
                <ArticleWord
                  article={card.article}
                  example={card.exampleDe}
                  german={card.german}
                  turkish={card.turkish}
                />
                {card.exampleTr ? <Text style={styles.exampleTr}>{card.exampleTr}</Text> : null}
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
                  style={styles.reviewButton}
                />
                <AppButton
                  icon={CheckCircle2}
                  onPress={() => review('good')}
                  title="Bildim"
                  style={styles.reviewButton}
                />
              </View>
            ) : null}
          </View>
        ) : userState.reviewCards.length === 0 ? (
          <View style={styles.emptyReviewCard}>
            <HalftoneAccent color={colors.primaryPurple} opacity={0.08} size="small" style={styles.emptyReviewTexture} />
            <View style={styles.emptyMascotBadge}>
              <Mascot size={62} />
            </View>
            <View style={styles.emptyCopy}>
              <Text style={styles.doneTitle}>Henüz kart yok</Text>
              <Text style={styles.body}>Ders bitirdikçe kelimeler burada tekrar kartına dönüşecek.</Text>
            </View>
            <View style={styles.emptyTipRow}>
              <BookOpen color={colors.primaryPurple} size={18} strokeWidth={2.7} />
              <Text style={styles.emptyTipText}>İlk tekrarlar hemen açılır.</Text>
            </View>
          </View>
        ) : (
          <View style={styles.doneCard}>
            <CheckCircle2 color={colors.green} size={36} strokeWidth={2.6} />
            <Text style={styles.doneTitle}>{sessionCompleted ? 'Bugünlük bu kadar' : 'Bugün tekrar yok'}</Text>
            <Text style={styles.body}>Yeni kartların zamanı gelince burada görünecek.</Text>
            <AppButton
              icon={Home}
              onPress={() => navigation.navigate('Main', { initialTab: 'home' })}
              title="Ana sayfaya dön"
              variant="secondary"
            />
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
                example={item.exampleDe}
                german={item.german}
                key={item.id}
                turkish={item.turkish + ' · tekrar: ' + new Date(item.dueDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
              />
            ))
          )}
        </View>
      </AppScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: colors.lavenderBackground,
  },
  content: {
    backgroundColor: colors.lavenderBackground,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  reviewCard: {
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    borderTopColor: colors.yellowCta,
    borderTopWidth: 10,
    gap: spacing.lg,
    overflow: 'hidden',
    padding: spacing.xl,
    ...shadows.lift,
  },
  reviewHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  flexCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  kicker: {
    ...typography.small,
    color: colors.royalPurple,
    fontWeight: '900',
  },
  title: {
    fontSize: 42,
    lineHeight: 48,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  answerBox: {
    backgroundColor: colors.paperLavender,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.sm,
    padding: spacing.lg,
    ...shadows.comic,
  },
  exampleTr: {
    ...typography.small,
    color: colors.deepViolet,
  },
  reviewButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  reviewButton: {
    flex: 1,
  },
  doneCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.md,
    padding: spacing.lg,
    ...shadows.comic,
  },
  emptyReviewCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.md,
    overflow: 'hidden',
    padding: spacing.xl,
    ...shadows.comic,
  },
  emptyReviewTexture: {
    bottom: -10,
    height: 120,
    position: 'absolute',
    right: -10,
    width: 150,
  },
  emptyMascotBadge: {
    alignItems: 'center',
    backgroundColor: colors.yellowCta,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    height: 92,
    justifyContent: 'center',
    width: 92,
    ...shadows.comicSmall,
  },
  emptyCopy: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  emptyTipRow: {
    alignItems: 'center',
    backgroundColor: colors.paperLavender,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.lg,
    borderWidth: colors.comicBorderWidth,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.comicSmall,
  },
  emptyTipText: {
    ...typography.small,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  doneTitle: {
    ...typography.title,
    color: colors.deepViolet,
    fontWeight: '900',
    textAlign: 'center',
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
    ...shadows.comic,
  },
  reviewTexture: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  articleDogEar: {
    alignItems: 'center',
    borderBottomColor: colors.comicBorderColor,
    borderBottomLeftRadius: radius.lg,
    borderBottomWidth: colors.comicBorderWidth,
    borderLeftColor: colors.comicBorderColor,
    borderLeftWidth: colors.comicBorderWidth,
    minWidth: 66,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  articleDogEarText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '900',
  },
  sectionTitle: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
});
