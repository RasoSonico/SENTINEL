import { useSelector } from "react-redux";
import { RootState } from "src/redux/store";

export const useCatalogById = (id: number) =>
  useSelector((state: RootState) => state.advanceFormData.catalogsById[id]);
export const usePartidaById = (id: number) =>
  useSelector((state: RootState) => state.advanceFormData.partidasById[id]);
export const useConceptById = (id: number) =>
  useSelector((state: RootState) => state.advanceFormData.conceptsById[id]);

export const useCatalogNameById = (id: number) => {
  const catalog = useCatalogById(id);
  return catalog ? catalog.name : "";
};

export const usePartidaNameById = (id: number) => {
  const partida = usePartidaById(id);
  return partida ? partida.name : "";
};

export const useConceptDescriptionById = (id: number) => {
  const concept = useConceptById(id);
  return concept ? concept.description : "";
};

export const useConceptUnitById = (id: number) => {
  const concept = useConceptById(id);
  return concept ? concept.unit : "";
};
