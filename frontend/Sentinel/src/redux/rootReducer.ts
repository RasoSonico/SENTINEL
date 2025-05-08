import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
// Aquí se isntalarán los reducers de cada módulo a medida que los creemos
// Por ahora, definiremos solo la estructura básica

export const rootReducer = combineReducers({
  auth: authReducer,
  // obra: obraReducer,
  // catalogo: catalogoReducer,
  // etc.
});
