import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useIncidentTypeNameById } from "src/redux/selectors/incidencia/incidenciaFormDataSelectors";
import styles, { iconSizes } from "./styles/IncidentTypeDisplay.styles";

interface IncidentTypeDisplayProps {
  typeId: number;
  showIcon?: boolean;
  size?: "small" | "medium" | "large";
}

const IncidentTypeDisplay: React.FC<IncidentTypeDisplayProps> = ({
  typeId,
  showIcon = true,
  size = "medium",
}) => {
  const typeName = useIncidentTypeNameById(typeId);

  const getTypeIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("accidente") || lowerName.includes("lesión")) {
      return "medical-outline";
    }
    if (lowerName.includes("seguridad")) {
      return "shield-outline";
    }
    if (lowerName.includes("material") || lowerName.includes("equipo")) {
      return "construct-outline";
    }
    if (lowerName.includes("ambiental")) {
      return "leaf-outline";
    }
    if (lowerName.includes("calidad")) {
      return "checkmark-circle-outline";
    }
    // Default icon
    return "alert-circle-outline";
  };

  const iconName = getTypeIcon(typeName);
  const sizeStyle = styles[size];
  const iconSize = iconSizes[size];

  return (
    <View style={styles.container}>
      {showIcon && (
        <Ionicons
          name={iconName as any}
          size={iconSize}
          color="#666"
          style={styles.icon}
        />
      )}
      <Text style={[styles.text, sizeStyle]}>{typeName}</Text>
    </View>
  );
};

export default IncidentTypeDisplay;
