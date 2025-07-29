// Example: Route protection with React Router

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {
  AuthProvider,
  useAuth,
  useAuthGuard,
  AuthGuard,
} from "@narangcia-oss/cryptic-auth-client-react";

// App with routing
function App() {
  return (
    <AuthProvider config={{ baseURL: "https://your-server.com/api" }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Public Route */}
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

// Protected Route Component using AuthGuard
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard
      fallback={<Navigate to="/login" replace />}
      loading={<div>Loading...</div>}
    >
      {children}
    </AuthGuard>
  );
}

// Alternative: Protected Route using useAuthGuard hook
function ProtectedRouteWithHook({ children }: { children: React.ReactNode }) {
  const { canAccess, isChecking } = useAuthGuard({
    redirectTo: "/login",
    redirect: false, // Handle redirect manually
  });

  if (isChecking) {
    return <div>Checking authentication...</div>;
  }

  if (!canAccess) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Home Page - Public
function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      <h1>Welcome to MyApp</h1>
      {isAuthenticated ? (
        <div>
          <p>You're already logged in!</p>
          <a href="/dashboard">Go to Dashboard</a>
        </div>
      ) : (
        <div>
          <p>Please sign in to access your account.</p>
          <a href="/login">Login</a> | <a href="/signup">Sign Up</a>
        </div>
      )}
    </div>
  );
}

// Login Page
function LoginPage() {
  const { isAuthenticated } = useAuth();

  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="login-page">
      <h1>Login</h1>
      {/* Your login form here */}
    </div>
  );
}

// Signup Page
function SignupPage() {
  const { isAuthenticated } = useAuth();

  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="signup-page">
      <h1>Sign Up</h1>
      {/* Your signup form here */}
    </div>
  );
}

// OAuth Callback Page
function OAuthCallbackPage() {
  const { isLoading, isAuthenticated, error } = useAuth();

  if (isLoading) {
    return (
      <div className="oauth-callback">
        <h2>Completing authentication...</h2>
        <div>Please wait while we log you in.</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="oauth-callback">
        <h2>Authentication Failed</h2>
        <p>Error: {error}</p>
        <a href="/login">Try Again</a>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="oauth-callback">
      <h2>Authentication Error</h2>
      <p>Something went wrong. Please try again.</p>
      <a href="/login">Back to Login</a>
    </div>
  );
}

// Protected Pages
function Dashboard() {
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p>This is a protected page that requires authentication.</p>
    </div>
  );
}

function Profile() {
  return (
    <div className="profile">
      <h1>Profile</h1>
      <p>User profile information goes here.</p>
    </div>
  );
}

function Settings() {
  return (
    <div className="settings">
      <h1>Settings</h1>
      <p>Application settings go here.</p>
    </div>
  );
}

function NotFound() {
  return (
    <div className="not-found">
      <h1>404 - Page Not Found</h1>
      <a href="/">Go Home</a>
    </div>
  );
}

export default App;
