import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getCatalogs,
  getConcepts,
  getPartidas,
  submitAdvance,
  getAdvancesByCatalog,
  getAssignedConstruction,
  getCatalogsByConstruction as getCatalogsByConstructionApi,
  getPartidasByCatalog,
  getConceptsByWorkItem,
} from "../api/avanceApi";
import { AdvanceRegistration } from "src/types/entities";
import { SubmitAdvance } from "src/types/avance";

// DEPRECATED: Use useCatalogsByConstruction instead
export const useFetchCatalogs = () =>
  useQuery({
    queryKey: ["catalogs"],
    queryFn: getCatalogs,
  });

// DEPRECATED: Use usePartidasByCatalog instead
export const useFetchPartidas = () =>
  useQuery({
    queryKey: ["partidas"],
    queryFn: getPartidas,
  });

// DEPRECATED: Use useConceptsByWorkItem instead
export const useFetchConcepts = () =>
  useQuery({
    queryKey: ["concepts"],
    queryFn: getConcepts,
  });

/**
 * NEW HIERARCHICAL QUERIES - Following correct user permissions flow
 */

/**
 * Query para obtener catálogos de la construcción asignada al usuario
 */
export const useCatalogsByConstruction = (constructionId: number | null) =>
  useQuery({
    queryKey: ["catalogsByConstruction", constructionId],
    queryFn: () => getCatalogsByConstructionApi(constructionId!),
    enabled: !!constructionId,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

/**
 * Query para obtener partidas de un catálogo específico
 */
export const usePartidasByCatalog = (catalogId: number | null) =>
  useQuery({
    queryKey: ["partidasByCatalog", catalogId],
    queryFn: () => getPartidasByCatalog(catalogId!),
    enabled: !!catalogId,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

/**
 * Query para obtener conceptos de una partida específica
 */
export const useConceptsByWorkItem = (workItemId: number | null) =>
  useQuery({
    queryKey: ["conceptsByWorkItem", workItemId],
    queryFn: () => getConceptsByWorkItem(workItemId!),
    enabled: !!workItemId,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

export const useSubmitAdvance = () =>
  useMutation({
    mutationKey: ["submitAdvance"],
    mutationFn: (advance: SubmitAdvance) => submitAdvance(advance),
  });

// Nuevas queries para AdvanceListScreen

/**
 * Query para obtener la construcción asignada al usuario
 */
export const useAssignedConstruction = (role: string = "CONTRATISTA") =>
  useQuery({
    queryKey: ["assignedConstruction", role],
    queryFn: () => getAssignedConstruction(role),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });


/**
 * Query para obtener avances por catálogo con filtros
 */
export const useAdvancesByCatalog = ({
  catalogId,
  status,
  page = 1,
  pageSize = 20,
}: {
  catalogId: number | null;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  page?: number;
  pageSize?: number;
}) => {
  console.log("🔍 [QUERY] useAdvancesByCatalog called with:", { catalogId, status, page, pageSize });
  console.log("🔍 [QUERY] Query enabled:", !!catalogId);
  
  return useQuery({
    queryKey: ["advancesByCatalog", catalogId, status, page, pageSize],
    queryFn: () => {
      console.log("🔍 [QUERY] Executing getAdvancesByCatalog with catalogId:", catalogId);
      return getAdvancesByCatalog({ 
        catalogId: catalogId!, 
        status, 
        page, 
        pageSize 
      });
    },
    enabled: !!catalogId,
    staleTime: 2 * 60 * 1000, // 2 minutos para datos más frescos
  });
};
