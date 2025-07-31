import type { AuthClient } from "../core/client";
import type { AuthTokens, AuthUser } from "../types/index";
import {
  extractOAuthParams,
  validateOAuthState,
  clearOAuthState,
  isOAuthCallback as checkIsOAuthCallback,
} from "./oauth";
import { extractTokens } from "./tokens";

export interface OAuthCallbackResult {
  success: boolean;
  tokens?: AuthTokens;
  user?: AuthUser;
  error?: string;
}

/**
 * Core OAuth callback handler - framework agnostic
 * Handles the OAuth callback flow logic without any UI dependencies
 */
export class OAuthCallbackHandler {
  private authClient: AuthClient;

  constructor(authClient: AuthClient) {
    this.authClient = authClient;
  }

  /**
   * Checks if the current URL is an OAuth callback URL
   */
  isOAuthCallback(): boolean {
    return checkIsOAuthCallback();
  }

  /**
   * Processes the OAuth callback from the current URL
   * Returns the result without any UI side effects
   */
  async processCallback(): Promise<OAuthCallbackResult> {
    try {
      if (!this.isOAuthCallback()) {
        return {
          success: false,
          error: "Not an OAuth callback URL",
        };
      }

      const { code, state, error: oauthError } = extractOAuthParams();

      if (oauthError) {
        return {
          success: false,
          error: `OAuth error: ${oauthError}`,
        };
      }

      if (!code) {
        return {
          success: false,
          error: "Authorization code not found",
        };
      }

      if (!state) {
        return {
          success: false,
          error: "State parameter not found",
        };
      }

      if (!validateOAuthState(state)) {
        return {
          success: false,
          error: "Invalid state parameter - possible CSRF attack",
        };
      }

      // Clean up stored state
      clearOAuthState();

      // Extract provider from pathname (you might want to make this more robust)
      const provider = this.extractProviderFromUrl();

      // Handle OAuth callback
      const response = await this.authClient.oauthLoginCallback(provider, {
        code,
        state,
      });

      // Extract tokens from response
      const tokens = extractTokens(response);

      // Extract user information from response
      const user: AuthUser = {
        id: response.id,
        identifier: response.identifier,
      };

      return {
        success: true,
        tokens,
        user,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "OAuth authentication failed";
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Extracts the OAuth provider from the current URL
   * Override this method for custom provider detection logic
   */
  protected extractProviderFromUrl(): string {
    const pathname = window.location.pathname;
    if (pathname.includes("github")) return "github";
    if (pathname.includes("google")) return "google";
    if (pathname.includes("microsoft")) return "microsoft";

    // Default fallback - you might want to throw an error instead
    return "github";
  }

  /**
   * Cleans the OAuth parameters from the current URL
   */
  cleanUrl(): void {
    window.history.replaceState({}, document.title, window.location.origin);
  }
}
