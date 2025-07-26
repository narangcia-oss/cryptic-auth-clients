import type { AuthTokens } from "../types";

export interface OAuth2FragmentResult {
  success: boolean;
  tokens?: AuthTokens;
  error?: string;
  errorDescription?: string;
}

/**
 * OAuth2 Fragment Handler for processing tokens from URL fragments
 * This handles the new OAuth2 flow where the backend redirects to frontend with tokens
 */
export class OAuth2FragmentHandler {
  private static hasProcessed = false;
  private static currentFragment = "";

  /**
   * Checks if the current URL contains OAuth2 fragment parameters
   */
  static isOAuth2Fragment(): boolean {
    const fragment = window.location.hash.substring(1);
    const params = new URLSearchParams(fragment);

    const hasFragment = params.has("access_token") || params.has("error");
    console.log(
      "[OAuth2FragmentHandler] isOAuth2Fragment:",
      hasFragment,
      fragment
    );
    return hasFragment;
  }

  /**
   * Resets the processing state (for testing or manual reset)
   */
  static resetProcessingState(): void {
    this.hasProcessed = false;
    this.currentFragment = "";
  }

  /**
   * Processes OAuth2 tokens from URL fragment
   */
  static processFragment(): OAuth2FragmentResult {
    const fragment = window.location.hash.substring(1);

    // Prevent processing the same fragment multiple times
    if (this.hasProcessed && this.currentFragment === fragment) {
      console.log(
        "[OAuth2FragmentHandler] Fragment already processed, skipping"
      );
      return {
        success: false,
        error: "already_processed",
        errorDescription: "This OAuth2 fragment has already been processed",
      };
    }

    this.currentFragment = fragment;
    this.hasProcessed = true;

    const params = new URLSearchParams(fragment);

    console.log(
      "[OAuth2FragmentHandler] processFragment: fragment =",
      fragment
    );

    // Check for error first
    if (params.has("error")) {
      const error = params.get("error") || "Unknown OAuth error";
      const errorDescription =
        params.get("error_description") || "No description provided";

      console.warn(
        "[OAuth2FragmentHandler] OAuth2 error detected:",
        error,
        errorDescription
      );

      return {
        success: false,
        error,
        errorDescription,
      };
    }

    // Extract tokens
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const userId = params.get("user_id");
    const tokenType = params.get("token_type"); // Usually "Bearer"
    const expiresIn = params.get("expires_in"); // Token expiration in seconds

    console.log("[OAuth2FragmentHandler] Extracted tokens:", {
      accessToken,
      refreshToken,
      userId,
      tokenType,
      expiresIn,
    });

    if (!accessToken || !refreshToken || !userId) {
      console.error(
        "[OAuth2FragmentHandler] Missing required authentication parameters"
      );
      return {
        success: false,
        error: "incomplete_auth_data",
        errorDescription: "Missing required authentication parameters",
      };
    }

    return {
      success: true,
      tokens: {
        access_token: accessToken,
        refresh_token: refreshToken,
        // Store additional metadata if needed
        user_id: userId,
        token_type: tokenType || "Bearer",
        expires_in: expiresIn ? parseInt(expiresIn) : undefined,
      },
    };
  }

  /**
   * Clears OAuth2 parameters from URL fragment for security
   */
  static clearFragment(): void {
    console.log("[OAuth2FragmentHandler] Clearing OAuth2 fragment from URL");
    try {
      // Remove the fragment from URL without triggering navigation
      const newUrl = window.location.pathname + window.location.search;
      window.history.replaceState(null, "", newUrl);

      // Additional cleanup - ensure hash is completely removed
      if (window.location.hash) {
        window.location.hash = "";
      }

      // Reset processing state after clearing
      this.resetProcessingState();
    } catch (error) {
      console.error("[OAuth2FragmentHandler] Error clearing fragment:", error);
      // Fallback: reload the page without the fragment
      window.location.href = window.location.pathname + window.location.search;
    }
  }

  /**
   * Complete OAuth2 fragment processing - process and clean up
   */
  static processAndClear(): OAuth2FragmentResult {
    console.log("[OAuth2FragmentHandler] processAndClear called");
    const result = this.processFragment();
    this.clearFragment();
    console.log("[OAuth2FragmentHandler] processAndClear result:", result);
    return result;
  }
}

/**
 * Utility function to check if current page is an OAuth2 callback
 */
export function isOAuth2Callback(): boolean {
  return OAuth2FragmentHandler.isOAuth2Fragment();
}

/**
 * Utility function to extract OAuth2 tokens from URL fragment
 */
export function extractOAuth2Tokens(): OAuth2FragmentResult {
  return OAuth2FragmentHandler.processAndClear();
}
