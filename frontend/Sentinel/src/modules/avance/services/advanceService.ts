import { BaseService } from "../../../services/api/baseService";
import apiClient from "../../../services/api/apiClient";
import { AxiosRequestConfig } from "axios";
import {
  AdvanceRegistration,
  Concept,
  PhysicalAdvance,
  PhysicalAdvanceSummary,
} from "../../../types/entities";

/**
 * Servicio para gestión de avances físicos
 */
class AdvanceService extends BaseService<PhysicalAdvance> {
  constructor() {
    super("avance/physical/");
  }

  /**
   * Obtener conceptos disponibles para registrar avance
   * @param constructionId ID de la obra
   * @param params Parámetros adicionales de filtrado
   * @returns Lista de conceptos disponibles
   */
  async getAvailableConcepts(
    constructionId: string,
    params?: {
      workItemId?: string;
      query?: string;
      page?: number;
      pageSize?: number;
    }
  ): Promise<{
    concepts: Concept[];
    total: number;
    pages: number;
  }> {
    try {
      const config: AxiosRequestConfig = {
        params: {
          construction_id: constructionId,
          work_item_id: params?.workItemId,
          search: params?.query,
          page: params?.page || 1,
          page_size: params?.pageSize || 20,
        },
      };

      const response = await apiClient.get(
        "/catalogo/concept/available-for-advance/",
        config
      );
      return {
        concepts: response.data.results,
        total: response.data.count,
        pages: response.data.total_pages,
      };
    } catch (error) {
      console.error("Error al obtener conceptos disponibles:", error);
      throw error;
    }
  }

  /**
   * Registrar un avance físico
   * @param advance Datos del avance a registrar
   * @returns Avance registrado
   */
  async registerAdvance(
    advance: AdvanceRegistration
  ): Promise<PhysicalAdvance> {
    try {
      const response = await apiClient.post("/avance/physical/", advance);
      return response.data;
    } catch (error) {
      console.error("Error al registrar avance:", error);
      throw error;
    }
  }

  /**
   * Obtener avances registrados para una construcción
   * @param constructionId ID de la obra
   * @param params Parámetros adicionales
   * @returns Lista de avances
   */
  async getAdvancesByConstruction(
    constructionId: string,
    params?: {
      conceptId?: string;
      startDate?: string;
      endDate?: string;
      status?: "pending" | "approved" | "rejected";
      page?: number;
      pageSize?: number;
    }
  ): Promise<{
    advances: PhysicalAdvance[];
    total: number;
    pages: number;
  }> {
    try {
      const config: AxiosRequestConfig = {
        params: {
          construction_id: constructionId,
          concept_id: params?.conceptId,
          start_date: params?.startDate,
          end_date: params?.endDate,
          status: params?.status,
          page: params?.page || 1,
          page_size: params?.pageSize || 20,
        },
      };

      const response = await apiClient.get("/avance/physical/", config);
      return {
        advances: response.data.results,
        total: response.data.count,
        pages: response.data.total_pages,
      };
    } catch (error) {
      console.error("Error al obtener avances por construcción:", error);
      throw error;
    }
  }

  /**
   * Obtener resumen de avances por construcción
   * @param constructionId ID de la obra
   * @returns Resumen de avances
   */
  async getAdvanceSummary(
    constructionId: string
  ): Promise<PhysicalAdvanceSummary> {
    try {
      const response = await apiClient.get("/avance/physical/summary/", {
        params: { construction_id: constructionId },
      });
      return response.data;
    } catch (error) {
      console.error("Error al obtener resumen de avances:", error);
      throw error;
    }
  }

  /**
   * Aprobar un avance físico
   * @param advanceId ID del avance
   * @param comments Comentarios opcionales
   * @returns Avance actualizado
   */
  async approveAdvance(
    advanceId: string,
    comments?: string
  ): Promise<PhysicalAdvance> {
    try {
      const response = await apiClient.post(
        `/avance/physical/${advanceId}/approve/`,
        {
          comments,
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error al aprobar avance ${advanceId}:`, error);
      throw error;
    }
  }

  /**
   * Rechazar un avance físico
   * @param advanceId ID del avance
   * @param reason Motivo del rechazo
   * @returns Avance actualizado
   */
  async rejectAdvance(
    advanceId: string,
    reason: string
  ): Promise<PhysicalAdvance> {
    try {
      const response = await apiClient.post(
        `/avance/physical/${advanceId}/reject/`,
        {
          reason,
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error al rechazar avance ${advanceId}:`, error);
      throw error;
    }
  }

  /**
   * Verificar si un concepto tiene avances pendientes
   * @param conceptId ID del concepto
   * @returns true si tiene avances pendientes
   */
  async hasPendingAdvances(conceptId: string): Promise<boolean> {
    try {
      const response = await apiClient.get(`/avance/physical/check-pending/`, {
        params: { concept_id: conceptId },
      });
      return response.data.has_pending;
    } catch (error) {
      console.error(
        `Error al verificar avances pendientes para concepto ${conceptId}:`,
        error
      );
      throw error;
    }
  }
}

export default new AdvanceService();
