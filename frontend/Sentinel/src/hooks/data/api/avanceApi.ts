import { apiRequest } from "src/services/api/apiClient";
import { API_CONFIG } from "src/services/api/config";
import { CatalogoApiResponse } from "src/types/catalogo";
import { PartidaApiResponse } from "src/types/partida";
import { ConceptoApiResponse } from "src/types/concepto";
import { SubmitAdvance, SubmitAvanceResponse } from "src/types/avance";
import { PhysicalAdvanceResponse, Construction } from "src/types/entities";

// DEPRECATED: Use getCatalogsByConstruction instead
export const getCatalogs = async () =>
  await apiRequest<CatalogoApiResponse>(
    "get",
    API_CONFIG.endpoints.catalogs,
    "Hubo un error al obtener los catálogos, inténtelo de nuevo más tarde."
  ).then((response) => {
    return response.results ?? [];
  });

// DEPRECATED: Use getPartidasByCatalog instead
export const getPartidas = async () =>
  await apiRequest<PartidaApiResponse>(
    "get",
    API_CONFIG.endpoints.partidas,
    "Hubo un error al obtener las partidas, inténtelo de nuevo más tarde."
  ).then((response) => {
    return response.results ?? [];
  });

// DEPRECATED: Use getConceptsByWorkItem instead
export const getConcepts = async () =>
  await apiRequest<ConceptoApiResponse>(
    "get",
    API_CONFIG.endpoints.concepts,
    "Hubo un error al obtener los conceptos, inténtelo de nuevo más tarde."
  ).then((response) => {
    return response.results ?? [];
  });

/**
 * NEW HIERARCHICAL APIs - Following correct user permissions flow for CONTRATISTA
 */

/**
 * Obtener catálogos asignados al usuario por construcción
 */
export const getCatalogsByConstruction = async (constructionId: number) => {
  const endpoint = `${API_CONFIG.endpoints.catalogs}?construction=${constructionId}`;
  console.log("🔍 [API] Getting catalogs for construction:", constructionId);

  return await apiRequest<CatalogoApiResponse>(
    "get",
    endpoint,
    "Error al obtener catálogos de la construcción"
  ).then((response) => {
    console.log(
      "📦 [API] Catalogs response:",
      response.results?.length || 0,
      "catalogs"
    );
    return response.results ?? [];
  });
};

/**
 * Obtener partidas (workitems) de un catálogo específico
 */
export const getPartidasByCatalog = async (catalogId: number) => {
  const endpoint = `${API_CONFIG.endpoints.partidas}?catalog=${catalogId}&page_size=100`;
  console.log("🔍 [API] Getting partidas for catalog:", catalogId);

  return await apiRequest<PartidaApiResponse>(
    "get",
    endpoint,
    "Error al obtener partidas del catálogo"
  ).then((response) => {
    console.log(
      "📦 [API] Partidas response:",
      response.results?.length || 0,
      "partidas"
    );
    return response.results ?? [];
  });
};

/**
 * Obtener conceptos de una partida específica
 */
export const getConceptsByWorkItem = async (workItemId: number) => {
  const endpoint = `${API_CONFIG.endpoints.concepts}?work_item=${workItemId}&page_size=100`;
  console.log("🔍 [API] Getting concepts for work_item:", workItemId);

  return await apiRequest<ConceptoApiResponse>(
    "get",
    endpoint,
    "Error al obtener conceptos de la partida"
  ).then((response) => {
    console.log(
      "📦 [API] Concepts response:",
      response.results?.length || 0,
      "concepts"
    );
    return response.results ?? [];
  });
};

export const submitAdvance = async (advance: SubmitAdvance) =>
  await apiRequest<SubmitAvanceResponse>(
    "post",
    API_CONFIG.endpoints.submitAdvance,
    "Hubo un error al enviar el formulario de avance, inténtelo de nuevo más tarde.",
    advance
  );

// Nuevas funciones para AdvanceListScreen usando useQuery

/**
 * Obtener avances por catalog_id con filtros opcionales
 */
export const getAdvancesByCatalog = async ({
  catalogId,
  status,
  page = 1,
  pageSize = 20,
}: {
  catalogId: number;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  page?: number;
  pageSize?: number;
}): Promise<{ advances: PhysicalAdvanceResponse[]; count: number }> => {
  const params = new URLSearchParams({
    catalog: catalogId.toString(),
    page: page.toString(),
    page_size: pageSize.toString(),
  });

  if (status) {
    params.append("status", status);
  }

  const endpoint = `${API_CONFIG.endpoints.advances.list}?${params.toString()}`;

  console.log("🔍 Requesting advances by catalog:", endpoint);
  console.log("🔍 Request params:", { catalogId, status, page, pageSize });

  const response = await apiRequest<{
    results: PhysicalAdvanceResponse[];
    count: number;
    next: string | null;
    previous: string | null;
  }>("get", endpoint, "Error al obtener avances por catálogo");

  console.log("📦 Advances response:", response);

  return {
    advances: response.results || [],
    count: response.count || 0,
  };
};

/**
 * Obtener construcción asignada al usuario
 */
export const getAssignedConstruction = async (
  role: string = "CONTRATISTA"
): Promise<Construction | null> => {
  try {
    const endpoint = `${API_CONFIG.endpoints.obra.constructions.myConstructions}?role=${role}`;
    console.log("🔍 Requesting assigned construction:", endpoint);

    const response = await apiRequest<Construction[]>(
      "get",
      endpoint,
      "Error al obtener obra asignada"
    );

    console.log("📦 Response from getAssignedConstruction:", {
      responseLength: response.length,
      constructions: response,
    });

    const result = response.length > 0 ? response[0] : null;
    console.log("✅ Returning assigned construction:", result);

    return result;
  } catch (error) {
    console.error("❌ Error al obtener obra asignada:", error);
    throw error;
  }
};

// export const getCatalogs = async () => Promise.resolve(catalogsMockData.results ?? []);
//
// export const getPartidas = async () => Promise.resolve(partidaMockData.results ?? []);
//
// export const getConcepts = async () => Promise.resolve(conceptoMockData.results ?? []);
