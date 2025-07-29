/**
 * Utility functions for OAuth callback handling in React applications
 */

/**
 * Check if the current URL is an OAuth callback
 */
export function isOAuthCallbackURL(): boolean {
  if (typeof window === "undefined") return false;

  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has("code") && urlParams.has("state");
}

/**
 * Check if the current URL has OAuth error parameters
 */
export function hasOAuthError(): boolean {
  if (typeof window === "undefined") return false;

  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has("error");
}

/**
 * Get OAuth error details from URL
 */
export function getOAuthError(): {
  error: string | null;
  error_description: string | null;
  error_uri: string | null;
} {
  if (typeof window === "undefined") {
    return { error: null, error_description: null, error_uri: null };
  }

  const urlParams = new URLSearchParams(window.location.search);
  return {
    error: urlParams.get("error"),
    error_description: urlParams.get("error_description"),
    error_uri: urlParams.get("error_uri"),
  };
}

/**
 * Clean OAuth parameters from the current URL without triggering a page reload
 */
export function cleanOAuthURL(): void {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  const paramsToRemove = [
    "code",
    "state",
    "error",
    "error_description",
    "error_uri",
  ];

  paramsToRemove.forEach((param) => {
    url.searchParams.delete(param);
  });

  window.history.replaceState({}, "", url.toString());
}
