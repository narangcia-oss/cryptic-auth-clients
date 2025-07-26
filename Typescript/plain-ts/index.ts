// Core exports
export { AuthClient } from "./core/client";

// Core OAuth callback handler (framework agnostic)
export {
  OAuthCallbackHandler,
  type OAuthCallbackResult,
} from "./utils/oauth-callback";

// Types exports
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
  AuthState,
  AuthUser,
  AuthContextValue,
} from "./types";

// Utility exports
export {
  generateOAuthState,
  storeOAuthState,
  getStoredOAuthState,
  clearOAuthState,
  validateOAuthState,
  extractOAuthParams,
  isOAuthCallback,
  cleanOAuthUrl,
} from "./utils/oauth";

export {
  OAuth2FragmentHandler,
  isOAuth2Callback,
  extractOAuth2Tokens,
  type OAuth2FragmentResult,
} from "./utils/oauth2-fragment-handler";

export {
  isTokenExpired,
  extractTokens,
  storeTokens,
  retrieveTokens,
  clearStoredTokens,
} from "./utils/tokens";
