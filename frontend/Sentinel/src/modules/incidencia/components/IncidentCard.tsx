import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Incident } from "src/types/incidencia";
import IncidentClassificationBadge from "./IncidentClassificationBadge";
import IncidentTypeDisplay from "./IncidentTypeDisplay";
import styles from "./styles/IncidentCard.styles";

interface IncidentCardProps {
  incident: Incident;
  onPress: (incident: Incident) => void;
}

const IncidentCard: React.FC<IncidentCardProps> = ({ incident, onPress }) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM, yyyy", { locale: es });
    } catch {
      return dateString;
    }
  };

  const truncateDescription = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(incident)}
      activeOpacity={0.7}
    >
      {/* Header with classification badge */}
      <View style={styles.header}>
        <IncidentClassificationBadge
          classificationId={incident.clasification}
          size="small"
        />
        <Text style={styles.date}>{formatDate(incident.date)}</Text>
      </View>

      {/* Type display */}
      <View style={styles.typeContainer}>
        <IncidentTypeDisplay typeId={incident.type} size="medium" />
      </View>

      {/* Description */}
      <Text style={styles.description}>
        {truncateDescription(incident.description)}
      </Text>

      {/* Footer with incident ID */}
      <View style={styles.footer}>
        <Text style={styles.incidentId}>Incidencia #{incident.id}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default IncidentCard;
