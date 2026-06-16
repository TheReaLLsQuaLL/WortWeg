import { Volume2 } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';

import { colors, radius } from '../data/theme';
import { speakGerman } from '../lib/speech';

type SpeakerButtonProps = {
  text: string;
};

export function SpeakerButton({ text }: SpeakerButtonProps) {
  return (
    <Pressable
      accessibilityLabel="Almanca sesi oynat"
      accessibilityRole="button"
      onPress={() => speakGerman(text)}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Volume2 color={colors.deepViolet} size={20} strokeWidth={2.5} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.lavender,
    borderRadius: radius.sm,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  pressed: {
    opacity: 0.75,
  },
});
