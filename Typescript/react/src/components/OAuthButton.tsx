import React, { ReactNode } from "react";
import { useOAuth } from "../hooks/useOAuth";

export interface OAuthButtonProps {
  /**
   * OAuth provider name (e.g., 'google', 'github', 'discord')
   */
  provider: string;
  /**
   * OAuth scopes to request
   * @default ['profile', 'email']
   */
  scopes?: string[];
  /**
   * Button content - can be text or custom JSX
   */
  children?: ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Custom button styles
   */
  style?: React.CSSProperties;
  /**
   * Whether the button is disabled
   */
  disabled?: boolean;
  /**
   * Callback called before initiating OAuth flow
   */
  onBeforeLogin?: () => void;
}

/**
 * Pre-built OAuth login button component
 */
export function OAuthButton({
  provider,
  scopes = ["profile", "email"],
  children,
  className = "",
  style,
  disabled,
  onBeforeLogin,
}: OAuthButtonProps) {
  const { login, isLoading } = useOAuth();

  const handleClick = async () => {
    if (disabled || isLoading) return;

    onBeforeLogin?.();
    await login(provider, scopes);
  };

  const defaultClassName = `oauth-button oauth-button-${provider}`;
  const finalClassName = `${defaultClassName} ${className}`.trim();

  return (
    <button
      type="button"
      className={finalClassName}
      style={style}
      onClick={handleClick}
      disabled={disabled || isLoading}
    >
      {children ||
        `Continue with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`}
    </button>
  );
}
