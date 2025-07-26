/**
 * Token utility functions
 */

import type { AuthTokens, LoginResponse, OAuthSignupResponse } from "../types";

/**
 * Checks if a token is expired based on its timestamp
 */
export function isTokenExpired(exp: number): boolean {
  const now = Math.floor(Date.now() / 1000);
  const expired = exp < now;
  console.log("[Tokens] Checking token expiration:", { exp, now, expired });
  return expired;
}

/**
 * Extracts tokens from auth response
 */
export function extractTokens(
  response: LoginResponse | OAuthSignupResponse
): AuthTokens {
  console.log("[Tokens] Extracting tokens from response:", response);
  return {
    access_token: response.access_token,
    refresh_token: response.refresh_token,
  };
}

/**
 * Stores tokens securely (placeholder for future custom storage)
 */
export function storeTokens(
  tokens: AuthTokens,
  storage: "memory" | "localStorage" | "sessionStorage" = "memory"
): void {
  console.log("[Tokens] Storing tokens:", { tokens, storage });
  switch (storage) {
    case "localStorage":
      localStorage.setItem("auth_tokens", JSON.stringify(tokens));
      break;
    case "sessionStorage":
      sessionStorage.setItem("auth_tokens", JSON.stringify(tokens));
      break;
    default:
      // Memory storage is handled by the AuthClient instance
      break;
  }
}

/**
 * Retrieves stored tokens
 */
export function retrieveTokens(
  storage: "memory" | "localStorage" | "sessionStorage" = "memory"
): AuthTokens | null {
  console.log("[Tokens] Retrieving tokens from storage:", storage);
  switch (storage) {
    case "localStorage": {
      const localTokens = localStorage.getItem("auth_tokens");
      console.log("[Tokens] Retrieved from localStorage:", localTokens);
      return localTokens ? JSON.parse(localTokens) : null;
    }
    case "sessionStorage": {
      const sessionTokens = sessionStorage.getItem("auth_tokens");
      console.log("[Tokens] Retrieved from sessionStorage:", sessionTokens);
      return sessionTokens ? JSON.parse(sessionTokens) : null;
    }
    default:
      // Memory storage is handled by the AuthClient instance
      return null;
  }
}

/**
 * Clears stored tokens
 */
export function clearStoredTokens(
  storage: "memory" | "localStorage" | "sessionStorage" = "memory"
): void {
  console.log("[Tokens] Clearing stored tokens from:", storage);
  switch (storage) {
    case "localStorage":
      localStorage.removeItem("auth_tokens");
      break;
    case "sessionStorage":
      sessionStorage.removeItem("auth_tokens");
      break;
    default:
      // Memory storage is handled by the AuthClient instance
      break;
  }
}
