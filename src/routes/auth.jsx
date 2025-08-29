import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const meta = () => [
  { title: "Resumind | Auth" },
  { name: "description", content: "Log into your account" },
];

// Authentication helpers
const signIn = async () => {
  await puter.auth.signIn();
  localStorage.setItem("isAuthenticated", "true");
};

const signOut = () => {
  puter.auth.signOut?.(); // optional if using puter auth
  localStorage.removeItem("isAuthenticated");
};

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const next = location.search.split("next=")[1] || "/";

  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("isAuthenticated") === "true"
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate(next, { replace: true });
  }, [isAuthenticated, next, navigate]);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn();
      setIsAuthenticated(true);
      navigate(next, { replace: true });
    } catch (err) {
      console.error("Sign in failed:", err);
      alert("Failed to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut();
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
            {isLoading ? (
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
        </section>
      </div>
    </main>
  );
};

export default Auth;
