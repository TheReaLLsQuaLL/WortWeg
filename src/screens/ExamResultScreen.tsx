import { Trophy } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../components/AppButton';
import { Mascot } from '../components/Mascot';
import { colors, radius, spacing, typography } from '../data/theme';
import type { RootStackParamList } from '../navigation/AppNavigator';

type ExamResultScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ExamResult'
>;

export function ExamResultScreen({ navigation, route }: ExamResultScreenProps) {
  const { score, totalCount, xpEarned } = route.params;
  const percent = totalCount > 0 ? Math.round((score / totalCount) * 100) : 0;
  const passed = percent >= 60;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Mascot size={96} />
        <View style={styles.card}>
          <Trophy color={colors.yellow} fill={colors.yellow} size={42} />
          <Text style={styles.title}>A1 pratiği tamamlandı</Text>
          <Text style={styles.score}>
            %{percent}
          </Text>
          <Text style={[styles.status, { color: passed ? colors.green : colors.red }]}>
            {passed ? 'Geçme hedefini tutturdun' : 'Biraz daha tekrar gerekiyor'}
          </Text>
          <Text style={styles.body}>
            {score}/{totalCount} doğru · {xpEarned} XP kazandın. Yanlışların ve yazma/konuşma geri bildirimleri
            tekrar çalışman için saklanabilir.
          </Text>
          <AppButton onPress={() => navigation.navigate('Main')} title="Ana ekrana dön" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.deepViolet,
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flexGrow: 1,
    gap: spacing.xl,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    gap: spacing.md,
    padding: spacing.xl,
    width: '100%',
  },
  title: {
    ...typography.heading,
    color: colors.deepViolet,
    textAlign: 'center',
  },
  score: {
    color: colors.royalPurple,
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 56,
  },
  body: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
  },
  status: {
    ...typography.body,
    fontWeight: '900',
    textAlign: 'center',
  },
});
