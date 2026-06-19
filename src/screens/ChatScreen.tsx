import { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Send } from 'lucide-react-native';

import { AppButton } from '../components/AppButton';
import { Chip } from '../components/Chip';
import { HalftoneAccent } from '../components/HalftoneAccent';
import { Screen } from '../components/layout';
import { Mascot } from '../components/Mascot';
import { TopBar } from '../components/TopBar';
import { colors, radius, shadows, spacing, typography } from '../data/theme';
import type { CommitUserState } from '../navigation/AppNavigator';
import { generateTeacherReply } from '../services/aiTeacher';
import { trackLocalEvent } from '../services/localEventLog';
import type { ChatMessage } from '../types/ai';
import type { UserState } from '../types/userState';

type ChatScreenProps = {
  userState: UserState;
  onUpdateState: CommitUserState;
};

const starterChips = ['Mir geht es gut!', 'Wie heißt du?', 'Guten Morgen!', 'Danke!'];
const INTERNAL_AI_COPY_PATTERN = /(dev debug|mock|fallback|provider|modelused|model:|endpoint|backend url|timeout|network request failed|fetch-failed|http status|localhost|127\.0\.0\.1|192\.168|https?:\/\/)/i;
const OFFLINE_WOLLI_TEXT = 'Wolli şu anda çevrimdışı. Yine de kısa A1 cümlelerle pratik yapabiliriz.';

const sanitizeTeacherMessage = (text: string) => {
  const normalizedText = text.replace(
    /Şu an canlı AI bağlantısı yerine yerel Wolli yanıtı kullanılıyor\./g,
    'Wolli şu anda çevrimdışı.',
  );
  const visibleBlocks = normalizedText
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((block) => block && !INTERNAL_AI_COPY_PATTERN.test(block));

  return visibleBlocks.length > 0 ? visibleBlocks.join('\n\n') : OFFLINE_WOLLI_TEXT;
};

export function ChatScreen({ userState, onUpdateState }: ChatScreenProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const scrollToEnd = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  };

  useEffect(() => {
    trackLocalEvent({ type: 'ai_chat_opened', screen: 'Chat' });
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [sending, userState.chatMessages.length]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const showSubscription = Keyboard.addListener(showEvent, scrollToEnd);
    const frameSubscription = Keyboard.addListener('keyboardDidChangeFrame', scrollToEnd);

    return () => {
      showSubscription.remove();
      frameSubscription.remove();
    };
  }, []);

  const sendMessage = async () => {
    const text = message.trim();

    if (!text) {
      return;
    }

    setSending(true);
    setMessage('');

    const userMessage: ChatMessage = {
      id: `chat-user-${Date.now()}`,
      role: 'user',
      text,
      createdAt: new Date().toISOString(),
    };
    const reply = await generateTeacherReply({
      message: text,
      cefrLevel: 'A1',
      recentMessages: [...userState.chatMessages, userMessage].slice(-8),
    });
    const teacherMessage: ChatMessage = {
      id: `chat-teacher-${Date.now()}`,
      role: 'teacher',
      text: [
        reply.text,
        reply.corrections.length ? `Düzeltme: ${reply.corrections.join(' ')}` : '',
        reply.suggestions.length ? `Öneri: ${reply.suggestions.join(' ')}` : '',
      ]
        .filter(Boolean)
        .join('\n\n'),
      createdAt: new Date().toISOString(),
    };

    await onUpdateState((state) => ({
      ...state,
      chatMessages: [...state.chatMessages, userMessage, teacherMessage],
    }));
    setSending(false);
  };

  return (
    <Screen backgroundColor={colors.lavenderBackground}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
        style={styles.keyboard}
      >
        <TopBar
          streak={userState.streak}
          subtitle="Wolli ile A1 pratik"
          title="AI pratik"
          xp={userState.xp}
        />
        <ScrollView
          contentContainerStyle={styles.messages}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={scrollToEnd}
          ref={scrollRef}
        >
          {userState.chatMessages.length === 0 ? (
            <View style={styles.emptyState}>
              <HalftoneAccent color={colors.primaryPurple} opacity={0.08} size="small" style={styles.emptyTexture} />
              <View style={styles.aiIntroRow}>
                <View style={styles.aiAvatar}>
                  <Mascot size={54} />
                </View>
                <View style={styles.aiIntroCopy}>
                  <Text style={styles.kicker}>Wolli hazır</Text>
                  <Text style={styles.title}>A1 seviyesinde sor</Text>
                  <Text style={styles.body}>
                    Kısa Almanca cümleni yaz, Türkçe açıklamayla dönelim.
                  </Text>
                </View>
              </View>
              <View style={styles.starterChips}>
                {starterChips.map((starter) => (
                  <Chip
                    key={starter}
                    label={starter}
                    onPress={() => setMessage(starter)}
                    tone="purple"
                  />
                ))}
              </View>
            </View>
          ) : (
            userState.chatMessages.map((item) => {
              const visibleText = item.role === 'teacher' ? sanitizeTeacherMessage(item.text) : item.text;

              return (
                <View
                  key={item.id}
                  style={[
                    styles.bubble,
                    item.role === 'user' ? styles.userBubble : styles.teacherBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.bubbleText,
                      item.role === 'user' && styles.userBubbleText,
                    ]}
                  >
                    {visibleText}
                  </Text>
                </View>
              );
            })
          )}
        </ScrollView>
        <View style={styles.composer}>
          <TextInput
            multiline
            onChangeText={setMessage}
            placeholder="Örn. Ich bin Ali doğru mu?"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={message}
          />
          <AppButton
            disabled={!message.trim()}
            icon={Send}
            loading={sending}
            onPress={sendMessage}
            title="Gönder"
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.lavenderBackground,
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  messages: {
    backgroundColor: colors.lavenderBackground,
    flexGrow: 1,
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  emptyState: {
    backgroundColor: colors.white,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    gap: spacing.sm,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.comic,
  },
  aiIntroRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  aiAvatar: {
    alignItems: 'center',
    backgroundColor: colors.yellowCta,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.xl,
    borderWidth: colors.comicBorderWidth,
    height: 78,
    justifyContent: 'center',
    width: 78,
    ...shadows.comicSmall,
  },
  aiIntroCopy: {
    flex: 1,
    gap: 3,
  },
  kicker: {
    ...typography.micro,
    color: colors.primaryPurple,
    fontWeight: '900',
  },
  emptyTexture: {
    height: 110,
    position: 'absolute',
    right: -14,
    top: -14,
    width: 140,
  },
  title: {
    ...typography.heading,
    color: colors.deepViolet,
  },
  body: {
    ...typography.body,
    color: colors.muted,
  },
  starterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  bubble: {
    borderColor: colors.comicBorderColor,
    borderRadius: radius.lg,
    borderWidth: colors.comicBorderWidth,
    maxWidth: '88%',
    padding: spacing.md,
    ...shadows.comicSmall,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.royalPurple,
  },
  teacherBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
  },
  bubbleText: {
    ...typography.body,
    color: colors.deepViolet,
  },
  userBubbleText: {
    color: colors.white,
  },
  composer: {
    backgroundColor: colors.white,
    borderTopColor: colors.comicBorderColor,
    borderTopWidth: colors.comicBorderWidth,
    elevation: 4,
    gap: spacing.sm,
    padding: spacing.lg,
    shadowColor: colors.deepViolet,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 0,
    paddingBottom: spacing.xl,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.paperLavender,
    borderColor: colors.comicBorderColor,
    borderRadius: radius.md,
    borderWidth: colors.comicBorderWidth,
    color: colors.deepViolet,
    maxHeight: 110,
    minHeight: 54,
    padding: spacing.md,
  },
});
