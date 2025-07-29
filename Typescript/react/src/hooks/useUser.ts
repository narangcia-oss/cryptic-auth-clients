import { useAuth } from "../context/AuthContext";

/**
 * Hook for accessing current user information and authentication state
 */
export function useUser() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return {
    /**
     * Current authenticated user, null if not authenticated
     */
    user,
    /**
     * Whether the user is currently authenticated
     */
    isAuthenticated,
    /**
     * Whether authentication state is currently being determined
     */
    isLoading,
    /**
     * User's display name (fallback to identifier if no name available)
     */
    displayName: user?.oauth_info?.name || user?.identifier || null,
    /**
     * User's email (from OAuth info if available)
     */
    email: user?.oauth_info?.email || null,
    /**
     * OAuth provider used for authentication (if any)
     */
    oauthProvider: user?.oauth_info?.provider || null,
  };
}
