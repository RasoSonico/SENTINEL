import React from "react";
import { View } from "react-native";
import { Controller, Control, FieldErrors } from "react-hook-form";
import LabeledDropdown from "../../components/LabeledDropdown";
import QuantityInput from "../../components/QuantityInput";
import CompletionSwitch from "../../components/CompletionSwitch";
import StatusSection from "../../components/StatusSection";
import NotesInput from "../../components/NotesInput";
import { AdvanceFormFieldsZod } from "../AdvanceForm";

interface AdvanceFormFieldsProps {
  control: Control<AdvanceFormFieldsZod>;
  errors: FieldErrors<AdvanceFormFieldsZod>;
  isCompleted: boolean | undefined;
  handleCatalogSelect: (catalogId: string) => void;
  handlePartidaSelect: (partidaId: string) => void;
  handleConceptSelect: (conceptId: string) => void;
}

const mockCatalogItems: string[] = [
  "Catalogo 1",
  "Catalogo 2",
  "Catalogo 3",
  "Catalogo 4",
  "Catalogo 5",
];

const mockPartidaitems: string[] = [
  "Partida 1",
  "Partida 2",
  "Partida 3",
  "Partida 4",
  "Partida 5",
];

const mockConceptItems: string[] = [
  "Concepto 1",
  "Concepto 2",
  "Concepto 3",
  "Concepto 4",
  "Concepto 5",
];

const AdvanceFormFields: React.FC<AdvanceFormFieldsProps> = ({
  control,
  errors,
  isCompleted,
  handleCatalogSelect,
  handlePartidaSelect,
  handleConceptSelect,
}) => (
  <>
    <View>
      <Controller
        control={control}
        name="catalog"
        render={({ field: { value } }) => (
          <LabeledDropdown
            label="Catálogo"
            items={mockCatalogItems}
            selected={value}
            onSelect={handleCatalogSelect}
            error={errors.catalog?.message}
          />
        )}
      />
    </View>
    <View>
      <Controller
        control={control}
        name="partida"
        render={({ field: { value } }) => (
          <LabeledDropdown
            label="Partida"
            items={mockPartidaitems}
            selected={value}
            onSelect={handlePartidaSelect}
            error={errors.partida?.message}
          />
        )}
      />
    </View>
    <View>
      <Controller
        control={control}
        name="concept"
        render={({ field: { value } }) => (
          <LabeledDropdown
            label="Concepto"
            items={mockConceptItems}
            selected={value}
            onSelect={handleConceptSelect}
            error={errors.concept?.message}
          />
        )}
      />
    </View>
    <View>
      <Controller
        control={control}
        name="quantity"
        render={({ field: { value, onChange } }) => (
          <QuantityInput
            quantity={value}
            onChange={onChange}
            unit={""}
            error={errors.quantity?.message ?? null}
          />
        )}
      />
    </View>
    <Controller
      control={control}
      name="isCompleted"
      render={({ field: { value, onChange } }) => (
        <CompletionSwitch value={!!value} onValueChange={onChange} />
      )}
    />
    <StatusSection status={isCompleted ? "completed" : "onSchedule"} />
    <Controller
      control={control}
      name="notes"
      render={({ field: { value, onChange } }) => (
        <NotesInput value={value || ""} onChange={onChange} />
      )}
    />
  </>
);

export default AdvanceFormFields;
