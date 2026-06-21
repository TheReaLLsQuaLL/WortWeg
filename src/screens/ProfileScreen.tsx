import { useEffect, useState } from 'react';
import { Alert, Clipboard, Linking, Modal, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { Map, NotebookTabs, RotateCcw, Settings2 } from 'lucide-react-native';

import { AppButton } from '../components/AppButton';
import { DevEventLogPanel } from '../components/DevEventLogPanel';
import { EmptyState } from '../components/EmptyState';
import { HalftoneAccent } from '../components/HalftoneAccent';
import { AppScrollView, Screen } from '../components/layout';
import { TopBar } from '../components/TopBar';
import { ALPHA_BUILD_DATE, APP_NAME, APP_VERSION } from '../data/constants';
import { getLessonById, getPlayableLessonsForPlan } from '../data/lessons';
import { colors, radius, shadows, spacing, typography } from '../data/theme';
import { checkBackendHealth, getBackendConfig, getBackendHost } from '../config/backend';
import { getKnownReviewCardCount, getReviewCoverage } from '../lib/srs';
import { shouldShowOnboarding } from '../lib/storage';
import type { CommitUserState, RootNavigation } from '../navigation/AppNavigator';
import { getLocalEventLog, trackLocalEvent } from '../services/localEventLog';
import type { Mistake, UserState } from '../types/userState';

type ProfileScreenProps = {
  navigation: RootNavigation;
  userState: UserState;
  onUpdateState: CommitUserState;
  onResetApp: () => Promise<void>;
};

type BackendStatus = 'checking' | 'reachable' | 'unreachable' | 'not_configured';

const backendStatusLabel: Record<BackendStatus, string> = {
  checking: 'kontrol ediliyor',
  reachable: 'erişilebilir',
  unreachable: 'erişilemiyor',
  not_configured: 'ayarlı değil',
};

const yesNo = (value: boolean) => (value ? 'evet' : 'hayır');

type InfoRowProps = {
  label: string;
  value: string;
};

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export function ProfileScreen({ navigation, userState, onUpdateState, onResetApp }: ProfileScreenProps) {
  const [activeMistakeId, setActiveMistakeId] = useState<string | null>(null);
  const [debugModalVisible, setDebugModalVisible] = useState(false);
  const [debugText, setDebugText] = useState('');
  const [testerInfoModalVisible, setTesterInfoModalVisible] = useState(false);
  const [testerInfoText, setTesterInfoText] = useState('');
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('not_configured');
  const [hasSpeechDebug, setHasSpeechDebug] = useState(false);
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
  const mistakeGroups = recentMistakes.reduce<Array<{ lessonId: string; title: string; items: Mistake[] }>>((groups, mistake) => {
    const lessonTitle = getLessonById(mistake.lessonId)?.title ?? 'Ders';
    const existingGroup = groups.find((group) => group.lessonId === mistake.lessonId);

    if (existingGroup) {
      existingGroup.items.push(mistake);
      return groups;
    }

    return [...groups, { lessonId: mistake.lessonId, title: lessonTitle, items: [mistake] }];
  }, []);
  const backendConfig = getBackendConfig();
  const backendUrl = backendConfig.baseUrl;
  const backendHost = getBackendHost(backendUrl);
  const currentLevel = userState.learningPlan?.currentLevel ?? userState.profile?.startLevel ?? 'A0';
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

  useEffect(() => {
    if (!__DEV__) {
      return;
    }

    let mounted = true;

    const loadDevStatus = async () => {
      const events = await getLocalEventLog();
      const speechEvents = events.some((event) => event.type.startsWith('speech_') || event.type.startsWith('recording_'));

      if (mounted) {
        setHasSpeechDebug(speechEvents);
      }

      if (!backendUrl) {
        if (mounted) {
          setBackendStatus('not_configured');
        }
        return;
      }

      if (mounted) {
        setBackendStatus('checking');
      }

      try {
        const health = await checkBackendHealth(2500);

        if (mounted) {
          setBackendStatus(health.ok ? 'reachable' : 'unreachable');
        }
      } catch {
        if (mounted) {
          setBackendStatus('unreachable');
        }
      }
    };

    void loadDevStatus();

    return () => {
      mounted = false;
    };
  }, [backendUrl]);

  const clearMistake = async (mistakeId: string) => {
    const mistake = userState.mistakes.find((item) => item.id === mistakeId);

    await onUpdateState((state) => ({
      ...state,
      mistakes: state.mistakes.filter((item) => item.id !== mistakeId),
    }));
    setActiveMistakeId(null);
    trackLocalEvent({
      type: 'mistakes_item_reviewed',
      screen: 'Profile',
      action: 'understood',
      metadata: { actionId: 'understood', lessonId: mistake?.lessonId },
    });
  };

  const retryMistakeLesson = (mistake: Mistake) => {
    trackLocalEvent({
      type: 'mistakes_item_reviewed',
      screen: 'Profile',
      action: 'retry_lesson',
      metadata: { actionId: 'retry_lesson', lessonId: mistake.lessonId },
    });
    navigation.navigate('LessonIntro', { lessonId: mistake.lessonId });
  };

  const openTesterInfo = () => {
    const text = [
      'WortWeg Alpha Feedback',
      'Phone:',
      'OS: ' + Platform.OS + ' ' + String(Platform.Version),
      'App version: ' + APP_VERSION,
      'Environment: Private Alpha',
      'Backend host: ' + backendHost,
      'Mode: ' + (__DEV__ ? 'DEV' : 'Production'),
      'Onboarding completed: ' + String(userState.hasCompletedOnboarding),
      'Current level: ' + currentLevel,
      '',
      'Screen:',
      'What happened:',
      'Expected:',
      'Can reproduce: yes/no',
    ].join('\n');

    try {
      Clipboard.setString(text);
    } catch {
      // Selectable fallback remains available in the modal.
    }

    setTesterInfoText(text);
    setTesterInfoModalVisible(true);
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

  const openOnboardingDebug = async () => {
    const routeDecision = shouldShowOnboarding(userState) ? 'Onboarding' : 'Main/Home';
    const events = await getLocalEventLog();
    const lastBootEvent = [...events].reverse().find((event) => event.type === 'app_boot_decision');
    const lastBootLine = lastBootEvent
      ? lastBootEvent.timestamp + ' · ' + JSON.stringify(lastBootEvent.metadata ?? {})
      : 'Henüz app_boot_decision yok';

    setDebugText([
      'hasCompletedOnboarding: ' + String(userState.hasCompletedOnboarding),
      'hasOnboarded: ' + String(userState.hasOnboarded),
      'onboardingCompletedAt: ' + (userState.onboardingCompletedAt ?? '-'),
      'hasProfile: ' + String(Boolean(userState.profile)),
      'hasLearningPlan: ' + String(Boolean(userState.learningPlan)),
      'currentStartRouteDecision: ' + routeDecision,
      'lastBootEvent: ' + lastBootLine,
    ].join('\n'));
    setDebugModalVisible(true);
  };

  return (
    <Screen backgroundColor={colors.lavenderBackground}>
      <TopBar
        streak={userState.streak}
        subtitle={userState.profile?.goal ?? 'A1 yolculuğu'}
        title="Profil"
        xp={userState.xp}
      />
      <AppScrollView contentContainerStyle={styles.content} style={styles.scroll}>
        <View style={styles.heroSection}>
          <HalftoneAccent color={colors.yellowCta} opacity={0.11} size="small" style={styles.heroTexture} />
          <Text style={styles.heroTitle}>
            Seviye {level} · A1 %{a1Coverage}
          </Text>
          <Text style={styles.heroText}>
            Sonraki seviyeye {xpToNextLevel} XP kaldı. Günlük XP hedefi:
            {' '}
            {userState.profile?.dailyGoalXp ?? 20} XP.
          </Text>
        </View>

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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alpha bilgileri</Text>
          <Text style={styles.body}>Bir hata görürsen ekran görüntüsüyle birlikte test bilgilerini gönder.</Text>
          <View style={styles.infoList}>
            <InfoRow label="App" value={APP_NAME} />
            <InfoRow label="Ortam" value="Private Alpha" />
            <InfoRow label="Sürüm" value={APP_VERSION} />
            <InfoRow label="Build tarihi" value={ALPHA_BUILD_DATE} />
            <InfoRow label="Platform" value={Platform.OS} />
            {__DEV__ ? <InfoRow label="Mod" value="DEV / Expo" /> : null}
            <InfoRow label="Backend host" value={backendHost} />
          </View>
          {__DEV__ ? (
            <View style={styles.devStatusBox}>
              <InfoRow label="Backend" value={backendStatusLabel[backendStatus]} />
              <InfoRow label="Speech endpoint" value={yesNo(Boolean(backendUrl))} />
              <InfoRow label="Son speech debug" value={yesNo(hasSpeechDebug)} />
            </View>
          ) : null}
          <AppButton onPress={openTesterInfo} title="Test bilgilerini kopyala" variant="secondary" />
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
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Hatalar defteri</Text>
            {recentMistakes.length > 0 ? <Text style={styles.countPill}>{userState.mistakes.length}</Text> : null}
          </View>
          {recentMistakes.length === 0 ? (
            <EmptyState
              body="Henüz hata yok. Harika gidiyorsun."
              framed={false}
              icon={NotebookTabs}
              title="Temiz defter"
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
                              onPress={() => retryMistakeLesson(mistake)}
                              title="Tekrar çöz"
                              variant="secondary"
                              style={styles.rowButton}
                            />
                            <AppButton
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

        {__DEV__ ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DEV onboarding durumu</Text>
            <Text style={styles.body}>hasCompletedOnboarding: {String(userState.hasCompletedOnboarding)}</Text>
            <Text style={styles.body}>hasOnboarded: {String(userState.hasOnboarded)}</Text>
            <Text style={styles.body}>onboardingCompletedAt: {userState.onboardingCompletedAt ?? '-'}</Text>
            <Text style={styles.body}>hasProfile: {String(Boolean(userState.profile))}</Text>
            <Text style={styles.body}>hasLearningPlan: {String(Boolean(userState.learningPlan))}</Text>
            <Text style={styles.body}>route: {shouldShowOnboarding(userState) ? 'Onboarding' : 'Main/Home'}</Text>
            <AppButton
              onPress={() => void openOnboardingDebug()}
              title="Debug: Onboarding durumunu göster"
              variant="secondary"
            />
          </View>
        ) : null}

        <DevEventLogPanel onFeedbackPress={(eventLogText) => void openFeedbackDraft(eventLogText)} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Premium</Text>
          <Text style={styles.body}>
            Gelişmiş konuşma analizi, sınırsız AI pratik ve bulut senkronizasyonu
            ileride burada yönetilecek.
          </Text>
          {/* TODO: premium subscription with RevenueCat should be wired here. */}
        </View>

        <Modal
          animationType="slide"
          onRequestClose={() => setTesterInfoModalVisible(false)}
          transparent
          visible={testerInfoModalVisible}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.debugModal}>
              <Text style={styles.sectionTitle}>Test bilgileri</Text>
              <Text style={styles.body}>Panoya kopyalandı. Gerekirse metne uzun basıp tekrar seçebilirsin.</Text>
              <TextInput
                editable={false}
                multiline
                scrollEnabled
                selectTextOnFocus
                style={styles.testerInfoBox}
                value={testerInfoText}
              />
              <AppButton onPress={() => setTesterInfoModalVisible(false)} title="Kapat" variant="secondary" />
            </View>
          </View>
        </Modal>

        {__DEV__ ? (
          <Modal
            animationType="fade"
            onRequestClose={() => setDebugModalVisible(false)}
            transparent
            visible={debugModalVisible}
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.debugModal}>
                <Text style={styles.sectionTitle}>Onboarding debug</Text>
                <Text style={styles.debugText}>{debugText}</Text>
                <AppButton onPress={() => setDebugModalVisible(false)} title="Kapat" variant="secondary" />
              </View>
            </View>
          </Modal>
        ) : null}

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
    backgroundColor: colors.lavenderBackground,
  },
  content: {
    backgroundColor: colors.lavenderBackground,
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
    borderColor: colors.comicBorderColor,
    borderRadius: radius.lg,
    borderWidth: colors.comicBorderWidth,
    flexBasis: '30%',
    flexGrow: 1,
    gap: spacing.xs,
    minHeight: 80,
    justifyContent: 'center',
    padding: spacing.md,
    ...shadows.comicSmall,
  },
  statValue: {
    fontSize: 25,
    lineHeight: 30,
    color: colors.royalPurple,
    fontWeight: '900',
  },
  statLabel: {
    ...typography.small,
    color: colors.muted,
  },
  section: {
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.sm,
    padding: spacing.lg,
    ...shadows.comicSmall,
  },
  heroSection: {
    backgroundColor: colors.primaryPurple,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.sm,
    overflow: 'hidden',
    padding: spacing.xl,
    position: 'relative',
    ...shadows.lift,
  },
  heroTexture: {
    bottom: 0,
    position: 'absolute',
    right: -10,
    top: 0,
    width: 150,
  },
  heroTitle: {
    ...typography.heading,
    color: colors.white,
    fontWeight: '900',
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
  sectionHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  countPill: {
    ...typography.small,
    backgroundColor: colors.yellowCta,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.pill,
    borderWidth: colors.comicBorderWidth,
    color: colors.deepViolet,
    fontWeight: '900',
    minWidth: 28,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    textAlign: 'center',
  },
  body: {
    ...typography.body,
    color: colors.muted,
  },
  infoList: {
    gap: spacing.xs,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  infoLabel: {
    ...typography.small,
    color: colors.muted,
    flex: 1,
  },
  infoValue: {
    ...typography.small,
    color: colors.deepViolet,
    flex: 1,
    fontWeight: '800',
    textAlign: 'right',
  },
  devStatusBox: {
    backgroundColor: colors.paperLavender,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
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
    gap: spacing.xs,
    padding: spacing.md,
    shadowOpacity: 0,
    elevation: 0,
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
    backgroundColor: colors.comicYellowWash,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.pill,
    borderWidth: colors.comicBorderWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.comicSmall,
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
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(30,27,58,0.58)',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  debugModal: {
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.md,
    maxWidth: 520,
    padding: spacing.lg,
    width: '100%',
    ...shadows.lift,
  },
  debugText: {
    ...typography.small,
    color: colors.deepViolet,
    lineHeight: 20,
  },
  testerInfoBox: {
    ...typography.small,
    backgroundColor: colors.lavenderBackground,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.md,
    borderWidth: colors.comicBorderWidth,
    color: colors.deepViolet,
    minHeight: 260,
    padding: spacing.md,
    textAlignVertical: 'top',
  },
});
