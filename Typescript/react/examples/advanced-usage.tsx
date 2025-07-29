// Example: Advanced customization and error handling

import React, { useState, useEffect } from "react";
import {
  AuthProvider,
  useAuth,
  useUser,
  OAuthButton,
  LoginForm,
  getTokenExpiration,
  isTokenExpiring,
  cleanOAuthURL,
} from "@narangcia-oss/cryptic-auth-client-react";

// Custom error boundary for auth errors
class AuthErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Auth Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Authentication Error</h2>
          <p>Something went wrong with authentication.</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Custom notification system
function useNotifications() {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = "info") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return { notifications, addNotification, removeNotification };
}

// Main App with advanced features
function App() {
  const { notifications, addNotification } = useNotifications();

  return (
    <AuthErrorBoundary>
      <AuthProvider
        config={{
          baseURL:
            process.env.REACT_APP_AUTH_SERVER_URL ||
            "https://auth.example.com/api",
          tokenStorage: "localStorage",
          enableAutoRefresh: true,
        }}
        autoHandleOAuthCallback={true}
        onAuthSuccess={(user, tokens) => {
          addNotification(`Welcome back, ${user.identifier}!`, "success");

          // Track authentication event
          if (window.analytics) {
            window.analytics.track("User Authenticated", {
              userId: user.id,
              provider: user.oauth_info?.provider || "credentials",
            });
          }
        }}
        onError={(error) => {
          addNotification(`Authentication failed: ${error.message}`, "error");

          // Track error event
          if (window.analytics) {
            window.analytics.track("Authentication Error", {
              error: error.message,
            });
          }
        }}
      >
        <div className="app">
          <NotificationContainer notifications={notifications} />
          <AppContent />
        </div>
      </AuthProvider>
    </AuthErrorBoundary>
  );
}

// Notification system component
function NotificationContainer({ notifications }) {
  if (notifications.length === 0) return null;

  return (
    <div className="notifications">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type}`}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
}

// Enhanced auth status component
function AuthStatus() {
  const { user, tokens, isAuthenticated, isLoading } = useAuth();
  const [tokenInfo, setTokenInfo] = useState(null);

  useEffect(() => {
    if (tokens?.access_token) {
      const expiration = getTokenExpiration(tokens.access_token);
      const isExpiring = isTokenExpiring(tokens.access_token, 10); // 10 minutes

      setTokenInfo({
        expiration,
        isExpiring,
        timeLeft: expiration
          ? Math.max(0, expiration.getTime() - Date.now())
          : 0,
      });
    }
  }, [tokens]);

  if (isLoading) return <div>Loading auth status...</div>;

  if (!isAuthenticated) return <div>Not authenticated</div>;

  return (
    <div className="auth-status">
      <h3>Authentication Status</h3>
      <div className="status-details">
        <p>
          <strong>User ID:</strong> {user?.id}
        </p>
        <p>
          <strong>Username:</strong> {user?.identifier}
        </p>
        {user?.oauth_info && (
          <div>
            <p>
              <strong>OAuth Provider:</strong> {user.oauth_info.provider}
            </p>
            <p>
              <strong>OAuth Email:</strong> {user.oauth_info.email}
            </p>
          </div>
        )}
        {tokenInfo && (
          <div>
            <p>
              <strong>Token Expires:</strong>{" "}
              {tokenInfo.expiration?.toLocaleString()}
            </p>
            <p className={tokenInfo.isExpiring ? "warning" : ""}>
              <strong>Status:</strong>{" "}
              {tokenInfo.isExpiring ? "Expiring Soon" : "Valid"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Custom OAuth button with loading states and error handling
function CustomOAuthButton({ provider, children, onBeforeLogin, onError }) {
  const [isLoading, setIsLoading] = useState(false);
  const { oauthLogin, error } = useAuth();

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      onBeforeLogin?.();
      await oauthLogin(provider, ["profile", "email"]);
    } catch (err) {
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      className={`custom-oauth-btn oauth-${provider} ${
        isLoading ? "loading" : ""
      }`}
    >
      {isLoading ? (
        <div className="loading-spinner" />
      ) : (
        children || `Sign in with ${provider}`
      )}
    </button>
  );
}

// Enhanced login page with better UX
function EnhancedLoginPage() {
  const [loginMethod, setLoginMethod] = useState("oauth"); // 'oauth' or 'credentials'
  const { addNotification } = useNotifications();

  // Clean OAuth parameters when component mounts
  useEffect(() => {
    cleanOAuthURL();
  }, []);

  return (
    <div className="enhanced-login">
      <div className="login-container">
        <h1>Sign In to MyApp</h1>

        {/* Login method toggle */}
        <div className="login-method-toggle">
          <button
            className={loginMethod === "oauth" ? "active" : ""}
            onClick={() => setLoginMethod("oauth")}
          >
            Quick Sign In
          </button>
          <button
            className={loginMethod === "credentials" ? "active" : ""}
            onClick={() => setLoginMethod("credentials")}
          >
            Username & Password
          </button>
        </div>

        {loginMethod === "oauth" ? (
          <div className="oauth-section">
            <p>Choose your preferred sign-in method:</p>
            <div className="oauth-buttons">
              <CustomOAuthButton
                provider="google"
                onBeforeLogin={() =>
                  addNotification("Redirecting to Google...", "info")
                }
                onError={(error) =>
                  addNotification(
                    `Google login failed: ${error.message}`,
                    "error"
                  )
                }
              >
                <GoogleIcon />
                Continue with Google
              </CustomOAuthButton>

              <CustomOAuthButton
                provider="github"
                onBeforeLogin={() =>
                  addNotification("Redirecting to GitHub...", "info")
                }
                onError={(error) =>
                  addNotification(
                    `GitHub login failed: ${error.message}`,
                    "error"
                  )
                }
              >
                <GitHubIcon />
                Continue with GitHub
              </CustomOAuthButton>
            </div>
          </div>
        ) : (
          <div className="credentials-section">
            <LoginForm
              onSuccess={() => {
                addNotification("Login successful!", "success");
              }}
              onError={(error) => {
                addNotification(`Login failed: ${error}`, "error");
              }}
              className="enhanced-login-form"
              submitText="Sign In"
              showSignupLink={true}
            />
          </div>
        )}

        <div className="login-footer">
          <p>
            By signing in, you agree to our{" "}
            <a href="/terms" target="_blank">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" target="_blank">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

// Main app content with auth status
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner large" />
        <p>Loading application...</p>
      </div>
    );
  }

  return (
    <div className="app-content">
      {isAuthenticated ? (
        <div className="authenticated-app">
          <header className="app-header">
            <h1>MyApp Dashboard</h1>
            <UserMenu />
          </header>
          <main>
            <AuthStatus />
            <div className="dashboard-content">
              <h2>Welcome to your dashboard!</h2>
              <p>You are successfully authenticated.</p>
            </div>
          </main>
        </div>
      ) : (
        <EnhancedLoginPage />
      )}
    </div>
  );
}

// User menu component
function UserMenu() {
  const { logout } = useAuth();
  const { displayName } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="user-menu">
      <button className="user-menu-trigger" onClick={() => setIsOpen(!isOpen)}>
        {displayName || "User"} ▼
      </button>

      {isOpen && (
        <div className="user-menu-dropdown">
          <a href="/profile">Profile</a>
          <a href="/settings">Settings</a>
          <hr />
          <button onClick={logout}>Sign Out</button>
        </div>
      )}
    </div>
  );
}

// Icon components (simplified)
function GoogleIcon() {
  return <span>🔴</span>; // Replace with actual SVG
}

function GitHubIcon() {
  return <span>⚫</span>; // Replace with actual SVG
}

export default App;
