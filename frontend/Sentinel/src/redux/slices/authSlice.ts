import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../types/auth";

interface AuthState {
  isAuthenticated: boolean;
  role: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  role: null,
  user: null,
  loading: false,
  error: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        role?: string | null;
        user: User | null;
      }>
    ) => {
      state.role =
        action.payload.role !== undefined ? action.payload.role : state.role;
      state.user = action.payload.user;
      state.loading = false;
      state.error = null;
    },
    setIsAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.role = null;
      state.user = null;
      state.loading = false;
      state.error = null;
    },
    clearCredentials: (state) => {
      state.role = null;
      state.user = null;
    },
  },
});

export const {
  setCredentials,
  setLoading,
  setError,
  logout,
  clearCredentials,
  setIsAuthenticated,
} = authSlice.actions;
export default authSlice.reducer;
