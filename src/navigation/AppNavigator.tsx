import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import { colors } from '../data/theme';
import { TabBar, type TabKey } from '../components/TabBar';
import { ChatScreen } from '../screens/ChatScreen';
import { ExamResultScreen } from '../screens/ExamResultScreen';
import { ExamScreen } from '../screens/ExamScreen';
import { ExercisePlayerScreen } from '../screens/ExercisePlayerScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LessonIntroScreen } from '../screens/LessonIntroScreen';
import { CurriculumMapScreen } from '../screens/CurriculumMapScreen';
import { LevelOverviewScreen } from '../screens/LevelOverviewScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { PlanOverviewScreen } from '../screens/PlanOverviewScreen';
import { PlanSetupScreen } from '../screens/PlanSetupScreen';
import { PlacementResultScreen } from '../screens/PlacementResultScreen';
import { PlacementTestScreen } from '../screens/PlacementTestScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SpeakingPracticeScreen } from '../screens/SpeakingPracticeScreen';
import { VocabScreen } from '../screens/VocabScreen';
import {
  defaultUserState,
  loadUserState,
  saveUserState,
  resetUserState,
} from '../lib/storage';
import type { CurriculumLevelId } from '../types/curriculum';
import type { LearningPlanInput } from '../types/learningPlan';
import type { PlacementResult } from '../types/placement';
import type { UserState } from '../types/userState';
import type { OnboardingCompletion } from '../services/onboardingService';

export type RootStackParamList = {
  Onboarding: undefined;
  PlacementTest: { setup: LearningPlanInput; profileName?: string };
  PlacementResult: { setup: LearningPlanInput; profileName?: string; result: PlacementResult };
  Main: { initialTab?: TabKey } | undefined;
  LessonIntro: { lessonId: string };
  ExercisePlayer: { lessonId: string };
  SpeakingPractice: { promptId?: string };
  PlanOverview: undefined;
  PlanSetup: { mode?: 'edit' } | undefined;
  CurriculumMap: undefined;
  LevelOverview: { levelId: CurriculumLevelId };
  ExamResult: { score: number; totalCount: number; xpEarned: number };
};

export type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

export type CommitUserState = (
  updater: (state: UserState) => UserState,
) => Promise<UserState>;

const Stack = createNativeStackNavigator<RootStackParamList>();

type MainTabsProps = {
  navigation: RootNavigation;
  userState: UserState;
  onUpdateState: CommitUserState;
  onResetApp: () => Promise<void>;
};

function MainTabs({ navigation, userState, onUpdateState, onResetApp, initialTab }: MainTabsProps & { initialTab?: TabKey }) {
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab ?? 'home');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <View style={styles.shell}>
      <View style={styles.content}>
        {activeTab === 'home' ? (
          <HomeScreen navigation={navigation} userState={userState} />
        ) : null}
        {activeTab === 'vocab' ? (
          <VocabScreen userState={userState} onUpdateState={onUpdateState} />
        ) : null}
        {activeTab === 'chat' ? (
          <ChatScreen userState={userState} onUpdateState={onUpdateState} />
        ) : null}
        {activeTab === 'exam' ? (
          <ExamScreen
            navigation={navigation}
            userState={userState}
            onUpdateState={onUpdateState}
          />
        ) : null}
        {activeTab === 'profile' ? (
          <ProfileScreen
            navigation={navigation}
            userState={userState}
            onUpdateState={onUpdateState}
            onResetApp={onResetApp}
          />
        ) : null}
      </View>
      <TabBar activeTab={activeTab} onTabPress={setActiveTab} />
    </View>
  );
}

export function AppNavigator() {
  const [userState, setUserState] = useState<UserState | null>(null);

  useEffect(() => {
    loadUserState().then(setUserState);
  }, []);

  const commitUserState = useCallback<CommitUserState>(
    async (updater) => {
      const baseState = userState ?? defaultUserState;
      const nextState = updater(baseState);
      setUserState(nextState);
      await saveUserState(nextState);
      return nextState;
    },
    [userState],
  );

  const completeOnboarding = useCallback(
    async ({ learningPlan, placementResult, profile }: OnboardingCompletion) => {
      const nextState: UserState = {
        ...defaultUserState,
        hasOnboarded: true,
        profile,
        learningPlan,
        placementResult,
      };
      setUserState(nextState);
      await saveUserState(nextState);
    },
    [],
  );

  const resetAppState = useCallback(async () => {
    await resetUserState();
    setUserState(defaultUserState);
  }, []);

  if (!userState) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.royalPurple} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!userState.hasOnboarded ? (
          <>
            <Stack.Screen name="Onboarding">
              {({ navigation }) => (
                <OnboardingScreen
                  navigation={navigation}
                  onComplete={completeOnboarding}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="PlacementTest">
              {({ navigation, route }) => (
                <PlacementTestScreen navigation={navigation} route={route} />
              )}
            </Stack.Screen>
            <Stack.Screen name="PlacementResult">
              {({ route }) => (
                <PlacementResultScreen
                  route={route}
                  onComplete={completeOnboarding}
                />
              )}
            </Stack.Screen>
          </>
        ) : (
          <>
            <Stack.Screen name="Main">
              {({ navigation, route }) => (
                <MainTabs
                  navigation={navigation}
                  userState={userState}
                  onUpdateState={commitUserState}
                  onResetApp={resetAppState}
                  initialTab={route.params?.initialTab}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="LessonIntro">
              {({ navigation, route }) => (
                <LessonIntroScreen navigation={navigation} route={route} />
              )}
            </Stack.Screen>
            <Stack.Screen name="ExercisePlayer">
              {({ navigation, route }) => (
                <ExercisePlayerScreen
                  navigation={navigation}
                  route={route}
                  userState={userState}
                  onUpdateState={commitUserState}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="SpeakingPractice">
              {({ navigation, route }) => (
                <SpeakingPracticeScreen navigation={navigation} route={route} />
              )}
            </Stack.Screen>
            <Stack.Screen name="PlanOverview">
              {({ navigation }) => (
                <PlanOverviewScreen
                  navigation={navigation}
                  userState={userState}
                  onUpdateState={commitUserState}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="PlanSetup">
              {({ navigation }) => (
                <PlanSetupScreen
                  navigation={navigation}
                  userState={userState}
                  onUpdateState={commitUserState}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="CurriculumMap">
              {({ navigation }) => (
                <CurriculumMapScreen navigation={navigation} userState={userState} />
              )}
            </Stack.Screen>
            <Stack.Screen name="LevelOverview">
              {({ navigation, route }) => (
                <LevelOverviewScreen navigation={navigation} route={route} />
              )}
            </Stack.Screen>
            <Stack.Screen name="ExamResult" component={ExamResultScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: colors.surface,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  loading: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    flex: 1,
    justifyContent: 'center',
  },
});
