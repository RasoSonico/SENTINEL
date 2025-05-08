// Navegador raíz decide entre Auth y App
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { useAppSelector } from "../redux/hooks";
import { AuthNavigator } from "./AuthNavigator";
import { AppNavigator } from "./AppNavigator";
import { RootStackParamList } from "./types";
import { navigationRef } from "./NavigationService";

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  // Obtenemos el estado de autenticación desde Redux
  const { isAuthenticated } = useAppSelector((state) => state.auth);

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
