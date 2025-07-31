import React, { useEffect, useState } from "react";
import { View } from "react-native";
import {
  Controller,
  Control,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
} from "react-hook-form";
import LabeledDropdown from "../../components/LabeledDropdown";
import QuantityInput from "../../components/QuantityInput";
import CompletionSwitch from "../../components/CompletionSwitch";
import StatusSection from "../../components/StatusSection";
import NotesInput from "../../components/NotesInput";
import { AdvanceFormFieldsZod } from "../util/advanceFormValidation";
import {
  useFetchCatalogs,
  useFetchConcepts,
  useFetchPartidas,
  useCatalogsByConstruction,
  usePartidasByCatalog,
  useConceptsByWorkItem,
  useAssignedConstruction,
} from "src/hooks/data/query/useAvanceQueries";
import { CatalogoItem } from "src/types/catalogo";
import { DropdownItemType } from "src/components/ui/SearchableDropdown";
import { ConceptoItem } from "src/types/concepto";
import { Concept } from "src/types/entities";
import { PartidaItem } from "src/types/partida";
import { useDispatch } from "react-redux";
import {
  setCatalogsById,
  setPartidasById,
  setConceptsById,
} from "src/redux/slices/avance/avanceFormDataSlice";

interface AdvanceFormFieldsProps {
  control: Control<AdvanceFormFieldsZod>;
  errors: FieldErrors<AdvanceFormFieldsZod>;
  isCompleted: boolean | undefined;
  onCatalogSelect: (catalogId: number) => void;
  onPartidaSelect: (partidaId: number) => void;
  onConceptSelect: (conceptId: number) => void;
  setFormValue: UseFormSetValue<AdvanceFormFieldsZod>;
  watchFormValue: UseFormWatch<AdvanceFormFieldsZod>;
}

const AdvanceFormFields: React.FC<AdvanceFormFieldsProps> = ({
  control,
  errors,
  isCompleted,
  onCatalogSelect,
  onPartidaSelect,
  onConceptSelect,
  watchFormValue,
}) => {
  const dispatch = useDispatch();

  // Get assigned construction for CONTRATISTA
  const {
    data: assignedConstruction,
    isLoading: isLoadingConstruction,
    error: constructionError,
  } = useAssignedConstruction("CONTRATISTA");

  // Watch form values for hierarchical loading
  const selectedCatalogId = watchFormValue("catalog");
  const selectedPartidaId = watchFormValue("partida");
  const selectedConceptId = watchFormValue("concept");
  const [unit, setUnit] = useState("");

  // NEW HIERARCHICAL QUERIES
  const {
    data: catalogs,
    isLoading: isLoadingCatalogs,
    error: catalogsError,
    isError: isCatalogsError,
  } = useCatalogsByConstruction(
    assignedConstruction?.id ? parseInt(assignedConstruction.id, 10) : null
  );

  const {
    data: partidas,
    isLoading: isLoadingPartidas,
    error: partidasError,
    isError: isPartidasError,
  } = usePartidasByCatalog(selectedCatalogId || null);

  const {
    data: concepts,
    isLoading: isLoadingConcepts,
    error: conceptsError,
    isError: isConceptsError,
  } = useConceptsByWorkItem(selectedPartidaId || null);

  useEffect(() => {
    if (catalogs) {
      dispatch(setCatalogsById(catalogs));
    }
  }, [catalogs, dispatch]);

  useEffect(() => {
    if (partidas) {
      dispatch(setPartidasById(partidas));
    }
  }, [partidas, dispatch]);

  useEffect(() => {
    if (concepts) {
      dispatch(setConceptsById(concepts));
    }
  }, [concepts, dispatch]);

  // Update unit when concept is selected
  useEffect(() => {
    if (concepts && selectedConceptId) {
      const concept = concepts.find(
        (concept) => concept.id === selectedConceptId
      );
      setUnit(concept?.unit || "");
    } else {
      setUnit("");
    }
  }, [concepts, selectedConceptId]);

  const getCatalogsList = (catalogs: CatalogoItem[]): DropdownItemType[] =>
    catalogs && catalogs.length > 0
      ? catalogs.map((catalog: CatalogoItem) => ({
          value: catalog.id,
          label: catalog.name,
        }))
      : [];

  const getPartidasList = (partidas: PartidaItem[]): DropdownItemType[] =>
    partidas && partidas.length > 0
      ? partidas.map((partida: PartidaItem) => ({
          value: partida.id,
          label: partida.name,
        }))
      : [];

  const getConceptsList = (concepts: ConceptoItem[]): DropdownItemType[] =>
    concepts && concepts.length > 0
      ? concepts.map((concept: ConceptoItem) => ({
          value: concept.id,
          label: concept.description,
        }))
      : [];

  return (
    <>
      <View>
        <Controller
          control={control}
          name="catalog"
          render={({ field: { value } }) => (
            <LabeledDropdown
              label="Catálogo"
              items={getCatalogsList(catalogs || [])}
              selected={value}
              onSelect={onCatalogSelect}
              error={errors.catalog?.message || catalogsError?.message}
              isLoading={isLoadingCatalogs || isLoadingConstruction}
              loadingLabel={
                isLoadingConstruction
                  ? "Cargando obra asignada..."
                  : "Cargando Catálogos"
              }
              disabled={isCatalogsError || !assignedConstruction}
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
              items={getPartidasList(partidas || [])}
              selected={value}
              onSelect={onPartidaSelect}
              error={errors.partida?.message || partidasError?.message}
              disabled={!selectedCatalogId || isPartidasError}
              isLoading={isLoadingPartidas}
              loadingLabel="Cargando Partidas"
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
              items={getConceptsList(concepts || [])}
              selected={value}
              onSelect={onConceptSelect}
              error={errors.concept?.message || conceptsError?.message}
              disabled={!selectedPartidaId || isConceptsError}
              isLoading={isLoadingConcepts}
              loadingLabel="Cargando Conceptos"
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
              unit={unit}
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
};

export default AdvanceFormFields;
