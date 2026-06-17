import { useEffect, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { Map, NotebookTabs, RotateCcw, Settings2 } from 'lucide-react-native';

import { AppButton } from '../components/AppButton';
import { DevEventLogPanel } from '../components/DevEventLogPanel';
import { EmptyState } from '../components/EmptyState';
import { AppScrollView, Screen } from '../components/layout';
import { TopBar } from '../components/TopBar';
import { getPlayableLessonsForPlan } from '../data/lessons';
import { colors, radius, spacing, typography } from '../data/theme';
import { getKnownReviewCardCount, getReviewCoverage } from '../lib/srs';
import type { CommitUserState, RootNavigation } from '../navigation/AppNavigator';
import { trackLocalEvent } from '../services/localEventLog';
import type { UserState } from '../types/userState';

type ProfileScreenProps = {
  navigation: RootNavigation;
  userState: UserState;
  onUpdateState: CommitUserState;
  onResetApp: () => Promise<void>;
};

export function ProfileScreen({ navigation, userState, onUpdateState, onResetApp }: ProfileScreenProps) {
  const [activeMistakeId, setActiveMistakeId] = useState<string | null>(null);
  const level = Math.floor(userState.xp / 50) + 1;
  const xpInCurrentLevel = userState.xp % 50;
  const xpToNextLevel = xpInCurrentLevel === 0 ? 50 : 50 - xpInCurrentLevel;
  const knownWords = getKnownReviewCardCount(userState.reviewCards);
  const lessonPath = getPlayableLessonsForPlan(userState.learningPlan);
  const completedPathCount = lessonPath.filter((lesson) => userState.completedLessons.includes(lesson.id)).length;
  const a1Coverage = Math.round(
    Math.min(
      1,
      (completedPathCount / Math.max(1, lessonPath.length)) * 0.7 +
        getReviewCoverage(userState.reviewCards) * 0.3,
    ) * 100,
  );
  const recentMistakes = userState.mistakes.slice(-8).reverse();
  const badges = [
    { label: 'İlk ders', active: userState.completedLessons.length >= 1 },
    { label: '3 gün seri', active: userState.streak >= 3 },
    { label: '20 kelime', active: knownWords >= 20 },
    { label: 'İlk sınav', active: userState.examHistory.length >= 1 },
    { label: 'Seviye 3', active: level >= 3 },
    { label: 'A1 yolu', active: a1Coverage >= 100 },
  ];

  useEffect(() => {
    trackLocalEvent({ type: 'mistakes_opened', screen: 'Profile' });
  }, []);

  const clearMistake = async (mistakeId: string) => {
    await onUpdateState((state) => ({
      ...state,
      mistakes: state.mistakes.filter((mistake) => mistake.id !== mistakeId),
    }));
    setActiveMistakeId(null);
  };

  const openFeedbackDraft = async (eventLogText?: string) => {
    const template = [
      'WortWeg alfa geri bildirimi',
      '',
      'Ne yapmaya çalışıyordun?',
      '- ',
      '',
      'Ne ters gitti?',
      '- ',
      '',
      'Ekran görüntüsü opsiyonel.',
      '',
      'Cihaz modeli:',
      '- ',
      '',
      'App ekranı:',
      '- ',
      '',
      'Opsiyonel yerel test günlüğü:',
      eventLogText ?? '- ',
    ].join('\n');
    const url = 'mailto:?subject=' + encodeURIComponent('WortWeg alfa geri bildirimi') + '&body=' + encodeURIComponent(template);

    try {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
        return;
      }
    } catch {
      // Fall back to the visible template below.
    }

    Alert.alert('Geri Bildirim', template);
  };

  const developerReset = () => {
    Alert.alert(
      'Geliştirici sıfırlama',
      'AsyncStorage içindeki WortWeg uygulama verisi silinecek ve onboarding tekrar açılacak.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: () => {
            trackLocalEvent({ type: 'dev_reset_used', screen: 'Profile', action: 'developer_reset' });
            void onResetApp();
          },
        },
      ],
    );
  };

  return (
    <Screen backgroundColor={colors.deepViolet}>
      <TopBar
        streak={userState.streak}
        subtitle={userState.profile?.goal ?? 'A1 yolculuğu'}
        title="Profil"
        xp={userState.xp}
      />
      <AppScrollView contentContainerStyle={styles.content} style={styles.scroll}>
        <View style={styles.grid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userState.xp}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userState.streak}</Text>
            <Text style={styles.statLabel}>Seri</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userState.completedLessons.length}</Text>
            <Text style={styles.statLabel}>Ders</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{knownWords}</Text>
            <Text style={styles.statLabel}>Hafızadaki kelime</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userState.examHistory.length}</Text>
            <Text style={styles.statLabel}>Sınav</Text>
          </View>
        </View>

        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            Seviye {level} · A1 %{a1Coverage}
          </Text>
          <Text style={styles.heroText}>
            Sonraki seviyeye {xpToNextLevel} XP kaldı. Günlük XP hedefi:
            {' '}
            {userState.profile?.dailyGoalXp ?? 20} XP.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hedef</Text>
          <Text style={styles.body}>
            {userState.profile?.name ?? 'Öğrenci'} · {userState.profile?.goal ?? 'A1'}
          </Text>
          <Text style={styles.body}>
            Günlük hedef: {userState.profile?.dailyGoalMinutes ?? 10} dakika
          </Text>
        </View>

        {userState.learningPlan ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Aktif öğrenme planı</Text>
            <Text style={styles.planTitle}>{userState.learningPlan.titleTr}</Text>
            <Text style={styles.body}>
              {userState.learningPlan.currentLevel} → {userState.learningPlan.targetLevel} · yaklaşık {userState.learningPlan.estimatedWeeks} hafta
            </Text>
            <View style={styles.buttonRow}>
              <AppButton
                icon={Map}
                onPress={() => navigation.navigate('PlanOverview')}
                title="Plan"
                variant="secondary"
                style={styles.rowButton}
              />
              <AppButton
                icon={Settings2}
                onPress={() => navigation.navigate('PlanSetup', { mode: 'edit' })}
                title="Düzenle"
                variant="secondary"
                style={styles.rowButton}
              />
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hatalar defteri</Text>
          {recentMistakes.length === 0 ? (
            <EmptyState
              body="Yanlış cevapların burada kısa notlarla birikecek. Şimdilik temiz görünüyorsun."
              framed={false}
              icon={NotebookTabs}
              title="Henüz hata yok"
            />
          ) : (
            recentMistakes.map((mistake) => {
              const open = activeMistakeId === mistake.id;

              return (
              <View key={mistake.id} style={styles.mistakeCard}>
                <Text style={styles.mistakePrompt}>{mistake.prompt}</Text>
                <Text style={styles.body}>Cevabın: {mistake.userAnswer}</Text>
                {open ? (
                  <>
                    <Text style={styles.body}>Doğru: {mistake.expectedAnswer}</Text>
                    <Text style={styles.body}>{mistake.feedbackTr}</Text>
                    <AppButton
                      onPress={() => clearMistake(mistake.id)}
                      title="Bu hatayı öğrendim"
                      variant="secondary"
                    />
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
            })
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rozetler</Text>
          <View style={styles.badges}>
            {badges.map((badge) => (
              <View
                key={badge.label}
                style={[styles.badge, !badge.active && styles.badgeLocked]}
              >
                <Text style={[styles.badgeText, !badge.active && styles.badgeTextLocked]}>
                  {badge.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <DevEventLogPanel onFeedbackPress={(eventLogText) => void openFeedbackDraft(eventLogText)} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Premium</Text>
          <Text style={styles.body}>
            Gelişmiş konuşma analizi, sınırsız AI pratik ve bulut senkronizasyonu
            ileride burada yönetilecek.
          </Text>
          {/* TODO: premium subscription with RevenueCat should be wired here. */}
        </View>

        {__DEV__ ? (
          <AppButton
            icon={RotateCcw}
            onPress={developerReset}
            title="Geliştirici: Uygulama verisini sıfırla"
            variant="danger"
          />
        ) : null}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexBasis: '47%',
    flexGrow: 1,
    gap: spacing.xs,
    minHeight: 96,
    justifyContent: 'center',
    padding: spacing.md,
  },
  statValue: {
    ...typography.heading,
    color: colors.royalPurple,
  },
  statLabel: {
    ...typography.small,
    color: colors.muted,
  },
  section: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  heroSection: {
    backgroundColor: colors.deepViolet,
    borderRadius: radius.lg,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  heroTitle: {
    ...typography.heading,
    color: colors.white,
  },
  heroText: {
    ...typography.body,
    color: colors.lavender,
  },
  sectionTitle: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  body: {
    ...typography.body,
    color: colors.muted,
  },
  planTitle: {
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
  mistakeCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    gap: spacing.xs,
    padding: spacing.md,
  },
  mistakePrompt: {
    ...typography.body,
    color: colors.deepViolet,
    fontWeight: '900',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badge: {
    backgroundColor: colors.lavender,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  badgeLocked: {
    backgroundColor: colors.surfaceStrong,
    opacity: 0.55,
  },
  badgeText: {
    ...typography.small,
    color: colors.deepViolet,
  },
  badgeTextLocked: {
    color: colors.muted,
  },
});
