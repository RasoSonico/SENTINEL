import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../types/auth";

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  role: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
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
        token?: string | null;
        role?: string | null;
        user: User | null;
      }>
    ) => {
      state.isAuthenticated = !!action.payload.token || !!state.token;
      state.token =
        action.payload.token !== undefined ? action.payload.token : state.token;
      state.role =
        action.payload.role !== undefined ? action.payload.role : state.role;
      state.user = action.payload.user;
      state.loading = false;
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
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
      state.token = null;
      state.role = null;
      state.user = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setCredentials, setToken, setLoading, setError, logout } =
  authSlice.actions;
export default authSlice.reducer;
