import * as SecureStore from "expo-secure-store";
import {
  refreshAsync,
  TokenResponse,
} from "expo-auth-session";

const STORAGE_KEY = "auth-token";

export async function saveTokenResponse(tokenResponse: TokenResponse) {
  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(tokenResponse));
}

export async function getTokenResponse(): Promise<TokenResponse | null> {
  const tokenResponseStr = await SecureStore.getItemAsync(STORAGE_KEY);

  if (!tokenResponseStr) return null;

  const tokenObject = JSON.parse(tokenResponseStr);
  return new TokenResponse(tokenObject);
}

export async function deleteToken() {
  await SecureStore.deleteItemAsync(STORAGE_KEY);
}

export async function maybeRefreshToken(
  discovery: any,
  clientId: string
): Promise<TokenResponse | null> {
  const token = await getTokenResponse();

  if (!token) return null;

  if(token.shouldRefresh()) {
    console.info("Token is expired, refreshing...");
  } else {
    console.info("Token is still valid, no refresh needed.");
  }

  if (!token.shouldRefresh()) return token;

  const refreshed = await refreshAsync(
    {
      clientId,
      refreshToken: token.refreshToken!,
    },
    discovery
  );

  await saveTokenResponse(refreshed);

  return refreshed;
}
