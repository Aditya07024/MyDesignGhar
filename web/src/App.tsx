import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ClerkProvider, useAuth, useClerk } from "@clerk/clerk-react";
import { setSessionToken, AuthService } from "./services/api";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ConsultantDashboard from "./pages/ConsultantDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Call from "./pages/Call";
import logo from "./assets/logo.png";

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key in environment variables.");
}

// Redesigned Futuristic Architectural Auth Loading Screen
function AuthLoadingScreen({ message }: { message: string }) {
  const [percent, setPercent] = useState(15);
  const [statusStep, setStatusStep] = useState(0);

  const statusMessages = [
    "Initializing Security Tokens...",
    "Establishing Encrypted Session...",
    "Verifying Architecture Workspace...",
    "Readying Spatial AI Engine..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 96) return 96;
        return prev + Math.floor(Math.random() * 12) + 5;
      });
    }, 280);

    const stepInterval = setInterval(() => {
      setStatusStep((prev) => (prev + 1) % statusMessages.length);
    }, 850);

    return () => {
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <div className="auth-sync-screen">
      {/* Background Animated Ambient Lights */}
      <div className="auth-ambient-glow glow-1" />
      <div className="auth-ambient-glow glow-2" />
      <div className="auth-ambient-glow glow-3" />

      {/* Main Glassmorphic HUD Stage */}
      <div className="auth-sync-glass-card">
        {/* Top Brand Logo */}
        <div className="auth-brand-badge">

          <span className="auth-brand-text">MY<span className="auth-brand-highlight">DESIGNGHAR</span></span>
        </div>

        {/* Counter-Rotating 3D Architectural Scanner Centerpiece */}
        <div className="auth-scanner-stage">
          <div className="loader-ring-outer" />
          <div className="loader-ring-middle" />
          <div className="loader-ring-inner" />
          
          <div className="auth-3d-cube-icon">
            <img src={logo} alt="MyDesignGhar Logo" className="auth-circle-logo-img" />
          </div>
        </div>

        {/* Dynamic Title & Subtitle */}
        <h3 className="auth-sync-title">{message}</h3>
        <p className="auth-sync-subtitle">{statusMessages[statusStep]}</p>

        {/* Laser Progress Bar & Glow Counter */}
        <div className="auth-progress-wrapper">
          <div className="auth-progress-header">
            <span className="auth-progress-label">AUTHENTICATION SYNC</span>
            <span className="auth-progress-percentage">{percent}%</span>
          </div>
          <div className="auth-progress-bar-container">
            <div className="auth-progress-bar-fill" style={{ width: `${percent}%` }}>
              <div className="auth-progress-laser-beam" />
            </div>
          </div>
        </div>

        {/* Bottom Security Shield Pill */}
        <div className="auth-sync-footer">
          <span className="auth-status-dot" />
          <span>OAuth 2.0 • 256-Bit SSL Shield Active</span>
        </div>
      </div>

      <style>{`
        .auth-sync-screen {
          height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at 50% 40%, #172538 0%, #0f172a 60%, #070c1b 100%);
          font-family: 'Outfit', 'Inter', sans-serif;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 9999;
          overflow: hidden;
        }

        .auth-ambient-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          opacity: 0.35;
        }

        .glow-1 {
          width: 380px;
          height: 380px;
          background: #5c2828;
          top: 15%;
          left: 20%;
          animation: ambientFloat 8s ease-in-out infinite alternate;
        }

        .glow-2 {
          width: 440px;
          height: 440px;
          background: #0d9488;
          bottom: 15%;
          right: 20%;
          animation: ambientFloat 10s ease-in-out infinite alternate-reverse;
        }

        .glow-3 {
          width: 300px;
          height: 300px;
          background: #f59e0b;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: pulseCenter 4s ease-in-out infinite;
        }

        @keyframes ambientFloat {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(30px, -40px) scale(1.15); }
        }

        @keyframes pulseCenter {
          0%, 100% { opacity: 0.15; transform: translate(-50%, -50%) scale(0.8); }
          50% { opacity: 0.35; transform: translate(-50%, -50%) scale(1.2); }
        }

        .auth-sync-glass-card {
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 32px;
          padding: 48px 52px;
          width: 90%;
          max-width: 460px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2);
          animation: authPopIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          position: relative;
          z-index: 10;
        }

        @keyframes authPopIn {
          from { opacity: 0; transform: translateY(24px) scale(0.94); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .auth-brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 30px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 6px 18px;
          border-radius: 999px;
        }

        .auth-brand-symbol {
          font-size: 1rem;
        }

        .auth-brand-text {
          font-size: 1rem;
          font-weight: 900;
          letter-spacing: 2px;
          color: #ffffff;
        }

        .auth-brand-highlight {
          color: #f87171;
          background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* 3D Scanner Stage */
        .auth-scanner-stage {
          position: relative;
          width: 100px;
          height: 100px;
          margin-bottom: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loader-ring-outer {
          position: absolute;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          border: 2px solid transparent;
          border-top-color: #ef4444;
          border-right-color: #f59e0b;
          animation: spinRight 2.2s linear infinite;
        }

        .loader-ring-middle {
          position: absolute;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 2px solid transparent;
          border-bottom-color: #34d399;
          border-left-color: #3b82f6;
          animation: spinLeft 1.6s linear infinite;
        }

        .loader-ring-inner {
          position: absolute;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(92, 40, 40, 0.4) 0%, transparent 70%);
          border: 1px dashed rgba(255, 255, 255, 0.2);
          animation: pulseRingInner 2s ease-in-out infinite;
        }

        @keyframes spinRight {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes spinLeft {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }

        @keyframes pulseRingInner {
          0%, 100% { transform: scale(0.9); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 1; }
        }

        .auth-3d-cube-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #ffffff;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5), 0 0 20px rgba(248, 113, 113, 0.4);
          position: relative;
          z-index: 5;
          animation: floatIcon 3s ease-in-out infinite alternate;
        }

        .auth-circle-logo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 50%;
        }

        @keyframes floatIcon {
          0% { transform: translateY(0); }
          100% { transform: translateY(-4px); }
        }

        .auth-sync-title {
          color: #f8fafc;
          font-size: 1.25rem;
          font-weight: 800;
          margin: 0 0 6px 0;
          letter-spacing: -0.3px;
        }

        .auth-sync-subtitle {
          color: #94a3b8;
          font-size: 0.85rem;
          margin: 0 0 28px 0;
          line-height: 1.45;
          min-height: 24px;
          transition: all 0.3s ease;
        }

        /* Progress Bar HUD */
        .auth-progress-wrapper {
          width: 100%;
          margin-bottom: 24px;
        }

        .auth-progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .auth-progress-label {
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 1px;
          color: #64748b;
        }

        .auth-progress-percentage {
          font-size: 0.82rem;
          font-weight: 900;
          color: #34d399;
          letter-spacing: 0.5px;
        }

        .auth-progress-bar-container {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.07);
          border-radius: 999px;
          overflow: hidden;
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .auth-progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #5c2828 0%, #ef4444 50%, #34d399 100%);
          border-radius: 999px;
          box-shadow: 0 0 14px rgba(52, 211, 153, 0.6);
          transition: width 0.3s ease-out;
          position: relative;
          overflow: hidden;
        }

        .auth-progress-laser-beam {
          position: absolute;
          top: 0;
          right: 0;
          width: 20px;
          height: 100%;
          background: #ffffff;
          box-shadow: 0 0 10px #ffffff;
          opacity: 0.8;
          animation: laserPulse 1.2s infinite;
        }

        @keyframes laserPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        .auth-sync-footer {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .auth-status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 10px #34d399;
          animation: dotGlow 1.8s infinite;
        }

        @keyframes dotGlow {
          0%, 100% { opacity: 0.5; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

// Clerk Auth Token Synchronization Wrapper
function ClerkAuthWrapper({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const syncToken = async () => {
      if (isSignedIn) {
        try {
          const token = await getToken();
          setSessionToken(token);
        } catch (err) {
          console.error("Failed to sync Clerk token:", err);
          try {
            await signOut();
          } catch (_) { /* ignore sign-out errors */ }
          setSessionToken(null);
          localStorage.removeItem("mdg_user_role");
        }
      } else {
        setSessionToken(null);
        localStorage.removeItem("mdg_user_role");
      }
      setReady(true);
    };

    if (isLoaded) {
      syncToken();
    }
  }, [isLoaded, isSignedIn, getToken, signOut]);

  if (!isLoaded || !ready) {
    return <AuthLoadingScreen message="Synchronizing authentication..." />;
  }

  return <>{children}</>;
}

// Protected Route for Consultants
function ConsultantProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;
  if (!isSignedIn) {
    return <Navigate to="/consultant/login" replace />;
  }

  return <>{children}</>;
}

// Protected Route for Admin Users
function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const verifyAdmin = async () => {
      if (isSignedIn) {
        try {
          const res = await AuthService.getMe();
          const role = res.user?.role;
          setIsAdmin(role === "ADMIN");
        } catch (err) {
          console.error("Admin verification failed:", err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };
    verifyAdmin();
  }, [isSignedIn]);

  if (!isLoaded || isAdmin === null) {
    return <AuthLoadingScreen message="Verifying administrative privileges..." />;
  }

  if (!isSignedIn || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <ClerkAuthWrapper>
        <BrowserRouter>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Auth Routes */}
            <Route path="/consultant/login" element={<Login isAdminOnly={false} />} />
            <Route path="/consultant/signup" element={<SignUp isAdminOnly={false} />} />
            <Route path="/admin/login" element={<Login isAdminOnly={true} />} />
            <Route path="/admin/signup" element={<SignUp isAdminOnly={true} />} />

            {/* Protected Consultant Portal */}
            <Route
              path="/consultant/dashboard"
              element={
                <ConsultantProtectedRoute>
                  <ConsultantDashboard />
                </ConsultantProtectedRoute>
              }
            />

            {/* Protected Video Consultation Call Page */}
            <Route
              path="/call"
              element={
                <ConsultantProtectedRoute>
                  <Call />
                </ConsultantProtectedRoute>
              }
            />

            {/* Protected Admin Portal */}
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              }
            />

            {/* Catch-all Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ClerkAuthWrapper>
    </ClerkProvider>
  );
}
