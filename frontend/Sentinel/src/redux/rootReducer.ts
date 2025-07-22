import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import advanceReducer from "./slices/avance/advanceSlice";
import advanceFormDataReducer from "./slices/avance/avanceFormDataSlice";
// Aquí se isntalarán los reducers de cada módulo a medida que los creemos
// Por ahora, definiremos solo la estructura básica

export const rootReducer = combineReducers({
  auth: authReducer,
  advance: advanceReducer,
  advanceFormData: advanceFormDataReducer,
  // obra: obraReducer,
  // catalogo: catalogoReducer,
  // etc.
});
