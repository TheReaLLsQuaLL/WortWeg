import { MessageCircle, Mic } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppCard } from '../components/AppCard';
import { HalftoneAccent } from '../components/HalftoneAccent';
import { AppScrollView, Screen } from '../components/layout';
import { TopBar } from '../components/TopBar';
import { colors, radius, shadows, spacing, typography } from '../data/theme';
import type { RootNavigation } from '../navigation/AppNavigator';
import { trackLocalEvent } from '../services/localEventLog';
import { useEffect } from 'react';
import type { UserState } from '../types/userState';

type PracticeHubScreenProps = {
  navigation: RootNavigation;
  userState: UserState;
};

type HubCardProps = {
  icon: typeof MessageCircle;
  title: string;
  body: string;
  accent: string;
  onPress: () => void;
};

function HubCard({ icon: Icon, title, body, accent, onPress }: HubCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      android_ripple={{ color: 'rgba(23,23,42,0.07)', foreground: true }}
      onPress={onPress}
      style={({ pressed }) => [styles.cardPressable, pressed && styles.cardPressed]}
    >
      <AppCard style={styles.card}>
        <HalftoneAccent color={accent} opacity={0.07} size="small" style={styles.cardTexture} />
        <View style={[styles.iconWrap, { backgroundColor: accent + '22', borderColor: accent }]}>
          <Icon color={accent} size={28} strokeWidth={2.6} />
        </View>
        <View style={styles.cardCopy}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardBody}>{body}</Text>
        </View>
        <View style={[styles.arrow, { borderColor: accent }]}>
          <Text style={[styles.arrowText, { color: accent }]}>→</Text>
        </View>
      </AppCard>
    </Pressable>
  );
}

export function PracticeHubScreen({ navigation, userState }: PracticeHubScreenProps) {
  useEffect(() => {
    trackLocalEvent({ type: 'ai_chat_opened', screen: 'PracticeHub' });
  }, []);

  return (
    <Screen backgroundColor={colors.lavenderBackground}>
      <TopBar
        streak={userState.streak}
        subtitle="Wolli veya sesli pratik seç"
        title="Pratik"
        xp={userState.xp}
      />
      <AppScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.kicker}>
          <Text style={styles.kickerText}>Ne yapmak istiyorsun?</Text>
        </View>

        <HubCard
          icon={MessageCircle}
          title="Wolli ile yazış"
          body="Sorularını yaz, kısa Almanca açıklamalar ve örnekler al."
          accent={colors.primaryPurple}
          onPress={() => navigation.navigate('Chat')}
        />

        <HubCard
          icon={Mic}
          title="Sesli pratik yap"
          body="Almanca cümleleri söyle, telaffuzunu kontrol et."
          accent={colors.green}
          onPress={() => navigation.navigate('SpeakingLibrary')}
        />
      </AppScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: spacing.md,
    paddingBottom: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  kicker: {
    paddingBottom: spacing.xs,
  },
  kickerText: {
    ...typography.body,
    color: colors.muted,
    fontWeight: '800',
  },
  cardPressable: {
    borderRadius: radius.xl,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ translateY: 2 }],
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    overflow: 'hidden',
    position: 'relative',
  },
  cardTexture: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 2,
    height: 60,
    justifyContent: 'center',
    width: 60,
    flexShrink: 0,
  },
  cardCopy: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    ...typography.body,
    color: colors.ink,
    fontWeight: '900',
  },
  cardBody: {
    ...typography.small,
    color: colors.muted,
    fontWeight: '600',
    lineHeight: 18,
  },
  arrow: {
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 32,
    justifyContent: 'center',
    width: 32,
    flexShrink: 0,
  },
  arrowText: {
    fontSize: 16,
    fontWeight: '900',
  },
});
