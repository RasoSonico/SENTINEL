import React from "react";
import { View, Text } from "react-native";
import { useIncidentClassificationNameById } from "src/redux/selectors/incidencia/incidenciaFormDataSelectors";
import styles from "./styles/IncidentClassificationBadge.styles";

interface IncidentClassificationBadgeProps {
  classificationId: number;
  size?: "small" | "medium" | "large";
}

const IncidentClassificationBadge: React.FC<
  IncidentClassificationBadgeProps
> = ({ classificationId, size = "medium" }) => {
  const classificationName =
    useIncidentClassificationNameById(classificationId);

  // Define colors based on classification name (you can customize these)
  const getClassificationColor = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("crítica") || lowerName.includes("critica")) {
      return { backgroundColor: "#e74c3c", color: "#fff" };
    }
    if (lowerName.includes("alta")) {
      return { backgroundColor: "#f39c12", color: "#fff" };
    }
    if (lowerName.includes("media")) {
      return { backgroundColor: "#3498db", color: "#fff" };
    }
    if (lowerName.includes("baja")) {
      return { backgroundColor: "#2ecc71", color: "#fff" };
    }
    // Default color
    return { backgroundColor: "#95a5a6", color: "#fff" };
  };

  const colors = getClassificationColor(classificationName);
  const sizeStyle = styles[size];

  return (
    <View
      style={[
        styles.badge,
        sizeStyle,
        { backgroundColor: colors.backgroundColor },
      ]}
    >
      <Text style={[styles.text, sizeStyle, { color: colors.color }]}>
        {classificationName}
      </Text>
    </View>
  );
};

export default IncidentClassificationBadge;
