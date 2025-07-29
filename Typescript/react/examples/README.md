# Examples

This directory contains usage examples for `@narangcia-oss/cryptic-auth-client-react`.

## Files

### `basic-app.tsx`
A complete React application demonstrating:
- Basic AuthProvider setup
- Login/logout flows
- OAuth button integration
- User information display
- Pre-built LoginForm component

### `route-protection.tsx`
Shows how to implement route protection using:
- React Router integration
- AuthGuard component
- useAuthGuard hook
- OAuth callback handling
- Protected and public routes

### `advanced-usage.tsx`
Advanced patterns including:
- Custom error boundaries
- Notification system
- Token expiration monitoring
- Advanced OAuth customization
- Analytics integration
- Enhanced UX patterns

### `styles.css`
Complete CSS styling for:
- OAuth buttons with provider themes
- Login form styling
- Loading states and animations
- Responsive design
- Dashboard layouts
- Notification system

## Usage

To use these examples in your project:

1. Install the package:
```bash
npm install @narangcia-oss/cryptic-auth-client-react
```

2. Copy the relevant example code
3. Customize the configuration and styling to match your needs
4. Add your cryptic-auth server URL to the config

## Quick Start

The simplest way to get started is with the basic example:

```tsx
import { AuthProvider, useAuth, OAuthButton } from '@narangcia-oss/cryptic-auth-client-react';

function App() {
  return (
    <AuthProvider config={{ baseURL: 'https://your-server.com/api' }}>
      <MyApp />
    </AuthProvider>
  );
}

function MyApp() {
  const { isAuthenticated, logout } = useAuth();

  return isAuthenticated ? (
    <div>
      <h1>Welcome!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  ) : (
    <OAuthButton provider="google">Login with Google</OAuthButton>
  );
}
```

## Configuration

All examples assume you have a cryptic-auth server running. Update the `baseURL` in the AuthProvider config to point to your server.

## Customization

The examples use basic styling that you can customize:
- Modify the CSS classes in `styles.css`
- Override component props and styling
- Implement custom components using the hooks
- Add your own branding and themes
