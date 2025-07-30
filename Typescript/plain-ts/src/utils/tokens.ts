/**
 * Token utility functions
 */

import type { AuthTokens, LoginResponse, OAuthSignupResponse } from "../types/index";

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

/**
 * Extract token expiration time from JWT token
 */
export function getTokenExpiration(token: string): Date | null {
  try {
    // JWT tokens have 3 parts separated by dots
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Decode the payload (middle part)
    const payload = JSON.parse(atob(parts[1]));

    if (payload.exp) {
      // exp is in seconds, Date expects milliseconds
      return new Date(payload.exp * 1000);
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Check if a token is expired or will expire within a certain timeframe
 */
export function isTokenExpiring(
  token: string,
  bufferMinutes: number = 5
): boolean {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true; // Assume expired if we can't parse

  const now = new Date();
  const bufferTime = bufferMinutes * 60 * 1000; // Convert to milliseconds

  return expiration.getTime() - now.getTime() <= bufferTime;
}

/**
 * Get token payload without verification (client-side only)
 */
export function getTokenPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
}

/**
 * Format tokens for secure storage
 */
export function formatTokensForStorage(tokens: AuthTokens): string {
  return JSON.stringify({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    user_id: tokens.user_id,
    token_type: tokens.token_type,
    expires_in: tokens.expires_in,
    timestamp: Date.now(),
  });
}

/**
 * Parse tokens from secure storage
 */
export function parseTokensFromStorage(stored: string): AuthTokens | null {
  try {
    const parsed = JSON.parse(stored);
    return {
      access_token: parsed.access_token,
      refresh_token: parsed.refresh_token,
      user_id: parsed.user_id,
      token_type: parsed.token_type,
      expires_in: parsed.expires_in,
    };
  } catch {
    return null;
  }
}
