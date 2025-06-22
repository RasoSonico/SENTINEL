import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, Text } from "react-native";
import { store, persistor } from "./src/redux/store";
import { RootNavigator } from "./src/navigation/RootNagivator";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./src/lib/queryClient";
import { PaperProvider } from "react-native-paper";

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <PersistGate
          loading={
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator size="large" color="#0366d6" />
              <Text style={{ marginTop: 12, color: "#666" }}>Cargando...</Text>
            </View>
          }
          persistor={persistor}
        >
          <PaperProvider>
            <SafeAreaProvider>
              <StatusBar style="auto" />
              <RootNavigator />
            </SafeAreaProvider>
          </PaperProvider>
        </PersistGate>
      </QueryClientProvider>
    </Provider>
  );
}
