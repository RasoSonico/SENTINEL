import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { TextInput } from "react-native-paper";
import { useAppSelector } from "../../../redux/hooks";
import { selectIncidentCatalogs } from "../../../redux/slices/incidencia/incidenciaSlice";
import SearchableDropdown from "../../../components/ui/SearchableDropdown";
import { CreateIncident } from "../../../types/incidencia";
import {
  validateIncidentForm,
  validateField,
  IncidentFormData,
  incidentFormDefaultValues,
} from "./util/incidentFormValidation";
import styles from "./styles/IncidentForm.styles";

interface IncidentFormProps {
  initialData?: Partial<CreateIncident>;
  onSubmit: (data: CreateIncident) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

const IncidentForm: React.FC<IncidentFormProps> = ({
  initialData = {},
  onSubmit,
  isSubmitting = false,
  onCancel,
}) => {
  // Estados de Redux
  const catalogs = useAppSelector(selectIncidentCatalogs);

  // Estados del formulario
  const [formData, setFormData] = useState<IncidentFormData>({
    type: initialData?.type || incidentFormDefaultValues.type,
    clasification:
      initialData?.clasification || incidentFormDefaultValues.clasification,
    description:
      initialData?.description || incidentFormDefaultValues.description,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Preparar datos para los dropdowns
  const typeItems = catalogs.types.items.map((type) => ({
    value: type.id,
    label: type.name,
  }));

  const classificationItems = catalogs.classifications.items.map(
    (classification) => ({
      value: classification.id,
      label: classification.name,
    })
  );

  // Función para actualizar un campo
  const updateField = (field: keyof IncidentFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Validar campo en tiempo real si ya fue tocado
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({
        ...prev,
        [field]: error || "",
      }));
    }
  };

  // Función para marcar un campo como tocado
  const touchField = (field: keyof IncidentFormData) => {
    if (!touched[field]) {
      setTouched((prev) => ({ ...prev, [field]: true }));

      // Validar el campo al tocarlo
      const error = validateField(field, formData[field]);
      setErrors((prev) => ({
        ...prev,
        [field]: error || "",
      }));
    }
  };

  // Validar formulario completo
  const validateForm = () => {
    const validation = validateIncidentForm(formData);
    setErrors(validation.errors);

    // Marcar todos los campos como tocados
    setTouched({
      type: true,
      clasification: true,
      description: true,
    });

    return validation.isValid;
  };

  // Función para manejar el envío
  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert(
        "Formulario Incompleto",
        "Por favor, corrija los errores en el formulario antes de continuar.",
        [{ text: "OK" }]
      );
      return;
    }

    // Confirmar envío
    Alert.alert(
      "Confirmar Registro",
      "¿Está seguro que desea registrar esta incidencia?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Registrar",
          onPress: () => {
            onSubmit({
              type: formData.type,
              clasification: formData.clasification,
              description: formData.description.trim(),
            });
          },
        },
      ]
    );
  };

  // Verificar si el formulario es válido
  const isFormValid =
    Object.values(errors).every((error) => !error) &&
    formData.type > 0 &&
    formData.clasification > 0 &&
    formData.description.trim().length >= 10;

  return (
    <View style={styles.container}>
      {/* Tipo de Incidencia */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Tipo de Incidencia *</Text>
        <SearchableDropdown
          label="Seleccionar tipo"
          searchLabel="Buscar tipo de incidencia..."
          items={typeItems}
          selected={formData.type}
          onSelect={(value) => updateField("type", value)}
          disabled={isSubmitting}
        />
        {touched.type && errors.type && (
          <Text style={styles.errorText}>{errors.type}</Text>
        )}
      </View>

      {/* Clasificación de Incidencia */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Clasificación *</Text>
        <SearchableDropdown
          label="Seleccionar clasificación"
          searchLabel="Buscar clasificación..."
          items={classificationItems}
          selected={formData.clasification}
          onSelect={(value) => updateField("clasification", value)}
          disabled={isSubmitting}
        />
        {touched.clasification && errors.clasification && (
          <Text style={styles.errorText}>{errors.clasification}</Text>
        )}
      </View>

      {/* Descripción */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Descripción *</Text>
        <TextInput
          label="Describe la incidencia detalladamente"
          value={formData.description}
          onChangeText={(value) => updateField("description", value)}
          onBlur={() => touchField("description")}
          multiline
          numberOfLines={6}
          maxLength={1000}
          disabled={isSubmitting}
          theme={{ colors: { primary: "#009BE1" } }}
          style={styles.textInput}
          error={touched.description && !!errors.description}
        />
        <View style={styles.descriptionFooter}>
          <Text style={styles.characterCount}>
            {formData.description.length}/1000
          </Text>
        </View>
        {touched.description && errors.description && (
          <Text style={styles.errorText}>{errors.description}</Text>
        )}
      </View>

      {/* Información adicional */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          * Los campos marcados son obligatorios
        </Text>
        <Text style={styles.infoText}>
          La incidencia se registrará con la fecha y hora actual
        </Text>
      </View>

      {/* Botones de acción */}
      <View style={styles.buttonContainer}>
        {onCancel && (
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            styles.submitButton,
            (!isFormValid || isSubmitting) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!isFormValid || isSubmitting}
        >
          <Text
            style={[
              styles.submitButtonText,
              (!isFormValid || isSubmitting) && styles.submitButtonTextDisabled,
            ]}
          >
            {isSubmitting ? "Registrando..." : "Registrar Incidencia"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default IncidentForm;
