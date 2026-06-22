import { apiUrl } from "../config/api";
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      console.log("Google raw token received. Transmitting to Express...");

      // 1. Send the RAW secure token to your backend instead of the unpacked text
      const response = await fetch(apiUrl("/api/auth/google-sync"), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          token: credentialResponse.credential // 👈 Send the encrypted token string here!
        })
      });

      const data = await response.json();

      if (response.ok) {
        // 2. Save your custom Express JWT token and user profile details
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user)); 
        
        // Clear caches and bounce to profile page cleanly
        window.location.replace("/profile"); 
      } else {
        console.error("Database alignment failed:", data.error);
        alert("Authentication failed during backend synchronization.");
      }
    } catch (error) {
      console.error("Failed communication with API server:", error);
      alert("Could not connect to the authentication server.");
    }
  };

  const handleGoogleLoginError = () => {
    console.error('Google Sign-In Stream Faulted');
    alert("Google authentication was canceled or encountered an unexpected error.");
  };

  return (
    <div className="phone-screen screen-dark" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px', padding: '20px', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h1 style={{ color: '#fff', fontSize: '2rem', marginBottom: '8px' }}>Photo Timeline</h1>
        <p style={{ color: '#8e8e93' }}>Preserve your favorite snapshots seamlessly.</p>
      </div>

      <GoogleLogin
        onSuccess={handleGoogleLoginSuccess}
        onError={handleGoogleLoginError}
        theme="filled_blue"
        shape="pill"
      />
    </div>
  );
}

export function getStoredUser() {
  try {
    const session = localStorage.getItem("user");
    if (!session) return null;
    
    const parsed = JSON.parse(session);
    return parsed && parsed.email ? parsed : null;
  } catch (e) {
    console.error("Failed to recover user storage strings", e);
    return null;
  }
}
