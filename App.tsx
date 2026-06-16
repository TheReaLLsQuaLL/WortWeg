import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from './src/data/theme';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar
        backgroundColor={colors.deepViolet}
        style="light"
        translucent={false}
      />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
