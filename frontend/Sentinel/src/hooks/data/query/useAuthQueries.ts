import { useQuery } from "@tanstack/react-query";
import { authMe } from "../api/authApi";

export const useAuthMeQuery = (enabled: boolean) =>
  useQuery({
    queryKey: ["authMe"],
    queryFn: authMe,
    enabled,
    // staleTime: 60 * 60 * 1000, // 60 minutes
  });
