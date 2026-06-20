import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
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
import { MistakesScreen } from '../screens/MistakesScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { PlanOverviewScreen } from '../screens/PlanOverviewScreen';
import { PlanSetupScreen } from '../screens/PlanSetupScreen';
import { PlacementResultScreen } from '../screens/PlacementResultScreen';
import { PlacementTestScreen } from '../screens/PlacementTestScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SpeakingLibraryScreen } from '../screens/SpeakingLibraryScreen';
import { SpeakingPracticeScreen } from '../screens/SpeakingPracticeScreen';
import { VocabScreen } from '../screens/VocabScreen';
import {
  defaultUserState,
  loadUserState,
  saveUserState,
  resetUserState,
  shouldShowOnboarding,
  getLastStorageRepairInfo,
} from '../lib/storage';
import type { CurriculumLevelId } from '../types/curriculum';
import type { LearningPlanInput } from '../types/learningPlan';
import type { PlacementResult } from '../types/placement';
import type { SpeakingStatsLevelId, UserState } from '../types/userState';
import { trackLocalEvent } from '../services/localEventLog';
import type { OnboardingCompletion } from '../services/onboardingService';

export type RootStackParamList = {
  Onboarding: undefined;
  PlacementTest: { setup: LearningPlanInput; profileName?: string };
  PlacementResult: { setup: LearningPlanInput; profileName?: string; result: PlacementResult };
  Main: { initialTab?: TabKey } | undefined;
  LessonIntro: { lessonId: string };
  ExercisePlayer: { lessonId: string };
  SpeakingPractice: {
    promptId?: string;
    source?: string;
    topicTitle?: string;
    expectedText?: string;
    meaningTr?: string;
    tipTr?: string;
    sentenceId?: string;
    sourceLessonId?: string;
    level?: SpeakingStatsLevelId;
    isB1Preview?: boolean;
  } | undefined;
  SpeakingLibrary: undefined;
  Mistakes: undefined;
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
const navigationRef = createNavigationContainerRef<RootStackParamList>();

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
          <VocabScreen navigation={navigation} userState={userState} onUpdateState={onUpdateState} />
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
  const [pendingHomeReset, setPendingHomeReset] = useState(false);

  useEffect(() => {
    let mounted = true;

    loadUserState()
      .then((loadedState) => {
        if (!mounted) {
          return;
        }

        const showOnboarding = shouldShowOnboarding(loadedState);
        const routeName = showOnboarding ? 'Onboarding' : 'Main';
        const repairInfo = getLastStorageRepairInfo();

        if (__DEV__) {
          console.log('[WortWeg boot]', {
            hasCompletedOnboarding: loadedState.hasCompletedOnboarding,
            hasOnboarded: loadedState.hasOnboarded,
            hasProfile: Boolean(loadedState.profile),
            hasLearningPlan: Boolean(loadedState.learningPlan),
            repairedPlan: repairInfo.repairedPlan,
            repairReasons: repairInfo.reasons,
            routeChosen: routeName,
          });
        }

        trackLocalEvent({
          type: 'app_boot_decision',
          screen: 'AppNavigator',
          metadata: {
            routeName,
            routeChosen: routeName,
            hasCompletedOnboarding: loadedState.hasCompletedOnboarding,
            hasOnboarded: loadedState.hasOnboarded,
            hasProfile: Boolean(loadedState.profile),
            hasLearningPlan: Boolean(loadedState.learningPlan),
            repairedPlan: repairInfo.repairedPlan,
            level: loadedState.learningPlan?.currentLevel,
            moduleId: loadedState.learningPlan?.currentModuleId,
          },
        });

        if (!showOnboarding) {
          trackLocalEvent({
            type: 'onboarding_skipped_if_applicable',
            screen: 'AppNavigator',
            metadata: { routeName: 'Main', routeChosen: 'Main' },
          });
        }

        setUserState(loadedState);
      })
      .catch(() => {
        if (!mounted) {
          return;
        }

        trackLocalEvent({
          type: 'boot_storage_error',
          screen: 'AppNavigator',
          action: 'load_failed',
          severity: 'error',
        });
        setUserState(defaultUserState);
      });

    return () => {
      mounted = false;
    };
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
      const completedAt = new Date().toISOString();
      const nextState: UserState = {
        ...defaultUserState,
        hasOnboarded: true,
        hasCompletedOnboarding: true,
        onboardingCompletedAt: completedAt,
        profile,
        learningPlan,
        placementResult,
      };
      setUserState(nextState);
      trackLocalEvent({ type: 'onboarding_completed', screen: 'Onboarding' });
      trackLocalEvent({
        type: 'plan_created',
        screen: 'Onboarding',
        metadata: { level: learningPlan.currentLevel, moduleId: learningPlan.currentModuleId },
      });
      await saveUserState(nextState);

      if (__DEV__) {
        try {
          const readBack = await loadUserState();
          const readBackOk = Boolean(readBack.hasCompletedOnboarding && readBack.learningPlan);

          console.log('[WortWeg onboarding save]', {
            markOnboardingCompletedSaved: true,
            readBackHasCompletedOnboarding: readBack.hasCompletedOnboarding,
            readBackHasLearningPlan: Boolean(readBack.learningPlan),
          });

          if (!readBackOk) {
            console.warn('[WortWeg onboarding save] read-back missing completion flag or plan');
          }
        } catch {
          console.warn('[WortWeg onboarding save] read-back failed');
          trackLocalEvent({
            type: 'boot_storage_error',
            screen: 'AppNavigator',
            action: 'onboarding_readback_failed',
            severity: 'error',
          });
        }
      }

      setPendingHomeReset(true);
    },
    [],
  );

  const resetAppState = useCallback(async () => {
    await resetUserState();
    setPendingHomeReset(false);
    setUserState(defaultUserState);
  }, []);

  const showOnboarding = userState ? shouldShowOnboarding(userState) : true;

  useEffect(() => {
    if (!pendingHomeReset || !userState || showOnboarding) {
      return;
    }

    const timeout = setTimeout(() => {
      if (navigationRef.isReady()) {
        navigationRef.resetRoot({
          index: 0,
          routes: [{ name: 'Main', params: { initialTab: 'home' } }],
        });
        trackLocalEvent({
          type: 'route_reset_to_home',
          screen: 'AppNavigator',
          metadata: { routeName: 'Main' },
        });
        setPendingHomeReset(false);
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, [pendingHomeReset, showOnboarding, userState]);

  if (!userState) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.royalPurple} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => trackLocalEvent({ type: 'app_opened', screen: 'AppNavigator' })}
      onUnhandledAction={(action) =>
        trackLocalEvent({
          type: 'navigation_error',
          screen: 'AppNavigator',
          action: action.type,
          severity: 'warning',
        })
      }
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {showOnboarding ? (
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
                <SpeakingPracticeScreen
                  navigation={navigation}
                  onUpdateState={commitUserState}
                  route={route}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="SpeakingLibrary">
              {({ navigation }) => (
                <SpeakingLibraryScreen navigation={navigation} userState={userState} />
              )}
            </Stack.Screen>
            <Stack.Screen name="Mistakes">
              {({ navigation }) => (
                <MistakesScreen
                  navigation={navigation}
                  userState={userState}
                  onUpdateState={commitUserState}
                />
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
