import { BaseService } from "../../services/api/baseService";
import apiClient from "../../services/api/apiClient";
import { Construction, UserConstruction } from "../../types/entities";
import { AxiosRequestConfig } from "axios";

class ConstructionService extends BaseService<Construction> {
  constructor() {
    super("obra/constructions/");
  }

  /**
   * Obtiene las obras asignadas al usuario actual
   */
  async getMyConstructions(): Promise<Construction[]> {
    try {
      const response = await apiClient.get<{
        count: number;
        results: Construction[];
      }>("obra/constructions/", {
        params: { assigned_to_me: true },
      });
      return response.data.results;
    } catch (error) {
      console.error("Error al obtener obras asignadas:", error);
      throw error;
    }
  }

  /**
   * Obtiene la asignación de obra para el usuario con rol específico
   * @param role Rol del usuario (por defecto 'CONTRATISTA')
   * @param active Solo asignaciones activas (por defecto true)
   */
  async getAssignedConstruction(
    role: string = "CONTRATISTA",
    active: boolean = true
  ): Promise<UserConstruction | null> {
    try {
      const response = await apiClient.get<{
        count: number;
        results: UserConstruction[];
      }>("obra/user-constructions/", {
        params: { role, is_active: active },
      });

      // Devuelve la primera asignación activa encontrada o null si no hay
      return response.data.results.length > 0 ? response.data.results[0] : null;
    } catch (error) {
      console.error("Error al obtener obra asignada:", error);
      throw error;
    }
  }

  /**
   * Obtiene todos los detalles de construcciones asignadas con roles
   */
  async getUserConstructions(): Promise<UserConstruction[]> {
    try {
      const response = await apiClient.get<{
        count: number;
        results: UserConstruction[];
      }>("obra/user-constructions/");
      return response.data.results;
    } catch (error) {
      console.error("Error al obtener asignaciones de usuario:", error);
      throw error;
    }
  }
}

export const constructionService = new ConstructionService();
