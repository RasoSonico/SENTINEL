import Constants from "expo-constants";

// API url for expo config
const API_URL = Constants.expoConfig?.extra?.apiUrl;
export const isDevelopment =
  Constants.expoConfig?.extra?.environment === "development";
const baseURL = API_URL || "http://localhost:8000/api/";

export const API_CONFIG = {
  baseURL,
  endpoints: {
    auth: "/auth",
    catalogs: "/catalogs",
    partidas: "/partidas",
    concepts: "/concepts",
  },
  azureBlobUrl: "https://sentinel.blob.core.windows.net",
};

// Log the configured URL
console.log("API URL from Expo config:", API_URL);
