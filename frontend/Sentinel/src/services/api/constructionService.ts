import { BaseService } from "./baseService";
import { Construction } from "../../types/entities";

class ConstructionService extends BaseService<Construction> {
  constructor() {
    super("obra/constructions/");
  }

  // Obtener obras asignadas al usuario actual
  async getMyConstructions() {
    try {
      const response = await this.getAll({ params: { assigned_to_me: true } });
      return response;
    } catch (error) {
      console.error("Error al obtener obras asignadas:", error);
      throw error;
    }
  }
}

export default new ConstructionService();
