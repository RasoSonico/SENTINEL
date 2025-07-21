import { BaseService } from "../../services/api/baseService";
import { apiRequest } from "../../services/api/apiClient";
import { Construction, UserConstruction } from "../../types/entities";

interface Catalog {
  id: number;
  construction: number;
  name: string;
  creation_date: string;
  is_active: boolean;
  reason_of_change: string;
}

class ConstructionService extends BaseService<Construction> {
  constructor() {
    super("obra/constructions/");
  }

  /**
   * Obtiene las obras asignadas al usuario actual
   */
  async getMyConstructions(): Promise<Construction[]> {
    try {
      console.log(
        "🔍 Requesting my constructions: /api/obra/constructions/my_constructions/?role=CONTRATISTA"
      );

      const response = await apiRequest<Construction[]>(
        "get",
        "/api/obra/constructions/my_constructions/?role=CONTRATISTA",
        "Error al obtener obras asignadas"
      );

      console.log("📦 My constructions response:", response);
      return response;
    } catch (error) {
      console.error("Error al obtener obras asignadas:", error);
      throw error;
    }
  }

  /**
   * Obtiene la primera obra asignada al usuario con rol específico
   * @param role Rol del usuario (por defecto 'CONTRATISTA')
   */
  async getAssignedConstruction(
    role: string = "CONTRATISTA"
  ): Promise<Construction | null> {
    try {
      const endpoint = `/api/obra/constructions/my_constructions/?role=${role}`;
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

      // Devuelve la primera construcción encontrada o null si no hay
      const result = response.length > 0 ? response[0] : null;
      console.log("✅ Returning assigned construction:", result);

      return result;
    } catch (error) {
      console.error("❌ Error al obtener obra asignada:", error);
      throw error;
    }
  }

  /**
   * Obtiene todos los detalles de construcciones asignadas al usuario
   */
  async getUserConstructions(): Promise<Construction[]> {
    try {
      console.log("🔍 Requesting all user constructions (no filters)");

      const response = await apiRequest<Construction[]>(
        "get",
        "/api/obra/constructions/my_constructions/?role=CONTRATISTA",
        "Error al obtener asignaciones de usuario"
      );

      console.log("📦 All user constructions response:", {
        responseLength: response.length,
        constructions: response,
      });

      return response;
    } catch (error) {
      console.error("❌ Error al obtener asignaciones de usuario:", error);
      throw error;
    }
  }

  /**
   * Obtiene los catálogos de una construcción específica
   * @param constructionId ID de la construcción
   */
  async getCatalogsByConstruction(constructionId: number): Promise<Catalog[]> {
    try {
      const endpoint = `/api/catalogo/catalog/?construction=${constructionId}`;
      console.log("🔍 Requesting catalogs for construction:", endpoint);

      const response = await apiRequest<{
        count: number;
        next: string | null;
        previous: string | null;
        results: Catalog[];
      }>("get", endpoint, "Error al obtener catálogos de la construcción");

      console.log("📦 Catalogs response:", {
        count: response.count,
        resultsLength: response.results.length,
        catalogs: response.results,
      });

      return response.results;
    } catch (error) {
      console.error("❌ Error al obtener catálogos de la construcción:", error);
      throw error;
    }
  }
}

export const constructionService = new ConstructionService();
