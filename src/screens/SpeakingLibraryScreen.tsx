import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, Mic, Sparkles } from 'lucide-react-native';

import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { Chip } from '../components/Chip';
import { HalftoneAccent } from '../components/HalftoneAccent';
import { AppScrollView, Screen } from '../components/layout';
import { SpeakerButton } from '../components/SpeakerButton';
import {
  getSpeakingLibraryGroupId,
  getSpeakingLibraryGroupLabel,
  speakingLibraryLevelOrder,
  speakingLibrarySentences,
  type SpeakingLibrarySentence,
} from '../data/speakingLibrary';
import { colors, radius, shadows, spacing, typography } from '../data/theme';
import { formatSpeakingLastPractice, formatSpeakingScorePercent, normalizeSpeakingStats } from '../lib/speakingStats';
import type { RootNavigation } from '../navigation/AppNavigator';
import type { UserState } from '../types/userState';

type SpeakingLibraryScreenProps = {
  navigation: RootNavigation;
  userState: UserState;
};

type SpeakingLibraryGroupId = typeof speakingLibraryLevelOrder[number];

export function SpeakingLibraryScreen({ navigation, userState }: SpeakingLibraryScreenProps) {
  const speakingStats = normalizeSpeakingStats(userState.speakingStats);
  const [activeGroup, setActiveGroup] = useState<SpeakingLibraryGroupId>('A0');
  const sentences = useMemo(
    () => speakingLibrarySentences.filter((sentence) => getSpeakingLibraryGroupId(sentence) === activeGroup),
    [activeGroup],
  );

  const startPractice = (sentence: SpeakingLibrarySentence) => {
    navigation.navigate('SpeakingPractice', {
      source: 'speaking_library:' + sentence.id,
      topicTitle: sentence.topicTitle,
      expectedText: sentence.german,
      meaningTr: sentence.meaningTr,
      tipTr: sentence.isB1Preview
        ? 'Bu kısa bir B1 Ön İzleme. Tam B1 yolu yakında.'
        : 'Cümleyi yavaş ve net söyle. Sonra sonucu birlikte incele.',
      sentenceId: sentence.id,
      sourceLessonId: sentence.sourceLessonId,
      level: sentence.isB1Preview ? 'B1_PREVIEW' : sentence.level === 'A0' || sentence.level === 'A1' || sentence.level === 'A2' ? sentence.level : 'OTHER',
      isB1Preview: sentence.isB1Preview,
    });
  };

  return (
    <Screen backgroundColor={colors.lavenderBackground}>
      <View style={styles.header}>
        <HalftoneAccent color={colors.yellowCta} opacity={0.1} size="small" style={styles.headerTexture} />
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <ArrowLeft color={colors.white} size={22} strokeWidth={3} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.kicker}>Kısa cümlelerle başla</Text>
          <Text style={styles.headerTitle}>Konuşma Pratiği</Text>
        </View>
      </View>

      <AppScrollView contentContainerStyle={styles.content} style={styles.scroll}>
        <AppCard style={styles.introCard}>
          <View style={styles.introIcon}>
            <Mic color={colors.comicBorderColor} size={28} strokeWidth={3} />
          </View>
          <View style={styles.introCopy}>
            <Text style={styles.sectionTitle}>Cümle seç</Text>
            <Text style={styles.muted}>Derslerden gelen hazır cümlelerle sesli pratik yap.</Text>
          </View>
        </AppCard>

        <AppCard style={styles.statsCard}>
          <Text style={styles.statsTitle}>Konuşma ilerlemen</Text>
          {speakingStats.totalAttempts === 0 ? (
            <Text style={styles.muted}>Henüz konuşma denemesi yok. Bir cümle seçip pratik yapabilirsin.</Text>
          ) : (
            <View style={styles.statsGrid}>
              <StatItem label="Toplam deneme" value={String(speakingStats.totalAttempts)} />
              <StatItem label="Başarılı deneme" value={String(speakingStats.successfulAttempts)} />
              <StatItem label="En iyi skor" value={formatSpeakingScorePercent(speakingStats.bestScorePercent)} />
              <StatItem label="Son skor" value={formatSpeakingScorePercent(speakingStats.latestScorePercent)} />
              <StatItem label="Çalışılan cümle" value={String(speakingStats.practicedSentenceIds.length)} />
              <StatItem label="Son pratik" value={formatSpeakingLastPractice(speakingStats.lastPracticedAt)} />
            </View>
          )}
        </AppCard>

        <View style={styles.filterRow}>
          {speakingLibraryLevelOrder.map((groupId) => (
            <Chip
              key={groupId}
              label={getSpeakingLibraryGroupLabel(groupId)}
              onPress={() => setActiveGroup(groupId)}
              selected={activeGroup === groupId}
              tone={groupId === 'B1_PREVIEW' ? 'yellow' : 'purple'}
            />
          ))}
        </View>

        {activeGroup === 'B1_PREVIEW' ? (
          <View style={styles.previewNotice}>
            <Sparkles color={colors.comicBorderColor} size={18} strokeWidth={3} />
            <Text style={styles.previewNoticeText}>Bu kısa ön izleme. Tam B1 yolu yakında.</Text>
          </View>
        ) : null}

        <View style={styles.sentenceList}>
          {sentences.map((sentence) => (
            <SentenceCard key={sentence.id} onPractice={() => startPractice(sentence)} sentence={sentence} />
          ))}
        </View>
      </AppScrollView>
    </Screen>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SentenceCard({ onPractice, sentence }: { onPractice: () => void; sentence: SpeakingLibrarySentence }) {
  return (
    <AppCard style={styles.sentenceCard}>
      <View style={styles.sentenceHeader}>
        <View style={[styles.levelBadge, sentence.isB1Preview && styles.previewBadge]}>
          <Text style={styles.levelBadgeText}>{sentence.isB1Preview ? 'B1 Ön İzleme' : sentence.level}</Text>
        </View>
        <SpeakerButton text={sentence.german} />
      </View>
      <Text style={styles.topicTitle}>{sentence.topicTitle}</Text>
      <Text style={styles.germanText}>{sentence.german}</Text>
      <Text style={styles.helperText}>{sentence.meaningTr}</Text>
      <AppButton icon={Mic} onPress={onPractice} title="Pratik yap" />
    </AppCard>
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
  introCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  introIcon: {
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
  introCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.heading,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  muted: {
    ...typography.body,
    color: colors.muted,
  },
  statsCard: {
    gap: spacing.sm,
  },
  statsTitle: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statItem: {
    backgroundColor: colors.paperLavender,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.md,
    borderWidth: colors.comicBorderWidth,
    flexBasis: '47%',
    flexGrow: 1,
    padding: spacing.sm,
  },
  statValue: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  statLabel: {
    ...typography.small,
    color: colors.muted,
    fontWeight: '800',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  previewNotice: {
    alignItems: 'center',
    backgroundColor: colors.comicYellowWash,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.lg,
    borderWidth: colors.comicBorderWidth,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    ...shadows.comicSmall,
  },
  previewNoticeText: {
    ...typography.small,
    color: colors.deepViolet,
    flex: 1,
    fontWeight: '900',
  },
  sentenceList: {
    gap: spacing.md,
  },
  sentenceCard: {
    gap: spacing.md,
  },
  sentenceHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelBadge: {
    backgroundColor: colors.paperLavender,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.sm,
    borderWidth: colors.comicBorderWidth,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  previewBadge: {
    backgroundColor: colors.yellowCta,
  },
  levelBadgeText: {
    ...typography.small,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  topicTitle: {
    ...typography.small,
    color: colors.royalPurple,
    fontWeight: '900',
  },
  germanText: {
    ...typography.heading,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  helperText: {
    ...typography.body,
    color: colors.muted,
  },
  pressed: {
    opacity: 0.78,
  },
});
