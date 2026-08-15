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

// Redesigned Luxury Warm Brown Glassmorphism Auth Loading Screen
function AuthLoadingScreen({ message }: { message: string }) {
  const [percent, setPercent] = useState(18);
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
        if (prev >= 98) return 98;
        return prev + Math.floor(Math.random() * 10) + 4;
      });
    }, 240);

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
      {/* Dark Luxury Ambient Glow Backdrop */}
      <div className="auth-ambient-glow glow-copper-1" />
      <div className="auth-ambient-glow glow-copper-2" />
      <div className="auth-ambient-glow glow-gold-center" />

      {/* Main Glassmorphic HUD Stage */}
      <div className="auth-sync-glass-card">
        {/* Top Brand Badge */}
        <div className="auth-brand-badge">
          <span className="auth-brand-text">MY<span className="auth-brand-highlight">DESIGNGHAR</span></span>
        </div>

        {/* 3D Architectural Scanner Centerpiece */}
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
        
        <div className="auth-step-pill">
          <span className="auth-step-dot" />
          <span>{statusMessages[statusStep]}</span>
        </div>

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
          background: radial-gradient(circle at 50% 35%, #2e1d1d 0%, #1a1010 60%, #0d0707 100%);
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
          filter: blur(90px);
          pointer-events: none;
          opacity: 0.45;
        }

        .glow-copper-1 {
          width: 440px;
          height: 440px;
          background: #5c2828;
          top: 10%;
          left: 15%;
          animation: ambientFloat 8s ease-in-out infinite alternate;
        }

        .glow-copper-2 {
          width: 480px;
          height: 480px;
          background: #753333;
          bottom: 10%;
          right: 15%;
          animation: ambientFloat 10s ease-in-out infinite alternate-reverse;
        }

        .glow-gold-center {
          width: 320px;
          height: 320px;
          background: #f59e0b;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: pulseCenter 4s ease-in-out infinite;
        }

        @keyframes ambientFloat {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(35px, -45px) scale(1.15); }
        }

        @keyframes pulseCenter {
          0%, 100% { opacity: 0.15; transform: translate(-50%, -50%) scale(0.85); }
          50% { opacity: 0.35; transform: translate(-50%, -50%) scale(1.25); }
        }

        .auth-sync-glass-card {
          background: rgba(46, 35, 28, 0.78);
          backdrop-filter: blur(32px);
          -webkit-backdrop-filter: blur(32px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 32px;
          padding: 44px 48px;
          width: 90%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          box-shadow: 0 32px 90px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.25);
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
          margin-bottom: 26px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.18);
          padding: 6px 18px;
          border-radius: 999px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }

        .auth-brand-text {
          font-size: 0.95rem;
          font-weight: 900;
          letter-spacing: 2px;
          color: #ffffff;
        }

        .auth-brand-highlight {
          color: #f59e0b;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* 3D Scanner Stage */
        .auth-scanner-stage {
          position: relative;
          width: 105px;
          height: 105px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loader-ring-outer {
          position: absolute;
          width: 105px;
          height: 105px;
          border-radius: 50%;
          border: 2px dashed rgba(245, 158, 11, 0.5);
          border-top-color: #f59e0b;
          border-right-color: #5c2828;
          animation: spinRight 3s linear infinite;
        }

        .loader-ring-middle {
          position: absolute;
          width: 86px;
          height: 86px;
          border-radius: 50%;
          border: 2px solid transparent;
          border-bottom-color: rgba(255, 255, 255, 0.85);
          border-left-color: rgba(245, 158, 11, 0.8);
          animation: spinLeft 2s linear infinite;
        }

        .loader-ring-inner {
          position: absolute;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(92, 40, 40, 0.5) 0%, transparent 70%);
          border: 1px dashed rgba(255, 255, 255, 0.25);
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
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: #ffffff;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5), 0 0 24px rgba(245, 158, 11, 0.4);
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
          color: #ffffff;
          font-size: 1.2rem;
          font-weight: 800;
          margin: 0 0 12px 0;
          letter-spacing: -0.3px;
        }

        .auth-step-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.16);
          padding: 5px 14px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 24px;
          transition: all 0.3s ease;
        }

        .auth-step-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #f59e0b;
          box-shadow: 0 0 8px #f59e0b;
          animation: pulseDot 1.5s infinite;
        }

        /* Progress Bar HUD */
        .auth-progress-wrapper {
          width: 100%;
          margin-bottom: 20px;
        }

        .auth-progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .auth-progress-label {
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 1px;
          color: rgba(255, 255, 255, 0.7);
        }

        .auth-progress-percentage {
          font-size: 0.86rem;
          font-weight: 900;
          color: #f59e0b;
          letter-spacing: 0.5px;
        }

        .auth-progress-bar-container {
          width: 100%;
          height: 10px;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 999px;
          overflow: hidden;
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .auth-progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #5c2828 0%, #753333 40%, #f59e0b 80%, #fbbf24 100%);
          border-radius: 999px;
          box-shadow: 0 0 16px rgba(245, 158, 11, 0.5);
          transition: width 0.3s ease-out;
          position: relative;
          overflow: hidden;
        }

        .auth-progress-laser-beam {
          position: absolute;
          top: 0;
          right: 0;
          width: 24px;
          height: 100%;
          background: #ffffff;
          box-shadow: 0 0 12px #ffffff;
          opacity: 0.9;
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
          color: rgba(255, 255, 255, 0.75);
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
