// Navegación Principal de la Aplicación
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AppTabParamList } from "./types";
import { ObraNavigator } from "./moduleNavigators/ObraNavigator";
import { AvanceNavigator } from "./moduleNavigators/AvanceNavigator"; // Importar correctamente
import { Ionicons } from "@expo/vector-icons";
import { View, Text } from "react-native";
import PerfilScreen from "../modules/profiles/PerfilScreen";

// Placeholder para pantallas no creadas aún
const HomeScreen = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text>Home Screen</Text>
  </View>
);

const Tab = createBottomTabNavigator<AppTabParamList>();

export const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Obras") {
            iconName = focused ? "business" : "business-outline";
          } else if (route.name === "Catalogos") {
            iconName = focused ? "list" : "list-outline";
          } else if (route.name === "Cronogramas") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "Avances") {
            iconName = focused ? "trending-up" : "trending-up-outline";
          } else if (route.name === "Perfil") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#0366d6",
        tabBarInactiveTintColor: "gray",
        headerShown: false, // Ocultamos el header principal ya que lo maneja cada navegador
      })}
    >
      {/* Usar el navegador de avances, no directamente la pantalla */}
      <Tab.Screen name="Avances" component={AvanceNavigator} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />

      {/* Estas pantallas están comentadas hasta que las necesites */}
      {/* <Tab.Screen name="Home" component={HomeScreen} /> */}
      {/* <Tab.Screen name="Obras" component={ObraNavigator} /> */}
      {/* <Tab.Screen name="Catalogos" component={CatalogoNavigator} /> */}
      {/* <Tab.Screen name="Cronogramas" component={CronogramaNavigator} /> */}
    </Tab.Navigator>
  );
};
