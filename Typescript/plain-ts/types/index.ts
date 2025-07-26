/**
 * Core authentication types for the auth package
 */

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
  // OAuth2 additional fields
  user_id?: string;
  token_type?: string;
  expires_in?: number;
}

export interface UserCredentials {
  username: string;
  password: string;
}

export interface SignupResponse {
  id: string;
  identifier: string;
}

export interface LoginResponse {
  id: string;
  identifier: string;
  access_token: string;
  refresh_token: string;
}

export interface TokenValidationResponse {
  valid: boolean;
  claims: {
    sub: string;
    exp: number;
  };
}

export interface OAuthAuthResponse {
  auth_url: string;
}

export interface OAuthSignupResponse {
  id: string;
  access_token: string;
  refresh_token: string;
  oauth_info: {
    provider: string;
    email: string;
    name: string;
  };
}

export interface OAuthCallbackParams {
  code: string;
  state: string;
}

export interface AuthConfig {
  baseURL: string;
  enableAutoRefresh?: boolean;
  tokenStorage?: "memory" | "localStorage" | "sessionStorage" | "custom";
}

// Auth Context types for React
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  tokens: AuthTokens | null;
}

export interface AuthUser {
  id: string;
  identifier: string;
  oauth_info?: {
    provider: string;
    email: string;
    name: string;
  };
}

export interface AuthContextValue extends AuthState {
  login: (credentials: UserCredentials) => Promise<void>;
  signup: (credentials: UserCredentials) => Promise<void>;
  logout: () => void;
  oauthLogin: (provider: string) => Promise<void>;
  refreshToken: () => Promise<void>;
}
