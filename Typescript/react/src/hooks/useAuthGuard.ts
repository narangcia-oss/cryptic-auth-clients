import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export interface UseAuthGuardOptions {
  /**
   * Redirect URL when user is not authenticated
   * @default '/login'
   */
  redirectTo?: string;
  /**
   * Whether to redirect immediately or just return loading state
   * @default true
   */
  redirect?: boolean;
  /**
   * Custom redirect function
   */
  onUnauthenticated?: () => void;
}

/**
 * Hook for protecting routes that require authentication
 */
export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const { isAuthenticated, isLoading } = useAuth();
  const { redirectTo = "/login", redirect = true, onUnauthenticated } = options;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      if (onUnauthenticated) {
        onUnauthenticated();
      } else if (redirect && typeof window !== "undefined") {
        window.location.href = redirectTo;
      }
    }
  }, [isAuthenticated, isLoading, redirect, redirectTo, onUnauthenticated]);

  return {
    isAuthenticated,
    isLoading,
    /**
     * Whether the current route should be accessible
     */
    canAccess: isAuthenticated,
    /**
     * Whether we're still checking authentication status
     */
    isChecking: isLoading,
  };
}
