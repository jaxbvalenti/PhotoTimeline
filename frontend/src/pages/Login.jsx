import { apiUrl } from "../config/api";
import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { Camera, Images } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const AUTH_STORAGE_KEY = "user";

export function getStoredUser() {
  const rawUser = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!rawUser) return null;
  try {
    return JSON.parse(rawUser);
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/profile";

  const handleSuccess = async (credentialResponse) => {
    if (!credentialResponse.credential) return;

    try {
      const profile = jwtDecode(credentialResponse.credential);
      
      const response = await fetch(apiUrl("/api/auth/google-sync"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: profile.email,
          name: profile.name,
          picture: profile.picture 
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user)); 
        onLoginSuccess?.(data.user.email);
        navigate(redirectTo, { replace: true }); 
      } else {
        alert("Authentication failed during system mapping.");
      }
    } catch (error) {
      console.error("Communication with identity system broken:", error);
    }
  };

  return (
    <main className="phone-screen login-screen">
      <section className="login-hero">
        <div className="login-mark"><Camera size={30} /></div>
        <p className="status-time">9:41</p>
        <h1>Photo Timeline</h1>
        <p>Sign in to collect your favorite photos, places, and memories in one private timeline.</p>
      </section>

      <section className="login-panel">
        <div className="login-panel-heading">
          <Images size={20} />
          <div>
            <h2>Welcome back</h2>
            <p>Continue with your Google account.</p>
          </div>
        </div>
        <div className="google-login-wrap">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => console.error("Google login failed")}
            shape="rectangular"
            size="large"
            theme="outline"
            width="300"
          />
        </div>
      </section>
    </main>
  );
}
