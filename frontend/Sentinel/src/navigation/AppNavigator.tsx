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

function getTabBarIconName(routeName: string, focused: boolean) {
  switch (routeName) {
    case "Home":
      return focused ? "home" : "home-outline";
    case "Obras":
      return focused ? "business" : "business-outline";
    case "Catalogos":
      return focused ? "list" : "list-outline";
    case "Cronogramas":
      return focused ? "calendar" : "calendar-outline";
    case "Avances":
      return focused ? "trending-up" : "trending-up-outline";
    case "Perfil":
      return focused ? "person" : "person-outline";
    default:
      return "ellipse-outline";
  }
}

export const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = getTabBarIconName(route.name, focused);

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
