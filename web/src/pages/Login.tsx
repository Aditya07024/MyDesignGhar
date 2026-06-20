import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSignIn, useAuth } from "@clerk/clerk-react";
import { Eye, EyeOff, Chrome, Apple } from "lucide-react";
import { AuthService, setSessionToken } from "../services/api";
import logo from "../assets/logo.png";

interface LoginProps {
  isAdminOnly?: boolean;
}

export default function Login({ isAdminOnly = false }: LoginProps) {
  const navigate = useNavigate();
  const { isLoaded, signIn, setActive } = useSignIn();
  const { getToken, isSignedIn } = useAuth();
  
  const [roleType] = useState<"CONSULTANT" | "ADMIN">(
    isAdminOnly ? "ADMIN" : "CONSULTANT"
  );
  const [identifier, setIdentifier] = useState(""); // Email address
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Helper: redirect based on role
  const redirectByRole = (role: string) => {
    if (role === "CONSULTANT") {
      navigate("/consultant/dashboard");
    } else if (role === "ADMIN") {
      navigate("/admin");
    } else {
      navigate("/consultant/signup");
    }
  };

  // Auto-redirect signed-in users (including returning OAuth users)
  useEffect(() => {
    let cancelled = false;

    const handleRedirect = async () => {
      if (!isSignedIn) return;

      try {
        const token = await getToken();
        if (!token) return;
        if (cancelled) return;
        setSessionToken(token);

        // Try backend first to get the authoritative role
        if (isAdminOnly) {
          const syncRes = await AuthService.sync({ role: "ADMIN" });
          if (!cancelled && syncRes.user?.role === "ADMIN") {
            localStorage.setItem("mdg_user_role", "ADMIN");
            navigate("/admin");
            return;
          }
        }

        const res = await AuthService.getMe();
        if (cancelled) return;

        const role = res.user?.role;
        if (role) {
          localStorage.setItem("mdg_user_role", role);
        }
        redirectByRole(role);
      } catch (err: any) {
        if (cancelled) return;
        console.error("Auto-redirect error:", err);

        // Backend is down — use cached role for instant redirect
        const cachedRole = localStorage.getItem("mdg_user_role");
        if (cachedRole) {
          console.info("Backend unreachable, using cached role for redirect:", cachedRole);
          redirectByRole(cachedRole);
        }
        // No cached role and backend is down — stay on login page silently
      }
    };

    handleRedirect();

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, navigate, getToken, isAdminOnly]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    
    if (!identifier) {
      setError("Please enter your login identifier.");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const formattedId = identifier.trim();

      const result = await signIn.create({
        identifier: formattedId,
        password: password,
      });

      if (result.status === "complete") {
        if (setActive) {
          await setActive({ session: result.createdSessionId });
          
          // Retrieve the session token to authenticate subsequent backend calls
          const token = await getToken();
          if (token) {
            setSessionToken(token);
          }
          
          // Sync with the backend and check role
          const syncRes = await AuthService.sync({ role: roleType });
          const userRole = syncRes.user?.role;
          
          if (roleType === "CONSULTANT" && userRole === "CONSULTANT") {
            navigate("/consultant/dashboard");
          } else if (roleType === "ADMIN" && userRole === "ADMIN") {
            navigate("/admin");
          } else {
            setError(`Unauthorized: Your account does not have the ${roleType} role.`);
          }
        }
      } else {
        setError("Please complete the verification steps to log in.");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;
    try {
      setLoading(true);
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: window.location.origin + "/consultant/login",
        redirectUrlComplete: window.location.origin + "/consultant/login",
      });
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Failed to initiate Google sign in.");
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    if (!isLoaded) return;
    try {
      setLoading(true);
      await signIn.authenticateWithRedirect({
        strategy: "oauth_apple",
        redirectUrl: window.location.origin + "/consultant/login",
        redirectUrlComplete: window.location.origin + "/consultant/login",
      });
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Failed to initiate Apple sign in.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="auth-glow" />
      <div className="auth-card glass-card">
        <div className="auth-header">
          <div className="auth-logo">
            <img src={logo} alt="MydesignGhar Logo" style={{ width: "100%", height: "100%", objectFit: "contain", padding: "6px" }} />
          </div>
          <h2>{roleType === "CONSULTANT" ? "Consultant Portal" : "Admin Panel"}</h2>
          <p>
            {roleType === "CONSULTANT" 
              ? "Access your appointments, earnings, and video calls." 
              : "Administrative console for MydesignGhar."}
          </p>
        </div>



        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrapper">
              <input
                type="email"
                className="form-input"
                placeholder={roleType === "CONSULTANT" ? "e.g., consultant@mydesignghr.com" : "e.g., admin@mydesignghr.com"}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="oauth-divider">
          <span>or continue with</span>
        </div>

        <div className="oauth-buttons">
          <button
            type="button"
            className="btn btn-secondary oauth-btn"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <Chrome size={18} /> Google
          </button>
          <button
            type="button"
            className="btn btn-secondary oauth-btn"
            onClick={handleAppleSignIn}
            disabled={loading}
          >
            <Apple size={18} /> Apple
          </button>
        </div>

        <div className="auth-footer">
          {roleType === "CONSULTANT" ? (
            <p>
              New consultant? <Link to="/consultant/signup">Register here</Link>
            </p>
          ) : (
            <p>
              <Link to="/">Back to Home Page</Link>
            </p>
          )}
        </div>
      </div>

      <style>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          background-image: var(--bg-gradient);
        }

        .auth-glow {
          position: absolute;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(205, 162, 80, 0.1) 0%, rgba(0, 0, 0, 0) 70%);
          pointer-events: none;
        }

        .auth-card {
          width: 100%;
          max-width: 460px;
          padding: 40px;
          text-align: center;
        }

        .auth-header {
          margin-bottom: 24px;
        }

        .auth-logo {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: rgba(205, 162, 80, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px auto;
        }

        .auth-header h2 {
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .auth-header p {
          color: var(--text-muted);
          font-size: 14px;
        }

        .role-selector {
          display: flex;
          background: rgba(0, 0, 0, 0.03);
          padding: 4px;
          border-radius: 10px;
          margin-bottom: 24px;
          border: 1px solid var(--border);
        }

        .role-btn {
          flex: 1;
          padding: 10px;
          border: none;
          background: none;
          color: var(--text-muted);
          font-family: var(--font-sans);
          font-weight: 600;
          font-size: 14px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .role-btn.active {
          background: var(--card-solid);
          color: var(--text);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .auth-form {
          text-align: left;
        }

        .password-wrapper {
          position: relative;
        }

        .password-wrapper input {
          padding-right: 50px;
        }

        .toggle-password {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }
        .toggle-password:hover {
          color: var(--text);
        }

        .auth-error {
          background: var(--error-bg);
          color: var(--error);
          border: 1px solid rgba(244, 63, 94, 0.1);
          padding: 12px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 20px;
        }

        .auth-submit {
          width: 100%;
          margin-top: 10px;
        }

        .oauth-divider {
          display: flex;
          align-items: center;
          margin: 20px 0;
          color: var(--text-muted);
          font-size: 13px;
        }
        .oauth-divider::before, .oauth-divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: var(--border);
        }
        .oauth-divider span {
          padding: 0 12px;
          font-weight: 500;
        }

        .oauth-buttons {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .oauth-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px;
          font-size: 14px;
          border-radius: 10px;
        }

        .auth-footer {
          margin-top: 24px;
          font-size: 14px;
          color: var(--text-muted);
        }

        .auth-footer a {
          color: var(--primary);
          font-weight: 700;
        }
        .auth-footer a:hover {
          color: var(--primary-hover);
        }
      `}</style>
    </div>
  );
}
