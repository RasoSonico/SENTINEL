import { apiRequest } from "src/services/api/apiClient";
import { API_CONFIG } from "src/services/api/config";
import { CatalogoApiResponse } from "src/types/catalogo";
import { catalogsMockData, conceptoMockData, partidaMockData } from "../mocks/avanceMockData";

// export const getCatalogs = async () => await apiRequest(
//     'get',
//     API_CONFIG.endpoints.catalogs,
//     'Hubo un error al obtener los catálogos, inténtelo de nuevo más tarde.',
//   );
//
// export const getPartidas = async () => await apiRequest(
//     'get',
//     API_CONFIG.endpoints.partidas,
//     'Hubo un error al obtener las partidas, inténtelo de nuevo más tarde.',
//   );

// export const getConcepts = async () => await apiRequest(
//     'get',
//     API_CONFIG.endpoints.concepts,
//     'Hubo un error al obtener los conceptos, inténtelo de nuevo más tarde.',
//   );
//
export const getCatalogs = async () => Promise.resolve(catalogsMockData.results ?? []);

export const getPartidas = async () => Promise.resolve(partidaMockData.results ?? []);

export const getConcepts = async () => Promise.resolve(conceptoMockData.results ?? []);

