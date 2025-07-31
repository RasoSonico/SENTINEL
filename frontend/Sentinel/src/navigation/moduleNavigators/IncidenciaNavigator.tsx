import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import IncidentListScreen from "../../modules/incidencia/screens/IncidentListScreen";
import IncidentRegistrationScreen from "../../modules/incidencia/screens/IncidentRegistrationScreen";
import { Incident } from "../../types/incidencia";

export type IncidenciaStackParamList = {
  IncidentsList: undefined;
  IncidentRegistration: undefined;
  IncidentDetail: { incident: Incident };
};

const Stack = createStackNavigator<IncidenciaStackParamList>();

export const IncidenciaNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="IncidentsList"
        component={IncidentListScreen}
        options={{
          title: "Incidencias",
        }}
      />
      <Stack.Screen
        name="IncidentRegistration"
        component={IncidentRegistrationScreen}
        options={{
          title: "Registrar Incidencia",
          presentation: "modal",
        }}
      />
      {/* TODO: Agregar IncidentDetailScreen cuando se implemente */}
      {/* 
      <Stack.Screen 
        name="IncidentDetail" 
        component={IncidentDetailScreen}
        options={{
          title: "Detalle de Incidencia",
        }}
      />
      */}
    </Stack.Navigator>
  );
};
