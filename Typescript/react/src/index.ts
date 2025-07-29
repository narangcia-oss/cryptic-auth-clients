// Core context and provider
export { AuthProvider, useAuth } from "./context/AuthContext";
export type {
  AuthProviderProps,
  AuthState,
  AuthContextValue,
} from "./context/AuthContext";

// Specialized hooks
export { useOAuth } from "./hooks/useOAuth";
export { useCredentialAuth } from "./hooks/useCredentialAuth";
export { useUser } from "./hooks/useUser";
export { useAuthGuard } from "./hooks/useAuthGuard";

// React components
export { AuthGuard } from "./components/AuthGuard";
export { OAuthButton } from "./components/OAuthButton";
export { LoginForm } from "./components/LoginForm";

// Utility functions
export {
  isOAuthCallbackURL,
  hasOAuthError,
  getOAuthError,
  cleanOAuthURL,
} from "./utils/oauth";

export {
  getTokenExpiration,
  isTokenExpiring,
  getTokenPayload,
  formatTokensForStorage,
  parseTokensFromStorage,
} from "./utils/tokens";

// Re-export types from the base client for convenience
export type {
  AuthTokens,
  UserCredentials,
  SignupResponse,
  LoginResponse,
  TokenValidationResponse,
  OAuthAuthResponse,
  OAuthSignupResponse,
  OAuthCallbackParams,
  AuthConfig,
  AuthUser,
} from "@narangcia-oss/cryptic-auth-client-plain-ts";

// Re-export the base client for advanced usage
export { AuthClient } from "@narangcia-oss/cryptic-auth-client-plain-ts";
