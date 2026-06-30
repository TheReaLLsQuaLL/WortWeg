import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, Mic } from 'lucide-react-native';
import { Screen } from '../components/layout';
import { OwlyMascot, type OwlyState } from '../components/OwlyMascot';
import { colors, radius, shadows, spacing, typography } from '../data/theme';
import type { RootNavigation } from '../navigation/AppNavigator';
import type { UserState } from '../types/userState';
import { buildOwlyContext } from '../services/owlyContext';

type OwlyTalkScreenProps = {
  navigation: RootNavigation;
  userState: UserState;
};

export function OwlyTalkScreen({ navigation, userState }: OwlyTalkScreenProps) {
  const [mascotState, setMascotState] = useState<OwlyState>('idle');
  const [conversation, setConversation] = useState<{ role: 'user' | 'coach', text: string }[]>([
    { role: 'coach', text: "Hallo! Schön dich zu sehen. Heute üben wir Deutsch." }
  ]);
  const [owlyMinutesToday] = useState(0); // Mock limitation

  // Safe context extraction example
  const safeContext = buildOwlyContext(userState);

  // Simple prototype interaction sequence
  const startRecording = () => {
    if (mascotState !== 'idle') return;
    
    setMascotState('listening');
    
    // Simulate user finishing speaking after 2 seconds
    setTimeout(() => {
      setConversation(prev => [...prev, { role: 'user', text: "Ich habe gestern gegangen." }]);
      setMascotState('thinking');
      
      // Simulate Owly answering after 1.5 seconds of thinking
      setTimeout(() => {
        setMascotState('talking');
        setConversation(prev => [...prev, { 
          role: 'coach', 
          text: "Fast! Bei 'gehen' benutzen wir 'sein': Ich bin gestern gegangen." 
        }]);
        
        // Return to idle after talking
        setTimeout(() => {
          setMascotState('idle');
        }, 3000);
      }, 1500);
    }, 2000);
  };

  const isFreeTier = true; // Prototype mock

  return (
    <Screen backgroundColor={colors.midnightBackground}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={styles.iconButton}
        >
          <ArrowLeft color={colors.white} size={22} />
        </Pressable>
        <Text style={styles.headerTitle}>Owly Coach</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.mascotArea}>
        <OwlyMascot state={mascotState} width={240} height={240} />
      </View>

      <View style={styles.chatArea}>
        {conversation.map((msg, idx) => (
          <View key={idx} style={[
            styles.bubble,
            msg.role === 'coach' ? styles.coachBubble : styles.userBubble
          ]}>
            <Text style={msg.role === 'coach' ? styles.coachText : styles.userText}>
              {msg.text}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.controlsArea}>
        {isFreeTier ? (
          <Text style={styles.limitText}>
            {2 - owlyMinutesToday} minutes remaining (Unlimited with Premium)
          </Text>
        ) : null}
        
        <Pressable 
          style={[styles.micButton, mascotState === 'listening' && styles.micButtonActive]}
          onPress={startRecording}
          disabled={mascotState !== 'idle'}
        >
          <Mic color={mascotState === 'listening' ? colors.white : colors.deepViolet} size={32} strokeWidth={2.5} />
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.midnightSurface,
    borderRadius: radius.pill,
  },
  headerTitle: {
    ...typography.heading,
    color: colors.white,
    fontSize: 20,
  },
  mascotArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    flex: 1,
  },
  chatArea: {
    padding: spacing.lg,
    flex: 1.5,
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  bubble: {
    padding: spacing.md,
    borderRadius: radius.xl,
    maxWidth: '85%',
    ...shadows.comicSmall,
  },
  coachBubble: {
    backgroundColor: colors.white,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: colors.cyanAccent,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  coachText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.deepViolet,
  },
  userText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.deepViolet,
  },
  controlsArea: {
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.midnightSurface,
    borderTopWidth: 2,
    borderTopColor: colors.midnightAccent,
  },
  limitText: {
    ...typography.small,
    color: colors.muted,
    marginBottom: spacing.md,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.yellowCta,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.comic,
  },
  micButtonActive: {
    backgroundColor: colors.errorCoral,
  },
});
