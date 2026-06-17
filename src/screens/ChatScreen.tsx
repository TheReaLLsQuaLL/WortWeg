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
import { Screen } from '../components/layout';
import { TopBar } from '../components/TopBar';
import { colors, radius, spacing, typography } from '../data/theme';
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
    <Screen backgroundColor={colors.deepViolet}>
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
              <Text style={styles.title}>A1 seviyesinde sor</Text>
              <Text style={styles.body}>
                Türkçe açıklama isteyebilir veya kısa Almanca cümleni yazıp
                geri bildirim alabilirsin.
              </Text>
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
            userState.chatMessages.map((item) => (
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
                  {item.text}
                </Text>
              </View>
            ))
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
    backgroundColor: colors.deepViolet,
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  messages: {
    backgroundColor: colors.surface,
    flexGrow: 1,
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  emptyState: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
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
  },
  bubble: {
    borderRadius: radius.md,
    maxWidth: '88%',
    padding: spacing.md,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.royalPurple,
  },
  teacherBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
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
    borderTopColor: colors.border,
    borderTopWidth: 1,
    elevation: 8,
    gap: spacing.sm,
    padding: spacing.lg,
    shadowColor: colors.deepViolet,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    paddingBottom: spacing.xl,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.deepViolet,
    maxHeight: 110,
    minHeight: 54,
    padding: spacing.md,
  },
});
