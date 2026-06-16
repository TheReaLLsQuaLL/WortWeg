import {
  BookOpen,
  ClipboardList,
  Home,
  MessageCircle,
  User,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, typography } from '../data/theme';
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
            android_ripple={{ color: colors.lavender, borderless: false }}
            key={key}
            onPress={() => onTabPress(key)}
            style={({ pressed }) => [
              styles.tab,
              active && styles.activeTab,
              pressed && styles.pressed,
            ]}
          >
            <Icon
              color={active ? colors.white : colors.muted}
              size={20}
              strokeWidth={2.4}
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
    borderTopColor: colors.border,
    borderTopWidth: 1,
    elevation: 12,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    shadowColor: colors.deepViolet,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  tab: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    gap: 3,
    justifyContent: 'center',
    minHeight: 54,
    paddingVertical: spacing.xs,
  },
  activeTab: {
    backgroundColor: colors.deepViolet,
  },
  label: {
    ...typography.small,
    color: colors.muted,
    fontSize: 11,
    lineHeight: 14,
  },
  activeLabel: {
    color: colors.white,
  },
  pressed: {
    opacity: 0.8,
  },
});
