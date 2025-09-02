import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../context/userContext";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const next = location.search.split("next=")[1] || "/";

  const { user, signIn, signOut, checkAuthStatus, loading, error } = useUser();

  // ✅ Effect for checking auth status on mount
  useEffect(() => {
    const initAuth = async () => {
      const status = await checkAuthStatus();
      setIsAuthenticated(status)
    };
    initAuth();
  }, [navigate]);

  const handleSignIn = async () => {
    try {
      const success = await signIn();
      if (success) {
        navigate(next, { replace: true });
      } else {
        alert("Failed to sign in. Please try again.");
      }
    } catch (err) {
      console.error("Sign in failed:", err);
      alert("An unexpected error occurred.");
    }
  };
  const handleSignOut = async () => {
    await signOut();
    setIsAuthenticated(false);
  };

  return (
    <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center">
      <div className="gradient-border shadow-lg">
        <section className="flex flex-col gap-8 bg-white rounded-2xl p-10">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1>Welcome</h1>
            <h2>Log In to Continue Your Job Journey</h2>
          </div>
          <div>
            {loading ? (
              <button className="auth-button animate-pulse">
                <p>Signing you in...</p>
              </button>
            ) : isAuthenticated ? (
              <button className="auth-button" onClick={handleSignOut}>
                <p>Log Out</p>
              </button>
            ) : (
              <button className="auth-button" onClick={handleSignIn}>
                <p>Log In</p>
              </button>
            )}
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </section>
      </div>
    </main>
  );
};

export default Auth;
