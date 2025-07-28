# cryptic-auth/plain-ts

> **Plain TypeScript client library for cryptic-auth servers. Framework-agnostic with no dependencies.**

---

## Overview

`cryptic-auth/plain-ts` is a TypeScript client library for connecting to cryptic-auth authentication servers. It provides framework-agnostic utilities and types that work in any TypeScript environment - frontend, backend, or serverless - without dependencies on React or other UI frameworks.

- **Core AuthClient**: Connects to cryptic-auth servers for login, signup, token management, and OAuth2 flows.
- **OAuth2 Utilities**: Secure state management, callback handling, and URL parameter extraction.
- **Token Utilities**: Store, retrieve, and validate tokens in memory or browser storage.
- **Type Definitions**: Strongly-typed interfaces for all authentication flows.

---

## Installation

```bash
npm install @narangcia-oss/cryptic-auth-client-plain-ts
# or
yarn add @narangcia-oss/cryptic-auth-client-plain-ts
# or
pnpm add @narangcia-oss/cryptic-auth-client-plain-ts
# or
bun add @narangcia-oss/cryptic-auth-client-plain-ts
```

---

## Features

- **Framework-agnostic**: Use in any TypeScript project (SPA, Node.js, etc.).
- **OAuth2 Support**: Secure, extensible OAuth2 login and callback handling.
- **Token Management**: Utilities for storing, retrieving, and validating tokens.
- **Type Safety**: Comprehensive TypeScript types for all flows.
- **No UI dependencies**: Pure logic, easy to integrate anywhere.

---

## Quick Start

### 1. Initialize the AuthClient

```typescript
import { AuthClient } from "@narangcia-oss/cryptic-auth/plain-ts";

const auth = new AuthClient({
  baseURL: "https://your-cryptic-auth-server.com/api", // Your cryptic-auth server URL
  enableAutoRefresh: true, // optional, default: true
  tokenStorage: "memory",  // or "localStorage", "sessionStorage"
});
```

### 2. Login & Signup

```typescript
// Login
await auth.login({ username: "user", password: "pass" });

// Signup
await auth.signup({ username: "newuser", password: "newpass" });
```

### 3. OAuth2 Login Flow

```typescript
import {
  generateOAuthState,
  storeOAuthState,
  OAuthCallbackHandler,
} from "@narangcia-oss/cryptic-auth/plain-ts";

// Step 1: Start OAuth2 login
const state = generateOAuthState();
storeOAuthState(state);
const authUrl = await auth.generateOAuthAuthUrl("github", state, ["user:email"]);
window.location.href = authUrl;

// Step 2: Handle OAuth2 callback (on redirect/callback page)
const handler = new OAuthCallbackHandler(auth);
const result = await handler.processCallback();
if (result.success) {
  // User is authenticated, tokens are set
} else {
  // Handle error
}
```

---

## API Reference

### AuthClient

- `constructor(config: AuthConfig)`
- `login(credentials: UserCredentials): Promise<LoginResponse>`
- `signup(credentials: UserCredentials): Promise<SignupResponse>`
- `oauthLoginCallback(provider: string, params: OAuthCallbackParams): Promise<LoginResponse>`
- `oauthSignupCallback(provider: string, params: OAuthCallbackParams): Promise<OAuthSignupResponse>`
- `generateOAuthAuthUrl(provider: string, state: string, scopes: string[]): Promise<string>`
- `validateToken(token: string): Promise<TokenValidationResponse>`
- `healthCheck(): Promise<unknown>`
- `setTokens(accessToken: string, refreshToken?: string): void`
- `clearTokens(): void`
- `getAccessToken(): string | null`
- `getRefreshToken(): string | null`
- `isAuthenticated(): boolean`
- `getAxiosInstance(): AxiosInstance`

### OAuth Utilities

- `generateOAuthState(): string`
- `storeOAuthState(state: string): void`
- `getStoredOAuthState(): string | null`
- `clearOAuthState(): void`
- `validateOAuthState(receivedState: string): boolean`
- `extractOAuthParams(): { code: string | null; state: string | null; error: string | null }`
- `isOAuthCallback(): boolean`
- `cleanOAuthUrl(): void`

### OAuth2 Fragment Handler

- `OAuth2FragmentHandler.processAndClear(): OAuth2FragmentResult`
- `isOAuth2Callback(): boolean`
- `extractOAuth2Tokens(): OAuth2FragmentResult`

### Token Utilities

- `isTokenExpired(exp: number): boolean`
- `extractTokens(response: LoginResponse | OAuthSignupResponse): AuthTokens`
- `storeTokens(tokens: AuthTokens, storage?: "memory" | "localStorage" | "sessionStorage"): void`
- `retrieveTokens(storage?: "memory" | "localStorage" | "sessionStorage"): AuthTokens | null`
- `clearStoredTokens(storage?: "memory" | "localStorage" | "sessionStorage"): void`

---

## Types

All types are exported from `@narangcia-oss/cryptic-auth/plain-ts/types`:

- `AuthTokens`
- `UserCredentials`
- `SignupResponse`
- `LoginResponse`
- `TokenValidationResponse`
- `OAuthAuthResponse`
- `OAuthSignupResponse`
- `OAuthCallbackParams`
- `AuthConfig`
- `AuthState`
- `AuthUser`
- `AuthContextValue`

---

## Example: Full OAuth2 Flow

```typescript
import {
  AuthClient,
  generateOAuthState,
  storeOAuthState,
  OAuthCallbackHandler,
} from "@narangcia-oss/cryptic-auth/plain-ts";

const auth = new AuthClient({ baseURL: "https://your-cryptic-auth-server.com/api" });

// Start OAuth2 login
const state = generateOAuthState();
storeOAuthState(state);
const url = await auth.generateOAuthAuthUrl("google", state, ["profile", "email"]);
window.location.href = url;

// On callback page
const handler = new OAuthCallbackHandler(auth);
const result = await handler.processCallback();
if (result.success) {
  // Authenticated!
  const tokens = result.tokens;
} else {
  // Handle error
}
```

---

## Security Notes

- Always validate the OAuth `state` parameter to prevent CSRF attacks.
- Use HTTPS for all cryptic-auth server endpoints.
- Store tokens securely; prefer memory storage for sensitive flows.

---

## License

MIT

---
