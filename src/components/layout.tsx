import type { ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
  type Edge,
} from 'react-native-safe-area-context';

import { colors, spacing } from '../data/theme';

export const layout = {
  screenPadding: spacing.lg,
  bottomTabBaseHeight: 72,
  detailFooterBaseHeight: 84,
  minTouchTarget: 44,
};

type ScreenProps = {
  backgroundColor?: string;
  children: ReactNode;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
};

export function Screen({
  backgroundColor = colors.surface,
  children,
  edges = ['top'],
  style,
}: ScreenProps) {
  return (
    <SafeAreaView edges={edges} style={[styles.screen, { backgroundColor }, style]}>
      {children}
    </SafeAreaView>
  );
}

export function SafeScreen({
  edges = ['top', 'bottom'],
  ...props
}: ScreenProps) {
  return <Screen edges={edges} {...props} />;
}

type AppScrollViewProps = ScrollViewProps & {
  bottomInset?: number;
  includeSafeAreaBottom?: boolean;
};

export function AppScrollView({
  bottomInset = 0,
  children,
  contentContainerStyle,
  includeSafeAreaBottom = true,
  keyboardShouldPersistTaps = 'handled',
  ...props
}: AppScrollViewProps) {
  const insets = useSafeAreaInsets();
  const paddingBottom =
    spacing.xxxl + bottomInset + (includeSafeAreaBottom ? insets.bottom : 0);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      {...props}
      contentContainerStyle={[contentContainerStyle, { paddingBottom }]}
    >
      {children}
    </ScrollView>
  );
}

type BottomSpacerProps = {
  height?: number;
  style?: StyleProp<ViewStyle>;
};

export function BottomSpacer({ height = 0, style }: BottomSpacerProps) {
  const insets = useSafeAreaInsets();

  return <View style={[{ height: height + insets.bottom }, style]} />;
}

export function useBottomTabBarHeight() {
  const insets = useSafeAreaInsets();

  return layout.bottomTabBaseHeight + Math.max(insets.bottom, spacing.sm);
}

export function useDetailFooterSpacing() {
  const insets = useSafeAreaInsets();
  const footerPaddingBottom = spacing.lg + insets.bottom;

  return {
    contentPaddingBottom:
      layout.detailFooterBaseHeight + insets.bottom + spacing.xxxl,
    footerPaddingBottom,
  };
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
