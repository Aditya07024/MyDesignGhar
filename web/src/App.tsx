import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { setSessionToken, AuthService } from "./services/api";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ConsultantDashboard from "./pages/ConsultantDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Call from "./pages/Call";

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key in environment variables.");
}

// Clerk Auth Token Synchronization Wrapper
function ClerkAuthWrapper({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const syncToken = async () => {
      if (isSignedIn) {
        try {
          const token = await getToken();
          setSessionToken(token);
        } catch (err) {
          console.error("Failed to sync Clerk token:", err);
        }
      } else {
        setSessionToken(null);
      }
      setReady(true);
    };

    if (isLoaded) {
      syncToken();
    }
  }, [isLoaded, isSignedIn, getToken]);

  if (!isLoaded || !ready) {
    return (
      <div className="auth-sync-loading">
        <div className="spinner"></div>
        <p>Synchronizing authentication...</p>
        <style>{`
          .auth-sync-loading {
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-color: #0b0c10;
            color: var(--text-muted);
            font-family: var(--font-sans);
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255, 255, 255, 0.1);
            border-top: 4px solid var(--primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
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

  // Helper navigate inside fallback UI
  const navigate = (path: string) => {
    window.location.href = path;
  };

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
    return (
      <div className="auth-sync-loading">
        <div className="spinner"></div>
        <p>Verifying administrative privileges...</p>
      </div>
    );
  }

  if (!isSignedIn || !isAdmin) {
    return (
      <div className="access-denied-page">
        <div className="access-denied-card glass-card">
          <h2>Access Denied</h2>
          <p>You do not have administrative privileges to access this console.</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button className="btn btn-secondary" onClick={() => navigate("/")}>Home</button>
            <button className="btn btn-primary" onClick={() => navigate("/admin/login")}>Admin Login</button>
          </div>
        </div>
        <style>{`
          .access-denied-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #0b0c10;
            padding: 20px;
            font-family: var(--font-sans);
          }
          .access-denied-card {
            max-width: 480px;
            width: 100%;
            padding: 40px;
            text-align: center;
          }
          .access-denied-card h2 {
            color: var(--error);
            font-size: 24px;
            margin-bottom: 16px;
          }
          .access-denied-card p {
            color: var(--text-muted);
            margin-bottom: 24px;
            line-height: 1.6;
          }
        `}</style>
      </div>
    );
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
            <Route path="/consultant/signup" element={<SignUp />} />
            <Route path="/admin/login" element={<Login isAdminOnly={true} />} />

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
