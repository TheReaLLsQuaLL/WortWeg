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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send } from 'lucide-react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../components/AppButton';
import { Chip } from '../components/Chip';
import { HalftoneAccent } from '../components/HalftoneAccent';
import { InlineLoadingDots } from '../components/InlineLoadingDots';
import { AppScrollView, Screen } from '../components/layout';
import { OwlyMascot } from '../components/OwlyMascot';
import { TopBar } from '../components/TopBar';
import { getLessonById, getNextPlayableLesson, isB1PreviewLessonId } from '../data/lessons';
import { colors, radius, shadows, spacing, typography } from '../data/theme';
import type { CommitUserState, RootStackParamList } from '../navigation/AppNavigator';
import { generateTeacherReply } from '../services/aiTeacher';
import { trackLocalEvent } from '../services/localEventLog';
import type { ChatMessage, LessonContext } from '../types/ai';
import type { UserState } from '../types/userState';

type ChatScreenProps = NativeStackScreenProps<RootStackParamList, 'Chat'> & {
  userState: UserState;
  onUpdateState: CommitUserState;
};

const starterChips = ['Mir geht es gut!', 'Wie heißt du?', 'Guten Morgen!', 'Danke!'];
const lessonStarterChips = [
  'Bu dersi kısaca açıkla',
  'Bu dersten 3 kelime sor',
  'Bir örnek cümle kur',
  'Mini pratik yapalım',
];
const b1PreviewStarterChips = [
  'Bu B1 ön izleme konusunu açıkla',
  'Bana 3 örnek ver',
  'Kısa konuşma pratiği yap',
  'A2’ye bağla',
];
const INTERNAL_AI_COPY_PATTERN = /(dev debug|mock|fallback|provider|modelused|model:|endpoint|backend url|timeout|network request failed|fetch-failed|http status|localhost|127\.0\.0\.1|192\.168|https?:\/\/)/i;
const OFFLINE_WOLLI_TEXT = 'Wolli şu anda çevrimdışı. A0/A1/A2 ve kısa B1 Ön İzleme konularında basit pratik yapabiliriz.';

/**
 * Maps the learner's current plan level to the cefrLevel accepted by TeacherInput.
 * - A0 maps to 'A1' (lowest level the AI type supports; A0 content is simple enough for A1-style prompting).
 * - A1, A2, B1 pass through directly.
 * - B2, C1, C2 are clamped to 'B1' (the alpha max; full B2+ is not yet playable).
 * - Falls back to 'A1' if no plan exists.
 */
const getTeacherCefrLevel = (userState: UserState): 'A1' | 'A2' | 'B1' => {
  const planLevel = userState.learningPlan?.currentLevel;
  if (planLevel === 'A2') return 'A2';
  if (planLevel === 'B1') return 'B1';
  // A0 and missing → A1 (safe floor). B2/C1/C2 → B1 (alpha ceiling).
  return 'A1';
};

const buildLessonContext = (userState: UserState): LessonContext | undefined => {
  const recentProgressLessonId = Object.values(userState.lessonProgress)
    .filter((progress) => Boolean(getLessonById(progress.lessonId)))
    .sort((a, b) => b.lastStudiedAt.localeCompare(a.lastStudiedAt))[0]?.lessonId;
  const latestCompletedLessonId = [...userState.completedLessons]
    .reverse()
    .find((lessonId) => Boolean(getLessonById(lessonId)));
  const nextLesson = getNextPlayableLesson(userState.completedLessons, userState.learningPlan);
  const planLesson = userState.learningPlan?.currentModuleId
    ? getLessonById(userState.learningPlan.currentModuleId)
    : undefined;
  const lesson = recentProgressLessonId
    ? getLessonById(recentProgressLessonId)
    : nextLesson ?? planLesson ?? (latestCompletedLessonId ? getLessonById(latestCompletedLessonId) : undefined);

  if (!lesson) {
    return undefined;
  }

  return {
    lessonId: lesson.id,
    level: lesson.cefr,
    title: lesson.title,
    grammarLabels: lesson.grammar.map((note) => note.title).slice(0, 5),
    vocabularyHeadwords: lesson.vocabulary.map((word) => word.german).slice(0, 5),
    isB1Preview: isB1PreviewLessonId(lesson.id),
  };
};

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

export function ChatScreen({ route, userState, onUpdateState }: ChatScreenProps) {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendingSlow, setSendingSlow] = useState(false);
  const slowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasConsumedInitialPromptRef = useRef(false);
  const scrollRef = useRef<ScrollView>(null);
  const lessonContext = buildLessonContext(userState);
  const activeStarterChips = lessonContext
    ? lessonContext.isB1Preview
      ? b1PreviewStarterChips
      : lessonStarterChips
    : starterChips;

  const scrollToEnd = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  };

  useEffect(() => {
    trackLocalEvent({ type: 'ai_chat_opened', screen: 'Chat' });
  }, []);

  useEffect(() => {
    const initialPrompt = route.params?.initialPrompt;
    if (initialPrompt && !hasConsumedInitialPromptRef.current && message.trim() === '') {
      setMessage(initialPrompt);
      hasConsumedInitialPromptRef.current = true;
    }
  }, [route.params?.initialPrompt, message]);

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
    setSendingSlow(false);
    setMessage('');

    // Show a warm slow-backend hint after 4 s so cold-starts feel intentional.
    slowTimerRef.current = setTimeout(() => {
      setSendingSlow(true);
    }, 4000);

    const userMessage: ChatMessage = {
      id: `chat-user-${Date.now()}`,
      role: 'user',
      text,
      createdAt: new Date().toISOString(),
    };

    try {
      const reply = await generateTeacherReply({
        message: text,
        cefrLevel: getTeacherCefrLevel(userState),
        recentMessages: [...userState.chatMessages, userMessage].slice(-8),
        lessonContext,
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
    } catch {
      // generateTeacherReply has its own fallback; swallow here to avoid
      // exposing technical error details to the user.
      await onUpdateState((state) => ({
        ...state,
        chatMessages: [
          ...state.chatMessages,
          userMessage,
          {
            id: `chat-teacher-${Date.now()}`,
            role: 'teacher' as const,
            text: 'Wolli şu anda cevap veremedi. Biraz bekleyip tekrar dene.',
            createdAt: new Date().toISOString(),
          },
        ],
      }));
    } finally {
      if (slowTimerRef.current) {
        clearTimeout(slowTimerRef.current);
        slowTimerRef.current = null;
      }
      setSending(false);
      setSendingSlow(false);
    }
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
          subtitle={`Wolli ile ${getTeacherCefrLevel(userState)} pratik`}
          title="AI pratik"
          xp={userState.xp}
        />
        <AppScrollView
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
                  <OwlyMascot state={sending ? "thinking" : "idle"} width={54} height={54} />
                </View>
                <View style={styles.aiIntroCopy}>
                  <Text style={styles.kicker}>Wolli hazır</Text>
                  <Text style={styles.title}>Almanca pratik sor</Text>
                  <Text style={styles.body}>
                    {lessonContext
                      ? lessonContext.isB1Preview
                        ? 'Bu kısa B1 Ön İzleme konusunu A2 temelinle bağlayarak çalış.'
                        : lessonContext.title + ' dersinden kısa pratik yap.'
                      : 'A0/A1/A2 veya kısa B1 Ön İzleme konularını Türkçe açıklamayla çalış.'}
                  </Text>
                </View>
              </View>
              {lessonContext ? (
                <Text style={styles.contextLabel}>Derse göre: {lessonContext.title}</Text>
              ) : null}
              <View style={styles.starterChips}>
                {activeStarterChips.map((starter) => (
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

          {sending ? (
            <View style={[styles.bubble, styles.teacherBubble, styles.typingBubble]}>
              {sendingSlow ? (
                <Text style={styles.typingSlowText}>
                  Wolli düşünüyor, biraz sabır…
                </Text>
              ) : (
                <InlineLoadingDots color={colors.primaryPurple} size={6} />
              )}
            </View>
          ) : null}
        </AppScrollView>
        <View style={[styles.composer, { paddingBottom: spacing.xl + insets.bottom }]}>
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
  contextLabel: {
    ...typography.small,
    color: colors.muted,
    fontWeight: '800',
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
  typingBubble: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 64,
  },
  typingSlowText: {
    ...typography.small,
    color: colors.muted,
    fontStyle: 'italic',
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
