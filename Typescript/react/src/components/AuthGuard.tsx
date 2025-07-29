import React, { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

export interface AuthGuardProps {
  /**
   * Content to render when user is authenticated
   */
  children: ReactNode;
  /**
   * Content to render when user is not authenticated
   */
  fallback?: ReactNode;
  /**
   * Content to render while checking authentication status
   */
  loading?: ReactNode;
  /**
   * Whether to redirect to login page when not authenticated
   * @default false
   */
  redirect?: boolean;
  /**
   * URL to redirect to when not authenticated
   * @default '/login'
   */
  redirectTo?: string;
}

/**
 * Component that conditionally renders content based on authentication status
 */
export function AuthGuard({
  children,
  fallback,
  loading,
  redirect = false,
  redirectTo = "/login",
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return loading ? <>{loading}</> : null;
  }

  // Redirect if not authenticated and redirect is enabled
  if (!isAuthenticated && redirect && typeof window !== "undefined") {
    window.location.href = redirectTo;
    return null;
  }

  // Show authenticated content or fallback
  if (isAuthenticated) {
    return <>{children}</>;
  }

  return fallback ? <>{fallback}</> : null;
}
