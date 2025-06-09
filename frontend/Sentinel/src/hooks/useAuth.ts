import { useDispatch, useSelector } from "react-redux";
import { useAuthMeQuery } from "./data/query/useAuthQueries";
import { useEffect } from "react";
import { QueryClient } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import authConfig from "../config/authConfig.json";
import { useAzureAuth } from "./providers/useAzureAuth";
import { selectAuthInfo } from "src/redux/selectors/authSelectors";
import {
  clearCredentials,
  setCredentials,
  setToken,
} from "src/redux/slices/authSlice";
import { AuthConfig } from "src/types/auth";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { token, role, user } = useSelector(selectAuthInfo);
  const {
    data: authUser,
    isSuccess: isAuthUserSuccessful,
    isPending: isAuthUserPending,
    isError: isAuthUserError,
    refetch: refetchAuthUser,
  } = useAuthMeQuery(true);
  const queryClient = new QueryClient();

  const activeProvider = (authConfig as AuthConfig).activeProvider;
  const providers = (authConfig as AuthConfig).providers;

  const azureAuth = useAzureAuth(providers.azure, activeProvider === "azure");

  useEffect(() => {
    const loadToken = async () => {
      const token = await getToken("auth_token");
      if (token) {
        dispatch(setToken(token));
      }
    };

    loadToken();
  }, [dispatch]);

  useEffect(() => {
    console.group("Auth loaded correctly")
    console.log("token:", token);
    console.log("role:", role);
    console.log("user:", user);
    console.groupEnd();
  }, [token, role, user]);

  // Get the active provider based on configuration
  const getActiveProvider = () => {
    switch (activeProvider) {
      case "azure":
        return azureAuth;
      default:
        console.error(`Unsupported auth provider: ${activeProvider}`);
        return azureAuth; // Default to Azure
    }
  };

  const login = async (): Promise<string | null> => {
    const provider = getActiveProvider();
    const token = await provider.login();

    if (token) {
      await saveToken("auth_token", token);
      dispatch(setToken(token));

      // Refetch the authenticated user after login
      refetchAuthUser();
    }

    return token;
  };

  useEffect(() => {
    if (isAuthUserSuccessful) {
      const { user, role } = authUser;
      dispatch(
        setCredentials({
          user,
          role,
        })
      );
    }

    if (isAuthUserError) {
      console.error("Error authenticating user");
      dispatch(clearCredentials());
    }
  }, [isAuthUserSuccessful, isAuthUserError, authUser, dispatch]);

  const logout = async () => {
    queryClient.invalidateQueries({
      queryKey: ["authMe"],
    });
    await revokeToken("auth_token");
    dispatch(clearCredentials());
  };

  const saveToken = async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value);
  };

  const getToken = async (key: string) => {
    return await SecureStore.getItemAsync(key);
  };

  const revokeToken = async (key: string) => {
    await SecureStore.deleteItemAsync(key);
  };

  return {
    token,
    role,
    user,
    login,
    logout,
    saveToken,
    getToken,
    isAuthUserPending,
    isAuthUserSuccessful,
    isAuthUserError,
    activeProvider,
  };
};
