import { useDispatch, useSelector } from "react-redux";
import { useAuthMeQuery } from "./data/query/useAuthQueries";
import { useEffect } from "react";
import { QueryClient } from "@tanstack/react-query";
import authConfig from "../config/authConfig.json";
import { useAzureAuth } from "./providers/useAzureAuth";
import { selectAuthInfo } from "src/redux/selectors/authSelectors";
import {
  clearCredentials,
  setCredentials,
  setIsAuthenticated,
} from "src/redux/slices/authSlice";
import { AuthConfig, AuthProvider } from "src/types/auth";
import { deleteToken, saveTokenResponse } from "src/utils/auth";

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

  // Get the active provider based on configuration
  const getActiveProvider = (): AuthProvider => {
    switch (activeProvider) {
      case "azure":
        return azureAuth;
      default:
        console.error(`Unsupported auth provider: ${activeProvider}`);
        return azureAuth; // Default to Azure
    }
  };

  const login = async () => {
    const provider = getActiveProvider();
    const tokenResponse = await provider.login();

    if (tokenResponse) {
      saveTokenResponse(tokenResponse);
      dispatch(setIsAuthenticated(true));
    }
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
    await deleteToken();
    dispatch(clearCredentials());
  };

  return {
    token,
    role,
    user,
    login,
    logout,
    isAuthUserPending,
    isAuthUserSuccessful,
    isAuthUserError,
    activeProvider,
    discovery: getActiveProvider().discovery,
    clientId: getActiveProvider().clientId,
  };
};
