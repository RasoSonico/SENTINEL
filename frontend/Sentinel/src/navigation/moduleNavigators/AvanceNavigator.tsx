import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { AvanceStackParamList } from "../types";
import AdvanceListScreen from "../../modules/avance/screens/AdvanceListScreen";
import AdvanceRegistrationScreen from "../../modules/avance/screens/AdvanceRegistrationScreen";

const Stack = createStackNavigator<AvanceStackParamList>();

export const AvanceNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="AvancesList"
      screenOptions={{
        headerStyle: {
          backgroundColor: "#3498db",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        cardStyle: {
          backgroundColor: "#f9f9f9",
        },
      }}
    >
      <Stack.Screen
        name="AvancesList"
        component={AdvanceListScreen}
        options={{
          title: "Avances Registrados",
        }}
      />

      <Stack.Screen
        name="AvanceRegistration"
        component={AdvanceRegistrationScreen}
        options={{
          title: "Registrar avance",
        }}
      />

      {/* 
      <Stack.Screen
        name="AvanceDetail"
        component={AdvanceDetailScreen}
        options={({ route }) => ({
          title: route.params?.title || "Detalle de avance",
        })}
      />
      */}
    </Stack.Navigator>
  );
};

export default AvanceNavigator;
