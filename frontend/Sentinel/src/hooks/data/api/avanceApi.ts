import { apiRequest } from "src/services/api/apiClient";
import { API_CONFIG } from "src/services/api/config";
import { CatalogoApiResponse } from "src/types/catalogo";
import { PartidaApiResponse } from "src/types/partida";
import { ConceptoApiResponse } from "src/types/concepto";
import { SubmitAdvance, SubmitAvanceResponse } from "src/types/avance";

export const getCatalogs = async () =>
  await apiRequest<CatalogoApiResponse>(
    "get",
    API_CONFIG.endpoints.catalogs,
    "Hubo un error al obtener los catálogos, inténtelo de nuevo más tarde."
  ).then((response) => {
    return response.results ?? [];
  });

export const getPartidas = async () =>
  await apiRequest<PartidaApiResponse>(
    "get",
    API_CONFIG.endpoints.partidas,
    "Hubo un error al obtener las partidas, inténtelo de nuevo más tarde."
  ).then((response) => {
    return response.results ?? [];
  });

export const getConcepts = async () =>
  await apiRequest<ConceptoApiResponse>(
    "get",
    API_CONFIG.endpoints.concepts,
    "Hubo un error al obtener los conceptos, inténtelo de nuevo más tarde."
  ).then((response) => {
    return response.results ?? [];
  });

export const submitAdvance = async (advance: SubmitAdvance) => 
  await apiRequest<SubmitAvanceResponse>(
    "post",
    API_CONFIG.endpoints.submitAdvance,
    "Hubo un error al enviar el formulario de avance, inténtelo de nuevo más tarde.",
    advance
  );

// export const getCatalogs = async () => Promise.resolve(catalogsMockData.results ?? []);
//
// export const getPartidas = async () => Promise.resolve(partidaMockData.results ?? []);
//
// export const getConcepts = async () => Promise.resolve(conceptoMockData.results ?? []);
