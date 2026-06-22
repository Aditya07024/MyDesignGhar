import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSignUp, useAuth } from "@clerk/clerk-react";
import { Phone, Lock, User, Mail, Award, DollarSign, BookOpen, Image as ImageIcon, Chrome, Apple } from "lucide-react";
import { AuthService, ConsultantService, setSessionToken } from "../services/api";
import logo from "../assets/logo.png";

interface SignUpProps {
  isAdminOnly?: boolean;
}

export default function SignUp({ isAdminOnly = false }: SignUpProps) {
  const navigate = useNavigate();
  const { isLoaded, signUp, setActive } = useSignUp();
  const { getToken, isSignedIn } = useAuth();

  // Phase tracker: "ACCOUNT" | "VERIFY" | "PROFILE"
  const [phase, setPhase] = useState<"ACCOUNT" | "VERIFY" | "PROFILE">("ACCOUNT");

  // Auto-redirect or transition signed-in OAuth users
  useEffect(() => {
    let cancelled = false;
    const checkUserStatus = async () => {
      if (isSignedIn) {
        try {
          const token = await getToken();
          if (token) {
            setSessionToken(token);
          }
          if (cancelled) return;

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
          if (role === "CONSULTANT") {
            navigate("/consultant/dashboard");
          } else if (role === "ADMIN") {
            navigate("/admin");
          } else {
            // Signed in but not yet registered as a consultant: complete profile
            setPhase("PROFILE");
          }
        } catch (err) {
          if (cancelled) return;
          console.error("Error checking user status on signup:", err);
          // Sync profile first if it fails due to record not yet existing in Postgres
          try {
            const targetRole = isAdminOnly ? "ADMIN" : "CONSULTANT";
            const syncRes = await AuthService.sync({ role: targetRole });
            if (cancelled) return;
            if (isAdminOnly && syncRes.user?.role === "ADMIN") {
              localStorage.setItem("mdg_user_role", "ADMIN");
              navigate("/admin");
            } else {
              setPhase("PROFILE");
            }
          } catch (syncErr) {
            console.error("First-time OAuth sync failed:", syncErr);
          }
        }
      }
    };
    checkUserStatus();
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, getToken, navigate, isAdminOnly]);

  // Account Form
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Verification Form
  const [verificationCode, setVerificationCode] = useState("");

  // Consultant Profile Form
  const [specialty, setSpecialty] = useState("");
  const [experience, setExperience] = useState("");
  const [price, setPrice] = useState("");
  const [bio, setBio] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle step 1: create clerk sign up
  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    if (!fullName || !phone || !password || !email) {
      setError("Please fill out all required fields.");
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const formattedPhone = `+91${phone}`;
      const nameParts = fullName.trim().split(" ");
      const firstName = nameParts[0] || "Consultant";
      const lastName = nameParts.slice(1).join(" ") || "";

      await signUp.create({
        phoneNumber: formattedPhone,
        emailAddress: email.trim(),
        password: password,
        firstName,
        lastName,
      });

      // Send verification code to email
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPhase("VERIFY");
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle step 2: verify email
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    if (!verificationCode) {
      setError("Please enter the verification code.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === "complete") {
        if (setActive) {
          await setActive({ session: result.createdSessionId });
          
          // Get JWT token and set authorization header
          const token = await getToken();
          if (token) {
            setSessionToken(token);
          }

          if (isAdminOnly) {
            const syncRes = await AuthService.sync({ role: "ADMIN" });
            if (syncRes.user?.role === "ADMIN") {
              localStorage.setItem("mdg_user_role", "ADMIN");
              navigate("/admin");
            } else {
              setError("Failed to create admin profile record on the server.");
            }
          } else {
            // Move to Profile Details Form
            setPhase("PROFILE");
          }
        }
      } else {
        setError("Verification code is incorrect.");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle step 3: fill consultant profile
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!specialty.trim() || !experience || !price || !bio.trim()) {
      setError("Please fill out all consultant profile fields.");
      return;
    }

    if (specialty.trim().length < 2) {
      setError("Specialty description must be at least 2 characters.");
      return;
    }

    const expVal = parseInt(experience);
    if (isNaN(expVal) || !/^\d+$/.test(experience) || expVal < 0) {
      setError("Experience must be a valid non-negative integer number of years.");
      return;
    }

    const priceVal = parseFloat(price);
    if (isNaN(priceVal) || priceVal <= 0) {
      setError("Consultation fee must be a valid positive number.");
      return;
    }

    if (bio.trim().length < 10) {
      setError("Bio/Cover Letter must be at least 10 characters.");
      return;
    }

    let finalUrls: string[] = [];
    if (portfolioUrl.trim()) {
      let url = portfolioUrl.trim();
      if (!/^https?:\/\//i.test(url)) {
        url = `https://${url}`;
      }
      finalUrls = [url];
    }

    setError("");
    setLoading(true);

    try {
      // 1. Sync User and set role as CONSULTANT
      await AuthService.sync({ role: "CONSULTANT" });

      // 2. Submit Consultant Application
      await ConsultantService.register({
        specialty: specialty.trim(),
        experience: expVal,
        bio: bio.trim(),
        price: priceVal,
        portfolioUrls: finalUrls,
      });

      // 3. Redirect to Consultant Dashboard (pending approval)
      navigate("/consultant/dashboard");
    } catch (err: any) {
      const serverMsg = err.response?.data?.message;
      const details = err.response?.data?.errors
        ?.map((e: any) => `${e.field}: ${e.message}`)
        .join(", ");
      setError(details ? `Validation failed: ${details}` : (serverMsg || "Failed to register consultant profile. Please contact support."));
    } finally {
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
          <h2>{isAdminOnly ? "Create Admin Account" : "Become a Consultant"}</h2>
          <p>
            {phase === "ACCOUNT" && (isAdminOnly ? "Create your administrator account to start." : "Create your designer account to start.")}
            {phase === "VERIFY" && "Verify your email address to continue."}
            {phase === "PROFILE" && "Complete your professional profile application."}
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {phase === "ACCOUNT" && (
          <>
          <form onSubmit={handleAccountSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  className="form-input icon-input"
                  placeholder="e.g. Priyan Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <div className="input-wrapper">
                <Phone size={18} className="input-icon" />
                <input
                  type="tel"
                  className="form-input icon-input"
                  placeholder="10-digit number"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  className="form-input icon-input"
                  placeholder="e.g. priya@mydesignghr.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  className="form-input icon-input"
                  placeholder="At least 4 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? "Registering..." : "Send Verification Code"}
            </button>
          </form>

          <div className="oauth-divider">
            <span>or continue with</span>
          </div>

          <div className="oauth-buttons">
            <button
              type="button"
              className="btn btn-secondary oauth-btn"
              onClick={async () => {
                if (!isLoaded) return;
                try {
                  setLoading(true);
                  const redirectPath = isAdminOnly ? "/admin/signup" : "/consultant/signup";
                  await signUp.authenticateWithRedirect({
                    strategy: "oauth_google",
                    redirectUrl: window.location.origin + redirectPath,
                    redirectUrlComplete: window.location.origin + redirectPath,
                  });
                } catch (err: any) {
                  setError(err.errors?.[0]?.message || "Failed to initiate Google sign up.");
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              <Chrome size={18} /> Google
            </button>
            <button
              type="button"
              className="btn btn-secondary oauth-btn"
              onClick={async () => {
                if (!isLoaded) return;
                try {
                  setLoading(true);
                  const redirectPath = isAdminOnly ? "/admin/signup" : "/consultant/signup";
                  await signUp.authenticateWithRedirect({
                    strategy: "oauth_apple",
                    redirectUrl: window.location.origin + redirectPath,
                    redirectUrlComplete: window.location.origin + redirectPath,
                  });
                } catch (err: any) {
                  setError(err.errors?.[0]?.message || "Failed to initiate Apple sign up.");
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              <Apple size={18} /> Apple
            </button>
          </div>
          </>
        )}

        {phase === "VERIFY" && (
          <form onSubmit={handleVerifySubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Verification Code (Email) *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter 6-digit code"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>
          </form>
        )}

        {phase === "PROFILE" && (
          <form onSubmit={handleProfileSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Design Specialty *</label>
              <div className="input-wrapper">
                <Award size={18} className="input-icon" />
                <input
                  type="text"
                  className="form-input icon-input"
                  placeholder="e.g., Luxury & Modern, Minimalist, heritage"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Years of Experience *</label>
              <div className="input-wrapper">
                <Award size={18} className="input-icon" />
                <input
                  type="number"
                  className="form-input icon-input"
                  placeholder="e.g., 5"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Consultation Session Fee (₹) *</label>
              <div className="input-wrapper">
                <DollarSign size={18} className="input-icon" />
                <input
                  type="number"
                  className="form-input icon-input"
                  placeholder="e.g., 999"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Bio / Cover Letter *</label>
              <div className="input-wrapper">
                <BookOpen size={18} className="input-icon-top" />
                <textarea
                  className="form-input icon-textarea"
                  placeholder="Tell clients about your style and philosophy..."
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Portfolio Image URL (Optional)</label>
              <div className="input-wrapper">
                <ImageIcon size={18} className="input-icon" />
                <input
                  type="url"
                  className="form-input icon-input"
                  placeholder="https://example.com/portfolio-item.jpg"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? "Submitting application..." : "Submit Application"}
            </button>
          </form>
        )}

        <div className="auth-footer">
          {phase === "ACCOUNT" && (
            <p>
              Already registered? <Link to={isAdminOnly ? "/admin/login" : "/consultant/login"}>Log in here</Link>
            </p>
          )}
          {phase !== "ACCOUNT" && (
            <p>
              Need help? <Link to="/">Return to Landing Page</Link>
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
          max-width: 500px;
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

        .auth-form {
          text-align: left;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          color: var(--text-muted);
          pointer-events: none;
        }

        .input-icon-top {
          position: absolute;
          left: 16px;
          top: 16px;
          color: var(--text-muted);
          pointer-events: none;
        }

        .icon-input {
          padding-left: 48px;
        }

        .icon-textarea {
          padding-left: 48px;
          resize: vertical;
          min-height: 100px;
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
