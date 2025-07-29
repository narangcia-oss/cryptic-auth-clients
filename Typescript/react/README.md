# cryptic-auth/react

> **React hooks and components for cryptic-auth authentication with seamless OAuth2 integration and intuitive developer experience.**

---

## Overview

`@narangcia-oss/cryptic-auth-client-react` provides a complete React solution for integrating with cryptic-auth servers. It offers an intuitive, hook-based API with pre-built components for common authentication flows.

- **🎣 React Hooks**: Simple hooks for authentication state management
- **🔐 Auth Context**: Global authentication state with React Context
- **🚀 OAuth2 Support**: One-click OAuth login with popular providers
- **🛡️ Route Protection**: Easy route guards and authentication checks
- **📱 Components**: Pre-built login forms and OAuth buttons
- **🎨 Customizable**: Flexible styling and behavior customization
- **📝 TypeScript**: Full TypeScript support with comprehensive types

---

## Installation

```bash
npm install @narangcia-oss/cryptic-auth-client-react
# or
yarn add @narangcia-oss/cryptic-auth-client-react
# or
pnpm add @narangcia-oss/cryptic-auth-client-react
```

**Peer Dependencies:**
- `react ^16.8.0 || ^17.0.0 || ^18.0.0`
- `react-dom ^16.8.0 || ^17.0.0 || ^18.0.0`

---

## Quick Start

### 1. Setup AuthProvider

Wrap your app with the `AuthProvider`:

```tsx
import React from 'react';
import { AuthProvider } from '@narangcia-oss/cryptic-auth-client-react';

function App() {
  return (
    <AuthProvider
      config={{
        baseURL: 'https://your-cryptic-auth-server.com/api',
        tokenStorage: 'localStorage', // or 'sessionStorage', 'memory'
      }}
    >
      <YourAppContent />
    </AuthProvider>
  );
}
```

### 2. Use Authentication in Components

```tsx
import React from 'react';
import { useAuth, useUser, AuthGuard } from '@narangcia-oss/cryptic-auth-client-react';

function Dashboard() {
  const { logout } = useAuth();
  const { user, displayName, email } = useUser();

  return (
    <AuthGuard fallback={<div>Please log in</div>}>
      <div>
        <h1>Welcome, {displayName}!</h1>
        {email && <p>Email: {email}</p>}
        <button onClick={logout}>Logout</button>
      </div>
    </AuthGuard>
  );
}
```

### 3. Add Login with Pre-built Components

```tsx
import React from 'react';
import { LoginForm, OAuthButton } from '@narangcia-oss/cryptic-auth-client-react';

function LoginPage() {
  return (
    <div>
      <h1>Login</h1>

      {/* Traditional login form */}
      <LoginForm
        onSuccess={() => console.log('Logged in!')}
        onError={(error) => console.error('Login failed:', error)}
      />

      <div>
        <p>Or continue with:</p>
        <OAuthButton provider="google">Continue with Google</OAuthButton>
        <OAuthButton provider="github">Continue with GitHub</OAuthButton>
        <OAuthButton provider="discord">Continue with Discord</OAuthButton>
      </div>
    </div>
  );
}
```

---

## Core Hooks

### `useAuth()`

Main authentication hook with full state and actions:

```tsx
import { useAuth } from '@narangcia-oss/cryptic-auth-client-react';

function MyComponent() {
  const {
    // State
    isAuthenticated,
    isLoading,
    user,
    tokens,
    error,

    // Actions
    login,
    signup,
    logout,
    oauthLogin,
    refreshToken,
    clearError,
  } = useAuth();

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {isAuthenticated ? (
        <div>Welcome back!</div>
      ) : (
        <button onClick={() => login({ username: 'user', password: 'pass' })}>
          Login
        </button>
      )}
    </div>
  );
}
```

### `useUser()`

Hook focused on current user information:

```tsx
import { useUser } from '@narangcia-oss/cryptic-auth-client-react';

function UserProfile() {
  const {
    user,
    isAuthenticated,
    displayName,
    email,
    oauthProvider,
  } = useUser();

  if (!isAuthenticated) return <div>Not logged in</div>;

  return (
    <div>
      <h2>{displayName}</h2>
      {email && <p>Email: {email}</p>}
      {oauthProvider && <p>Signed in with {oauthProvider}</p>}
    </div>
  );
}
```

### `useOAuth()`

Specialized hook for OAuth flows:

```tsx
import { useOAuth } from '@narangcia-oss/cryptic-auth-client-react';

function SocialLogin() {
  const { login, isLoading, error } = useOAuth();

  const handleGoogleLogin = () => {
    login('google', ['profile', 'email']);
  };

  return (
    <div>
      <button onClick={handleGoogleLogin} disabled={isLoading}>
        {isLoading ? 'Redirecting...' : 'Login with Google'}
      </button>
      {error && <div>Error: {error}</div>}
    </div>
  );
}
```

### `useCredentialAuth()`

Hook for username/password authentication:

```tsx
import { useCredentialAuth } from '@narangcia-oss/cryptic-auth-client-react';

function LoginForm() {
  const { login, signup, isLoading, error } = useCredentialAuth();
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    login(credentials);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### `useAuthGuard()`

Hook for protecting routes and components:

```tsx
import { useAuthGuard } from '@narangcia-oss/cryptic-auth-client-react';

function ProtectedPage() {
  const { canAccess, isChecking } = useAuthGuard({
    redirectTo: '/login',
    redirect: true,
  });

  if (isChecking) return <div>Checking authentication...</div>;
  if (!canAccess) return null; // Will redirect

  return <div>Protected content</div>;
}
```

---

## Components

### `<AuthGuard>`

Conditionally render content based on authentication status:

```tsx
import { AuthGuard } from '@narangcia-oss/cryptic-auth-client-react';

function App() {
  return (
    <AuthGuard
      fallback={<LoginPage />}
      loading={<div>Loading...</div>}
      redirect={false} // Set to true to redirect instead of showing fallback
      redirectTo="/login"
    >
      <Dashboard />
    </AuthGuard>
  );
}
```

### `<OAuthButton>`

Pre-styled OAuth login button:

```tsx
import { OAuthButton } from '@narangcia-oss/cryptic-auth-client-react';

function LoginOptions() {
  return (
    <div>
      <OAuthButton
        provider="google"
        scopes={['profile', 'email']}
        className="my-custom-button"
        onBeforeLogin={() => console.log('Starting OAuth flow')}
      >
        Continue with Google
      </OAuthButton>

      <OAuthButton provider="github" />
      <OAuthButton provider="discord" />
    </div>
  );
}
```

### `<LoginForm>`

Complete login form with validation:

```tsx
import { LoginForm } from '@narangcia-oss/cryptic-auth-client-react';

function LoginPage() {
  return (
    <LoginForm
      onSuccess={() => {
        console.log('Login successful!');
        // Redirect or update UI
      }}
      onError={(error) => {
        console.error('Login failed:', error);
        // Show error message
      }}
      className="my-login-form"
      submitText="Sign In"
      showSignupLink={true}
    />
  );
}
```

---

## OAuth2 Flow Example

Complete OAuth2 implementation:

```tsx
import React from 'react';
import {
  AuthProvider,
  useAuth,
  OAuthButton,
  AuthGuard,
} from '@narangcia-oss/cryptic-auth-client-react';

// App wrapper with AuthProvider
function App() {
  return (
    <AuthProvider
      config={{
        baseURL: 'https://your-cryptic-auth-server.com/api',
        tokenStorage: 'localStorage',
      }}
      autoHandleOAuthCallback={true} // Automatically handle OAuth callbacks
      onAuthSuccess={(user, tokens) => {
        console.log('User authenticated:', user);
      }}
      onError={(error) => {
        console.error('Auth error:', error);
      }}
    >
      <AppContent />
    </AuthProvider>
  );
}

// Main app content
function AppContent() {
  return (
    <AuthGuard
      fallback={<LoginPage />}
      loading={<div>Checking authentication...</div>}
    >
      <Dashboard />
    </AuthGuard>
  );
}

// Login page with OAuth options
function LoginPage() {
  return (
    <div>
      <h1>Welcome</h1>
      <div>
        <OAuthButton provider="google">Continue with Google</OAuthButton>
        <OAuthButton provider="github">Continue with GitHub</OAuthButton>
      </div>
    </div>
  );
}

// Protected dashboard
function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.identifier}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## Advanced Usage

### Custom Token Storage

```tsx
import { AuthProvider } from '@narangcia-oss/cryptic-auth-client-react';

// Custom storage implementation
const customStorage = {
  getItem: (key: string) => {
    // Your custom storage logic
    return localStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    // Your custom storage logic
    localStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    // Your custom storage logic
    localStorage.removeItem(key);
  },
};

function App() {
  return (
    <AuthProvider
      config={{
        baseURL: 'https://your-server.com/api',
        tokenStorage: 'custom', // Use custom storage
      }}
    >
      <YourApp />
    </AuthProvider>
  );
}
```

### Manual OAuth Callback Handling

```tsx
import { useEffect } from 'react';
import {
  AuthProvider,
  isOAuthCallbackURL,
  cleanOAuthURL,
  hasOAuthError,
  getOAuthError
} from '@narangcia-oss/cryptic-auth-client-react';

function App() {
  useEffect(() => {
    // Check if this is an OAuth callback page
    if (isOAuthCallbackURL()) {
      console.log('OAuth callback detected');

      if (hasOAuthError()) {
        const error = getOAuthError();
        console.error('OAuth error:', error);
      }

      // Clean the URL after handling
      setTimeout(() => {
        cleanOAuthURL();
      }, 1000);
    }
  }, []);

  return (
    <AuthProvider
      config={{ baseURL: 'https://your-server.com/api' }}
      autoHandleOAuthCallback={false} // Handle manually
    >
      <YourApp />
    </AuthProvider>
  );
}
```

---

## TypeScript Support

All hooks and components are fully typed. Import types as needed:

```tsx
import {
  AuthState,
  AuthContextValue,
  AuthProviderProps,
  AuthTokens,
  AuthUser,
  UserCredentials,
} from '@narangcia-oss/cryptic-auth-client-react';

const MyComponent: React.FC = () => {
  const auth: AuthContextValue = useAuth();
  const user: AuthUser | null = auth.user;

  return <div>{user?.identifier}</div>;
};
```

---

## Styling

The components include minimal default classes for easy styling:

```css
/* OAuth Button */
.oauth-button {
  padding: 12px 24px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.oauth-button:hover {
  background: #f5f5f5;
}

.oauth-button-google {
  border-color: #4285f4;
  color: #4285f4;
}

.oauth-button-github {
  border-color: #333;
  color: #333;
}

/* Login Form */
.login-form {
  max-width: 400px;
  margin: 0 auto;
}

.form-field {
  margin-bottom: 1rem;
}

.form-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-field input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.error-message {
  color: #e74c3c;
  font-size: 0.875rem;
  margin: 0.5rem 0;
}

.submit-button {
  width: 100%;
  padding: 0.75rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

---

## Migration from Plain TS

If you're migrating from the plain TypeScript client:

```tsx
// Before (plain-ts)
import { AuthClient, generateOAuthState, storeOAuthState } from '@narangcia-oss/cryptic-auth-client-plain-ts';

const auth = new AuthClient({ baseURL: 'https://your-server.com/api' });
const state = generateOAuthState();
storeOAuthState(state);
const url = await auth.generateOAuthAuthUrl('google', state, ['profile']);
window.location.href = url;

// After (react)
import { useOAuth } from '@narangcia-oss/cryptic-auth-client-react';

function LoginButton() {
  const { login } = useOAuth();

  return (
    <button onClick={() => login('google', ['profile'])}>
      Login with Google
    </button>
  );
}
```

---

## API Reference

### Hooks

- `useAuth()` - Main authentication hook
- `useUser()` - Current user information
- `useOAuth()` - OAuth authentication flows
- `useCredentialAuth()` - Username/password authentication
- `useAuthGuard()` - Route protection

### Components

- `<AuthProvider>` - Authentication context provider
- `<AuthGuard>` - Conditional rendering based on auth state
- `<OAuthButton>` - Pre-built OAuth login button
- `<LoginForm>` - Complete login form

### Utilities

- `isOAuthCallbackURL()` - Check if current URL is OAuth callback
- `hasOAuthError()` - Check for OAuth errors in URL
- `getOAuthError()` - Extract OAuth error details
- `cleanOAuthURL()` - Remove OAuth parameters from URL
- `getTokenExpiration()` - Get token expiration date
- `isTokenExpiring()` - Check if token is expiring soon

---

## License

MIT

---
