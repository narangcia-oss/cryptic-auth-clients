import { useAuth } from "../context/AuthContext";

/**
 * Hook for handling traditional username/password authentication
 */
export function useCredentialAuth() {
  const { login, signup, isLoading, error } = useAuth();

  return {
    /**
     * Login with username and password
     */
    login,
    /**
     * Sign up with username and password
     */
    signup,
    isLoading,
    error,
  };
}
