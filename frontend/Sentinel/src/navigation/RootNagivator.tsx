import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useAppSelector } from "../redux/hooks";
import { AuthNavigator } from "./AuthNavigator";
import { AppNavigator } from "./AppNavigator";
import { RootStackParamList } from "./types";
import { navigationRef } from "./NavigationService";
import { createStackNavigator } from "@react-navigation/stack";
import AuthLoading from "./AuthLoading";

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [authChecked, setAuthChecked] = useState(false);

  if (!authChecked) {
    return <AuthLoading onAuthChecked={() => setAuthChecked(true)} />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="App" component={AppNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
