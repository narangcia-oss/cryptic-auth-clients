import { useAuth } from "../context/AuthContext";

/**
 * Hook for handling OAuth authentication flows
 */
export function useOAuth() {
  const { oauthLogin, isLoading, error } = useAuth();

  return {
    /**
     * Initiate OAuth login with a provider
     * @param provider OAuth provider name (e.g., 'google', 'github', 'discord')
     * @param scopes Optional array of OAuth scopes to request
     */
    login: oauthLogin,
    isLoading,
    error,
  };
}
