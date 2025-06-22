import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  AdvanceRegistration,
  Concept,
  PhysicalAdvance,
  PhysicalAdvanceSummary,
} from "../../../types/entities";
import advanceService from "../../../modules/avance/services/advanceService";
import photoService from "../../../modules/avance/services/photoService";
import { Photo } from "../../../hooks/avance/usePhotoCapture";
import { RootState } from "../../store";

// Interfaces para el estado
interface AdvanceState {
  // Estado de conceptos disponibles
  availableConcepts: {
    items: Concept[];
    loading: boolean;
    error: string | null;
    total: number;
    page: number;
    pages: number;
  };

  // Estado de avances registrados
  advances: {
    items: PhysicalAdvance[];
    loading: boolean;
    error: string | null;
    total: number;
    page: number;
    pages: number;
  };

  // Avance seleccionado/actual
  currentAdvance: {
    data: AdvanceRegistration | null;
    photos: Photo[];
    loading: boolean;
    error: string | null;
    success: boolean;
  };

  // Resumen de avances
  summary: {
    data: PhysicalAdvanceSummary | null;
    loading: boolean;
    error: string | null;
  };

  // Estado de sincronización offline
  offlineSync: {
    pendingCount: number;
    lastSyncTime: number | null;
    isSyncing: boolean;
    isOnline: boolean;
  };
}

// Estado inicial
const initialState: AdvanceState = {
  availableConcepts: {
    items: [],
    loading: false,
    error: null,
    total: 0,
    page: 1,
    pages: 0,
  },
  advances: {
    items: [],
    loading: false,
    error: null,
    total: 0,
    page: 1,
    pages: 0,
  },
  currentAdvance: {
    data: null,
    photos: [],
    loading: false,
    error: null,
    success: false,
  },
  summary: {
    data: null,
    loading: false,
    error: null,
  },
  offlineSync: {
    pendingCount: 0,
    lastSyncTime: null,
    isSyncing: false,
    isOnline: true,
  },
};

// Thunks asíncronos

// Cargar conceptos disponibles para avance
export const fetchAvailableConcepts = createAsyncThunk(
  "advance/fetchAvailableConcepts",
  async (
    params: {
      constructionId: string;
      workItemId?: string;
      query?: string;
      page?: number;
      pageSize?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      return await advanceService.getAvailableConcepts(params.constructionId, {
        workItemId: params.workItemId,
        query: params.query,
        page: params.page,
        pageSize: params.pageSize,
      });
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Error al obtener conceptos disponibles"
      );
    }
  }
);

// Cargar avances registrados
export const fetchAdvancesByConstruction = createAsyncThunk(
  "advance/fetchAdvancesByConstruction",
  async (
    params: {
      constructionId: string;
      conceptId?: string;
      startDate?: string;
      endDate?: string;
      status?: "pending" | "approved" | "rejected";
      page?: number;
      pageSize?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      return await advanceService.getAdvancesByConstruction(
        params.constructionId,
        {
          conceptId: params.conceptId,
          startDate: params.startDate,
          endDate: params.endDate,
          status: params.status,
          page: params.page,
          pageSize: params.pageSize,
        }
      );
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Error al obtener avances"
      );
    }
  }
);

// Cargar resumen de avances
export const fetchAdvanceSummary = createAsyncThunk(
  "advance/fetchAdvanceSummary",
  async (constructionId: string, { rejectWithValue }) => {
    try {
      return await advanceService.getAdvanceSummary(constructionId);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Error al obtener resumen de avances"
      );
    }
  }
);

// Registrar avance
export const registerAdvance = createAsyncThunk(
  "advance/registerAdvance",
  async (
    params: {
      advance: AdvanceRegistration;
      photos: Photo[];
    },
    { rejectWithValue }
  ) => {
    try {
      // Primero registramos el avance
      const registeredAdvance = await advanceService.registerAdvance(
        params.advance
      );

      // Si hay fotos, las subimos asociadas al avance
      if (params.photos.length > 0) {
        const photoUris = params.photos.map((photo) => photo.uri);
        await photoService.uploadMultiplePhotos(
          photoUris,
          "advance",
          registeredAdvance.id,
          {
            construction_id: params.advance.construction_id,
            concept_id: params.advance.concept_id,
          }
        );
      }

      return registeredAdvance;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Error al registrar avance"
      );
    }
  }
);

// Aprobar avance
export const approveAdvance = createAsyncThunk(
  "advance/approveAdvance",
  async (
    params: {
      advanceId: string;
      comments?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      return await advanceService.approveAdvance(
        params.advanceId,
        params.comments
      );
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Error al aprobar avance"
      );
    }
  }
);

// Rechazar avance
export const rejectAdvance = createAsyncThunk(
  "advance/rejectAdvance",
  async (
    params: {
      advanceId: string;
      reason: string;
    },
    { rejectWithValue }
  ) => {
    try {
      return await advanceService.rejectAdvance(
        params.advanceId,
        params.reason
      );
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Error al rechazar avance"
      );
    }
  }
);

// Slice
const advanceSlice = createSlice({
  name: "advance",
  initialState,
  reducers: {
    // Establecer estado de conexión
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.offlineSync.isOnline = action.payload;
    },

    // Establecer estado de sincronización
    setSyncingStatus: (state, action: PayloadAction<boolean>) => {
      state.offlineSync.isSyncing = action.payload;
    },

    // Actualizar contador de elementos pendientes
    updatePendingCount: (state, action: PayloadAction<number>) => {
      state.offlineSync.pendingCount = action.payload;
    },

    // Actualizar tiempo de última sincronización
    updateLastSyncTime: (state, action: PayloadAction<number>) => {
      state.offlineSync.lastSyncTime = action.payload;
    },

    // Establecer datos de avance actual
    setCurrentAdvanceData: (
      state,
      action: PayloadAction<AdvanceRegistration | null>
    ) => {
      state.currentAdvance.data = action.payload;
      state.currentAdvance.success = false;
      state.currentAdvance.error = null;
    },

    // Establecer fotos de avance actual
    setCurrentAdvancePhotos: (state, action: PayloadAction<Photo[]>) => {
      state.currentAdvance.photos = action.payload;
    },

    // Añadir foto a avance actual
    addPhotoToCurrentAdvance: (state, action: PayloadAction<Photo>) => {
      state.currentAdvance.photos.push(action.payload);
    },

    // Eliminar foto de avance actual
    removePhotoFromCurrentAdvance: (state, action: PayloadAction<string>) => {
      state.currentAdvance.photos = state.currentAdvance.photos.filter(
        (photo) => photo.id !== action.payload
      );
    },

    // Limpiar estado de avance actual
    clearCurrentAdvance: (state) => {
      state.currentAdvance.data = null;
      state.currentAdvance.photos = [];
      state.currentAdvance.loading = false;
      state.currentAdvance.error = null;
      state.currentAdvance.success = false;
    },

    // Limpiar error de avance actual
    clearCurrentAdvanceError: (state) => {
      state.currentAdvance.error = null;
    },

    // Resetear estado de éxito de avance actual
    resetCurrentAdvanceSuccess: (state) => {
      state.currentAdvance.success = false;
    },
  },
  extraReducers: (builder) => {
    // Manejar fetchAvailableConcepts
    builder
      .addCase(fetchAvailableConcepts.pending, (state) => {
        state.availableConcepts.loading = true;
        state.availableConcepts.error = null;
      })
      .addCase(fetchAvailableConcepts.fulfilled, (state, action) => {
        state.availableConcepts.loading = false;
        state.availableConcepts.items = action.payload.concepts;
        state.availableConcepts.total = action.payload.total;
        state.availableConcepts.pages = action.payload.pages;
        state.availableConcepts.page = action.meta.arg.page || 1;
      })
      .addCase(fetchAvailableConcepts.rejected, (state, action) => {
        state.availableConcepts.loading = false;
        state.availableConcepts.error = action.payload as string;
      });

    // Manejar fetchAdvancesByConstruction
    builder
      .addCase(fetchAdvancesByConstruction.pending, (state) => {
        state.advances.loading = true;
        state.advances.error = null;
      })
      .addCase(fetchAdvancesByConstruction.fulfilled, (state, action) => {
        state.advances.loading = false;
        state.advances.items = action.payload.advances;
        state.advances.total = action.payload.total;
        state.advances.pages = action.payload.pages;
        state.advances.page = action.meta.arg.page || 1;
      })
      .addCase(fetchAdvancesByConstruction.rejected, (state, action) => {
        state.advances.loading = false;
        state.advances.error = action.payload as string;
      });

    // Manejar fetchAdvanceSummary
    builder
      .addCase(fetchAdvanceSummary.pending, (state) => {
        state.summary.loading = true;
        state.summary.error = null;
      })
      .addCase(fetchAdvanceSummary.fulfilled, (state, action) => {
        state.summary.loading = false;
        state.summary.data = action.payload;
      })
      .addCase(fetchAdvanceSummary.rejected, (state, action) => {
        state.summary.loading = false;
        state.summary.error = action.payload as string;
      });

    // Manejar registerAdvance
    builder
      .addCase(registerAdvance.pending, (state) => {
        state.currentAdvance.loading = true;
        state.currentAdvance.error = null;
        state.currentAdvance.success = false;
      })
      .addCase(registerAdvance.fulfilled, (state, action) => {
        state.currentAdvance.loading = false;
        state.currentAdvance.success = true;
        state.advances.items = [action.payload, ...state.advances.items];
        state.advances.total += 1;
      })
      .addCase(registerAdvance.rejected, (state, action) => {
        state.currentAdvance.loading = false;
        state.currentAdvance.error = action.payload as string;
      });

    // Manejar approveAdvance
    builder.addCase(approveAdvance.fulfilled, (state, action) => {
      state.advances.items = state.advances.items.map((item) =>
        item.id === action.payload.id ? action.payload : item
      );
    });

    // Manejar rejectAdvance
    builder.addCase(rejectAdvance.fulfilled, (state, action) => {
      state.advances.items = state.advances.items.map((item) =>
        item.id === action.payload.id ? action.payload : item
      );
    });
  },
});

// Exportar acciones
export const {
  setOnlineStatus,
  setSyncingStatus,
  updatePendingCount,
  updateLastSyncTime,
  setCurrentAdvanceData,
  setCurrentAdvancePhotos,
  addPhotoToCurrentAdvance,
  removePhotoFromCurrentAdvance,
  clearCurrentAdvance,
  clearCurrentAdvanceError,
  resetCurrentAdvanceSuccess,
} = advanceSlice.actions;

// Selectores
export const selectAvailableConcepts = (state: RootState) =>
  state.advance.availableConcepts;
export const selectAdvances = (state: RootState) => state.advance.advances;
export const selectCurrentAdvance = (state: RootState) =>
  state.advance.currentAdvance;
export const selectAdvanceSummary = (state: RootState) => state.advance.summary;
export const selectOfflineSync = (state: RootState) =>
  state.advance.offlineSync;

export default advanceSlice.reducer;
