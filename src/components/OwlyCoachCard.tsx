import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OwlyMascot, type OwlyState } from './OwlyMascot';
import { AppButton } from './AppButton';
import { colors, radius, shadows, spacing, typography } from '../data/theme';

export type CoachCardState = 'normal' | 'weakPoint' | 'practice' | 'success';

type OwlyCoachCardProps = {
  state: CoachCardState;
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  style?: any;
};

export function OwlyCoachCard({ state, title, message, actionText, onAction, style }: OwlyCoachCardProps) {
  const mascotState: OwlyState = useMemo(() => {
    switch (state) {
      case 'weakPoint': return 'thinking';
      case 'practice': return 'listening';
      case 'success': return 'success';
      case 'normal':
      default:
        return 'idle';
    }
  }, [state]);

  const backgroundColor = useMemo(() => {
    switch (state) {
      case 'weakPoint': return colors.midnightSurface;
      case 'success': return colors.successGreen + '20'; // Tinted green
      case 'practice': return colors.comicBlueWash;
      default: return colors.white;
    }
  }, [state]);

  const textColor = state === 'weakPoint' ? colors.white : colors.deepViolet;

  return (
    <View style={[styles.card, { backgroundColor }, style]}>
      <View style={styles.mascotContainer}>
        <OwlyMascot state={mascotState} width={100} height={100} />
      </View>
      <View style={styles.content}>
        <View style={styles.bubble}>
          <Text style={styles.bubbleTitle}>{title}</Text>
          <Text style={styles.bubbleMessage}>{message}</Text>
          <View style={styles.bubbleTail} />
        </View>
        
        {actionText && onAction && (
          <AppButton 
            title={actionText} 
            onPress={onAction} 
            variant={state === 'weakPoint' ? 'primary' : 'secondary'}
            style={styles.actionButton}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: radius.xl,
    padding: spacing.md,
    ...shadows.comic,
    alignItems: 'center',
    gap: spacing.md,
  },
  mascotContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
  },
  content: {
    flex: 1,
    alignItems: 'flex-start',
  },
  bubble: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.comicSmall,
    position: 'relative',
    marginBottom: spacing.md,
    alignSelf: 'stretch',
    borderWidth: 2,
    borderColor: colors.comicBorderColor,
  },
  bubbleTail: {
    position: 'absolute',
    left: -10,
    top: '50%',
    marginTop: -10,
    width: 0,
    height: 0,
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderRightWidth: 10,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: colors.white,
  },
  bubbleTitle: {
    ...typography.body,
    fontWeight: '900',
    color: colors.deepViolet,
    marginBottom: spacing.xs,
  },
  bubbleMessage: {
    ...typography.small,
    color: colors.muted,
    fontWeight: '700',
  },
  actionButton: {
    alignSelf: 'stretch',
  },
});
