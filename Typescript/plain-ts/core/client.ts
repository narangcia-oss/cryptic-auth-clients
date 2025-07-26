import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import type {
  AuthTokens,
  UserCredentials,
  SignupResponse,
  LoginResponse,
  TokenValidationResponse,
  OAuthAuthResponse,
  OAuthSignupResponse,
  OAuthCallbackParams,
  AuthConfig,
} from "../types/index";
import { extractTokens, isTokenExpired } from "../utils/tokens";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _isRetry?: boolean;
}

/**
 * Core authentication client for handling all auth flows
 * Handles login, signup, OAuth, token refresh, and validation
 */
export class AuthClient {
  private api: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private failedQueue: {
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
    config: CustomAxiosRequestConfig;
  }[] = [];
  private config: AuthConfig;

  constructor(config: AuthConfig) {
    console.log("[AuthClient] Initializing with config:", {
      ...config,
      baseURL: config.baseURL,
    });

    if (!config.baseURL) {
      throw new Error("Base URL is required for AuthClient initialization.");
    }

    this.config = {
      enableAutoRefresh: true,
      tokenStorage: "memory",
      ...config,
    };

    this.api = axios.create({
      baseURL: this.config.baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor: attach access token
    this.api.interceptors.request.use(
      (config) => {
        if (this.accessToken && config.headers) {
          console.log("[AuthClient] Attaching access token to request.");
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => {
        console.error("[AuthClient] Request error:", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor: handle automatic token refresh
    this.api.interceptors.response.use(
      (response) => {
        console.log(
          "[AuthClient] Response received:",
          response.status,
          response.config.url
        );
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;

        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._isRetry &&
          this.config.enableAutoRefresh
        ) {
          console.warn("[AuthClient] 401 detected, attempting token refresh.");

          if (this.isRefreshing) {
            console.log(
              "[AuthClient] Token refresh already in progress, queueing request."
            );
            return new Promise((resolve, reject) => {
              this.failedQueue.push({
                resolve,
                reject,
                config: originalRequest,
              });
            });
          }

          this.isRefreshing = true;
          originalRequest._isRetry = true;

          try {
            if (!this.refreshToken) {
              console.error(
                "[AuthClient] No refresh token available, clearing tokens."
              );
              this.clearTokens();
              this.processQueue(null);
              return Promise.reject(
                new Error("Refresh token missing. Please re-authenticate.")
              );
            }

            console.log("[AuthClient] Attempting to refresh token...");
            const response = await this.refreshTokenFlow(this.refreshToken);
            const newAccessToken = response.access_token;
            const newRefreshToken = response.refresh_token;

            console.log(
              "[AuthClient] Token refresh successful. New access token set."
            );
            this.setTokens(newAccessToken, newRefreshToken);
            this.processQueue(newAccessToken);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
            console.log(
              "[AuthClient] Retrying original request after token refresh."
            );
            return this.api(originalRequest);
          } catch (refreshError) {
            console.error("[AuthClient] Token refresh failed:", refreshError);
            this.clearTokens();
            this.processQueue(null, refreshError);
            return Promise.reject(refreshError);
          } finally {
            console.log("[AuthClient] Token refresh process finished.");
            this.isRefreshing = false;
          }
        }

        console.error("[AuthClient] Response error:", error);
        return Promise.reject(error);
      }
    );
  }

  private processQueue(
    accessToken: string | null,
    error: unknown = null
  ): void {
    console.log(
      `[AuthClient] Processing failed request queue. Queue length: ${this.failedQueue.length}`
    );

    while (this.failedQueue.length) {
      const { resolve, reject, config } = this.failedQueue.shift()!;
      if (accessToken) {
        if (config.headers) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        console.log(
          "[AuthClient] Retrying queued request with new access token."
        );
        resolve(this.api(config));
      } else {
        console.error(
          "[AuthClient] Rejecting queued request due to missing access token."
        );
        reject(
          error || new AxiosError("Authentication required", "401", config)
        );
      }
    }
  }

  public setTokens(accessToken: string, refreshToken?: string): void {
    console.log("[AuthClient] Setting tokens.");
    this.accessToken = accessToken;
    this.refreshToken = refreshToken || null;
  }

  public clearTokens(): void {
    console.log("[AuthClient] Clearing all tokens.");
    this.accessToken = null;
    this.refreshToken = null;
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  public getRefreshToken(): string | null {
    return this.refreshToken;
  }

  public isAuthenticated(): boolean {
    return this.accessToken !== null;
  }

  public async login(credentials: UserCredentials): Promise<LoginResponse> {
    console.log(
      "[AuthClient] login called with username:",
      credentials.username
    );
    try {
      const response = await this.api.post<LoginResponse>(
        "/login",
        credentials
      );
      console.log("[AuthClient] Login successful for:", credentials.username);
      this.setTokens(response.data.access_token, response.data.refresh_token);
      return response.data;
    } catch (error) {
      console.error(
        "[AuthClient] Login failed for:",
        credentials.username,
        error
      );
      throw error;
    }
  }

  public async signup(credentials: UserCredentials): Promise<SignupResponse> {
    console.log(
      "[AuthClient] signup called with username:",
      credentials.username
    );
    try {
      const response = await this.api.post<SignupResponse>(
        "/signup",
        credentials
      );
      console.log("[AuthClient] Signup successful for:", credentials.username);
      return response.data;
    } catch (error) {
      console.error(
        "[AuthClient] Signup failed for:",
        credentials.username,
        error
      );
      throw error;
    }
  }

  private async refreshTokenFlow(refreshToken: string): Promise<AuthTokens> {
    console.log("[AuthClient] refreshTokenFlow called.");
    try {
      const response = await this.api.post<AuthTokens>("/token/refresh", {
        refresh_token: refreshToken,
      });
      console.log("[AuthClient] Token refresh API call successful.");
      return response.data;
    } catch (error) {
      console.error("[AuthClient] Token refresh API call failed:", error);
      throw error;
    }
  }

  public async validateToken(token: string): Promise<TokenValidationResponse> {
    console.log("[AuthClient] validateToken called.");
    try {
      const response = await this.api.post<TokenValidationResponse>(
        "/token/validate",
        { token }
      );
      console.log("[AuthClient] Token validation response:", response.data);
      return response.data;
    } catch (error) {
      console.error("[AuthClient] Token validation failed:", error);
      throw error;
    }
  }

  public async healthCheck(): Promise<unknown> {
    console.log("[AuthClient] healthCheck called.");
    try {
      const response = await this.api.get("/health");
      console.log("[AuthClient] Health check response:", response.data);
      return response.data;
    } catch (error) {
      console.error("[AuthClient] Health check failed:", error);
      throw error;
    }
  }

  public async generateOAuthAuthUrl(
    provider: string,
    state: string,
    scopes: string[]
  ): Promise<string> {
    console.log(
      `[AuthClient] generateOAuthAuthUrl called for provider: ${provider}`
    );
    try {
      const response = await this.api.get<OAuthAuthResponse>(
        `/oauth/${provider}/auth`,
        {
          params: {
            state,
            scopes: scopes.join(" "),
          },
        }
      );

      if (response.data && response.data.auth_url) {
        console.log(
          `[AuthClient] OAuth auth URL generated: ${response.data.auth_url}`
        );
        return response.data.auth_url;
      }

      console.error("[AuthClient] Invalid response from OAuth auth endpoint.");
      throw new Error("Invalid response from OAuth auth endpoint");
    } catch (error) {
      console.error(
        `[AuthClient] Failed to generate OAuth URL for ${provider}:`,
        error
      );
      throw error;
    }
  }

  public async oauthLoginCallback(
    provider: string,
    params: OAuthCallbackParams
  ): Promise<LoginResponse> {
    console.log(
      `[AuthClient] oauthLoginCallback called for provider: ${provider}`
    );
    try {
      const response = await this.api.post<LoginResponse>(`/oauth/login`, {
        provider,
        code: params.code,
        state: params.state,
      });
      console.log(
        `[AuthClient] OAuth login successful for provider: ${provider}`
      );
      this.setTokens(response.data.access_token, response.data.refresh_token);
      return response.data;
    } catch (error) {
      console.error(
        `[AuthClient] OAuth login failed for provider: ${provider}`,
        error
      );
      throw error;
    }
  }

  public async oauthSignupCallback(
    provider: string,
    params: OAuthCallbackParams
  ): Promise<OAuthSignupResponse> {
    console.log(
      `[AuthClient] oauthSignupCallback called for provider: ${provider}`
    );
    try {
      const response = await this.api.post<OAuthSignupResponse>(
        `/oauth/signup`,
        {
          provider,
          code: params.code,
          state: params.state,
        }
      );
      console.log(
        `[AuthClient] OAuth signup successful for provider: ${provider}`
      );
      this.setTokens(response.data.access_token, response.data.refresh_token);
      return response.data;
    } catch (error) {
      console.error(
        `[AuthClient] OAuth signup failed for provider: ${provider}`,
        error
      );
      throw error;
    }
  }

  public getAxiosInstance(): AxiosInstance {
    console.log("[AuthClient] getAxiosInstance called.");
    return this.api;
  }

  // Static utility methods
  public static extractTokens = extractTokens;
  public static isTokenExpired = isTokenExpired;
}
