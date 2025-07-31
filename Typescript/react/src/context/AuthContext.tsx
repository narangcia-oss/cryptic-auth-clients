import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  AuthClient,
  AuthTokens,
  AuthConfig,
  UserCredentials,
  AuthUser,
  generateOAuthState,
  storeOAuthState,
  OAuthCallbackHandler,
  retrieveTokens,
  clearStoredTokens,
  storeTokens,
} from "plain-ts";

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  tokens: AuthTokens | null;
  error: string | null;
}

export interface AuthContextValue extends AuthState {
  login: (credentials: UserCredentials) => Promise<void>;
  signup: (credentials: UserCredentials) => Promise<void>;
  logout: () => void;
  oauthLogin: (provider: string, scopes?: string[]) => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export interface AuthProviderProps {
  children: ReactNode;
  config: AuthConfig;
  /**
   * Whether to automatically handle OAuth callbacks on mount
   * @default true
   */
  autoHandleOAuthCallback?: boolean;
  /**
   * Custom error handler for authentication errors
   */
  onError?: (error: Error) => void;
  /**
   * Custom success handler for authentication success
   */
  onAuthSuccess?: (user: AuthUser, tokens: AuthTokens) => void;
}

export function AuthProvider({
  children,
  config,
  autoHandleOAuthCallback = true,
  onError,
  onAuthSuccess,
}: AuthProviderProps) {
  const [authClient] = useState(() => new AuthClient(config));
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    tokens: null,
    error: null,
  });

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error, isLoading: false }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const setAuthenticatedUser = useCallback(
    (user: AuthUser, tokens: AuthTokens) => {
      setState({
        isAuthenticated: true,
        isLoading: false,
        user,
        tokens,
        error: null,
      });
      onAuthSuccess?.(user, tokens);
    },
    [onAuthSuccess]
  );

  const login = useCallback(
    async (credentials: UserCredentials) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        const response = await authClient.login(credentials);

        const tokens: AuthTokens = {
          access_token: response.access_token,
          refresh_token: response.refresh_token,
        };

        const user: AuthUser = {
          id: response.id,
          identifier: response.identifier,
        };

        authClient.setTokens(response.access_token, response.refresh_token);
        setAuthenticatedUser(user, tokens);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Login failed";
        setError(errorMessage);
        onError?.(error instanceof Error ? error : new Error(errorMessage));
      }
    },
    [authClient, setError, setAuthenticatedUser, onError]
  );

  const signup = useCallback(
    async (credentials: UserCredentials) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        await authClient.signup(credentials);

        // After successful signup, automatically log in
        await login(credentials);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Signup failed";
        setError(errorMessage);
        onError?.(error instanceof Error ? error : new Error(errorMessage));
      }
    },
    [authClient, login, setError, onError]
  );

  const logout = useCallback(() => {
    authClient.clearTokens();
    const validStorageTypes: Array<"memory" | "localStorage" | "sessionStorage" | undefined> = [
      "memory",
      "localStorage",
      "sessionStorage",
      undefined,
    ];
    const storageType = validStorageTypes.indexOf(config.tokenStorage as any) !== -1
      ? (config.tokenStorage as "memory" | "localStorage" | "sessionStorage" | undefined)
      : undefined;
    clearStoredTokens(storageType);
    setState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      tokens: null,
      error: null,
    });
  }, [authClient, config.tokenStorage]);

  const oauthLogin = useCallback(
    async (provider: string, scopes: string[] = ["profile", "email"]) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const state = generateOAuthState();
        storeOAuthState(state);

        const authUrl = await authClient.generateOAuthAuthUrl(
          provider,
          state,
          scopes
        );
        window.location.href = authUrl;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "OAuth login failed";
        setError(errorMessage);
        onError?.(error instanceof Error ? error : new Error(errorMessage));
      }
    },
    [authClient, setError, onError]
  );

  const refreshToken = useCallback(async () => {
    try {
      // This would need to be implemented in the AuthClient
      // For now, we'll attempt to validate the current token
      const accessToken = authClient.getAccessToken();
      if (accessToken) {
        const validation = await authClient.validateToken(accessToken);
        if (!validation.valid) {
          logout();
        }
      }
    } catch (error) {
      logout();
      onError?.(
        error instanceof Error ? error : new Error("Token refresh failed")
      );
    }
  }, [authClient, logout, onError]);

  // Handle OAuth callback on mount
  useEffect(() => {
    const handleOAuthCallback = async () => {
      if (!autoHandleOAuthCallback) return;

      try {
        const handler = new OAuthCallbackHandler(authClient);
        const result = await handler.processCallback();

        if (result.success && result.tokens && result.user) {
          
          setAuthenticatedUser(result.user, result.tokens);
          return;
        }
      } catch (error) {
        // Not an OAuth callback or failed, continue with normal initialization
      }

      // Check for existing tokens
      const validStorageTypes: Array<"memory" | "localStorage" | "sessionStorage" | undefined> = [
        "memory",
        "localStorage",
        "sessionStorage",
        undefined,
      ];
      const storageType = validStorageTypes.indexOf(config.tokenStorage as any) !== -1
        ? (config.tokenStorage as "memory" | "localStorage" | "sessionStorage" | undefined)
        : undefined;
      const existingTokens = retrieveTokens(storageType);
      if (existingTokens?.access_token) {
        try {
          const validation = await authClient.validateToken(
            existingTokens.access_token
          );
          if (validation.valid) {
            authClient.setTokens(
              existingTokens.access_token,
              existingTokens.refresh_token
            );

            // Create user object from token claims
            const user: AuthUser = {
              id: validation.claims.sub,
              identifier: validation.claims.sub, // Fallback, ideally we'd have more user info
            };

            setAuthenticatedUser(user, existingTokens);
            return;
          }
        } catch (error) {
          // Token validation failed, clear invalid tokens
          const validStorageTypes: Array<"memory" | "localStorage" | "sessionStorage" | undefined> = [
            "memory",
            "localStorage",
            "sessionStorage",
            undefined,
          ];
          const storageType = validStorageTypes.indexOf(config.tokenStorage as any) !== -1
            ? (config.tokenStorage as "memory" | "localStorage" | "sessionStorage" | undefined)
            : undefined;
          clearStoredTokens(storageType);
        }
      }

      // No valid authentication found
      setState((prev) => ({ ...prev, isLoading: false }));
    };

    handleOAuthCallback();
  }, [
    authClient,
    config.tokenStorage,
    autoHandleOAuthCallback,
    setAuthenticatedUser,
  ]);

  const contextValue: AuthContextValue = {
    ...state,
    login,
    signup,
    logout,
    oauthLogin,
    refreshToken,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
