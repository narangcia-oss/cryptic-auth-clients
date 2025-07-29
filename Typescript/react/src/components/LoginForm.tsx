import React, { useState, FormEvent } from "react";
import { useCredentialAuth } from "../hooks/useCredentialAuth";

export interface LoginFormProps {
  /**
   * Callback called on successful login
   */
  onSuccess?: () => void;
  /**
   * Callback called on login error
   */
  onError?: (error: string) => void;
  /**
   * Custom CSS classes for the form
   */
  className?: string;
  /**
   * Custom styles for the form
   */
  style?: React.CSSProperties;
  /**
   * Whether to show the signup link
   * @default true
   */
  showSignupLink?: boolean;
  /**
   * Custom submit button text
   * @default 'Login'
   */
  submitText?: string;
}

/**
 * Pre-built login form component
 */
export function LoginForm({
  onSuccess,
  onError,
  className = "",
  style,
  showSignupLink = true,
  submitText = "Login",
}: LoginFormProps) {
  const { login, isLoading, error } = useCredentialAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      await login(formData);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      onError?.(errorMessage);
    }
  };

  const handleChange =
    (field: "username" | "password") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  return (
    <form
      onSubmit={handleSubmit}
      className={`login-form ${className}`.trim()}
      style={style}
    >
      <div className="form-field">
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={formData.username}
          onChange={handleChange("username")}
          required
          disabled={isLoading}
        />
      </div>

      <div className="form-field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={formData.password}
          onChange={handleChange("password")}
          required
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !formData.username || !formData.password}
        className="submit-button"
      >
        {isLoading ? "Logging in..." : submitText}
      </button>

      {showSignupLink && (
        <p className="signup-link">
          Don't have an account? <a href="/signup">Sign up</a>
        </p>
      )}
    </form>
  );
}
