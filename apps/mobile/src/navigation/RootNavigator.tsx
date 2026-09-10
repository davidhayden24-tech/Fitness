import { useAuth } from "@clerk/expo";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useApi } from "../api/useApi";
import { AuthScreen } from "../screens/AuthScreen";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { SessionPlayerScreen } from "../screens/SessionPlayerScreen";
import { CoachCheckinScreen } from "../screens/CoachCheckinScreen";
import { ProgressScreen } from "../screens/ProgressScreen";
import { colors } from "../theme";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  dark: true,
  colors: {
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.primary,
  },
  fonts: {
    regular: { fontFamily: "System", fontWeight: "400" as const },
    medium: { fontFamily: "System", fontWeight: "500" as const },
    bold: { fontFamily: "System", fontWeight: "700" as const },
    heavy: { fontFamily: "System", fontWeight: "900" as const },
  },
};

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
      {children}
    </View>
  );
}

const MainStack = () => (
  <NavigationContainer theme={navTheme}>
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.text }}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: "AdaptFit" }} />
      <Stack.Screen name="SessionPlayer" component={SessionPlayerScreen} options={{ title: "Session" }} />
      <Stack.Screen name="Coach" component={CoachCheckinScreen} options={{ title: "Check-In Coach" }} />
      <Stack.Screen name="Progress" component={ProgressScreen} options={{ title: "Progress" }} />
    </Stack.Navigator>
  </NavigationContainer>
);

/** Signed in with Clerk, but may not have completed AdaptFit's own onboarding yet. */
function OnboardingGate() {
  const api = useApi();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getMe()
      .then(() => !cancelled && setHasProfile(true))
      .catch(() => !cancelled && setHasProfile(false));
    return () => {
      cancelled = true;
    };
  }, [api]);

  if (hasProfile === null) {
    return (
      <Centered>
        <ActivityIndicator color={colors.primary} />
      </Centered>
    );
  }

  return hasProfile ? <MainStack /> : <OnboardingScreen onOnboarded={() => setHasProfile(true)} />;
}

export function RootNavigator() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <Centered>
        <ActivityIndicator color={colors.primary} />
      </Centered>
    );
  }

  if (!isSignedIn) {
    return <AuthScreen />;
  }

  return <OnboardingGate />;
}
