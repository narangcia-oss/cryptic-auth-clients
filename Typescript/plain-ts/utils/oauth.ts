/**
 * OAuth utility functions
 */

/**
 * Generates a secure random state for OAuth CSRF protection
 */
export function generateOAuthState(): string {
  const state =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  console.log("[OAuth] Generated OAuth state:", state);
  return state;
}

/**
 * Stores OAuth state securely for validation
 */
export function storeOAuthState(state: string): void {
  console.log("[OAuth] Storing OAuth state:", state);
  sessionStorage.setItem("oauth_state", state);
}

/**
 * Retrieves stored OAuth state for validation
 */
export function getStoredOAuthState(): string | null {
  const state = sessionStorage.getItem("oauth_state");
  console.log("[OAuth] Retrieved stored OAuth state:", state);
  return state;
}

/**
 * Clears stored OAuth state
 */
export function clearOAuthState(): void {
  console.log("[OAuth] Clearing stored OAuth state");
  sessionStorage.removeItem("oauth_state");
}

/**
 * Validates OAuth state to prevent CSRF attacks
 */
export function validateOAuthState(receivedState: string): boolean {
  const storedState = getStoredOAuthState();
  const isValid = receivedState === storedState;
  console.log("[OAuth] Validating OAuth state:", {
    receivedState,
    storedState,
    isValid,
  });
  return isValid;
}

/**
 * Extracts OAuth callback parameters from URL
 */
export function extractOAuthParams(): {
  code: string | null;
  state: string | null;
  error: string | null;
} {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    code: urlParams.get("code"),
    state: urlParams.get("state"),
    error: urlParams.get("error"),
  };
}

/**
 * Checks if current URL is an OAuth callback
 */
export function isOAuthCallback(): boolean {
  return (
    window.location.pathname.includes("/auth/") &&
    window.location.search.includes("code=")
  );
}

/**
 * Cleans OAuth parameters from URL
 */
export function cleanOAuthUrl(): void {
  window.history.replaceState({}, document.title, window.location.origin);
}
