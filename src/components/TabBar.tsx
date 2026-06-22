import {
  BookOpen,
  ClipboardList,
  Home,
  MessageCircle,
  User,
  type LucideIcon,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, shadows, spacing, typography } from '../data/theme';
import { layout } from './layout';

export type TabKey = 'home' | 'vocab' | 'chat' | 'exam' | 'profile';

type TabItem = {
  key: TabKey;
  label: string;
  Icon: LucideIcon;
};

const tabs: TabItem[] = [
  { key: 'home', label: 'Yol', Icon: Home },
  { key: 'vocab', label: 'Kelime', Icon: BookOpen },
  { key: 'chat', label: 'AI', Icon: MessageCircle },
  { key: 'exam', label: 'Sınav', Icon: ClipboardList },
  { key: 'profile', label: 'Profil', Icon: User },
];

type TabBarProps = {
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
};

export function TabBar({ activeTab, onTabPress }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, spacing.sm);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  if (keyboardVisible) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          minHeight: layout.bottomTabBaseHeight + bottomPadding,
          paddingBottom: bottomPadding,
        },
      ]}
    >
      {tabs.map(({ key, label, Icon }) => {
        const active = key === activeTab;
        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            android_ripple={{ color: 'rgba(23,23,42,0.08)', borderless: false }}
            key={key}
            onPress={() => onTabPress(key)}
            style={({ pressed }) => [
              styles.tab,
              active && styles.activeTab,
              pressed && styles.pressed,
            ]}
          >
            <Icon
              color={active ? colors.comicBorderColor : colors.muted}
              size={20}
              strokeWidth={2.8}
            />
            <Text style={[styles.label, active && styles.activeLabel]} numberOfLines={1}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderTopColor: colors.comicBorderColor,
    borderTopWidth: colors.comicBorderWidth,
    elevation: 16,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    shadowColor: colors.comicShadowTint,
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.18,
    shadowRadius: 0,
  },
  tab: {
    alignItems: 'center',
    borderRadius: radius.md,
    flex: 1,
    gap: 3,
    justifyContent: 'center',
    minHeight: 56,
    paddingVertical: spacing.xs,
  },
  activeTab: {
    backgroundColor: colors.yellowCta,
    borderColor: colors.comicBorderColor,
    borderWidth: 2,
    ...shadows.comicSmall,
  },
  label: {
    ...typography.small,
    color: colors.muted,
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 14,
  },
  activeLabel: {
    color: colors.comicBorderColor,
  },
  pressed: {
    opacity: 0.82,
  },
});
