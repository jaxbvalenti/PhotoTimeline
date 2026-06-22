import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layout Wrapper
import AppLayout from "./layouts/AppLayout";

// Screens / Pages
import Home from "./pages/Home";
import Timeline from "./pages/Timeline";
import MapPage from "./pages/Map"; // Double check if your file is named Map.jsx or MapPage.jsx
import Profile from "./pages/Profile";
import Login, { getStoredUser } from "./pages/Login";

function RequireAuth({ children }) {
  return getStoredUser() ? children : <Navigate to="/" replace />;
}

export default function App() {
  // Maintaining a fallback check to make sure email state exists across reloads
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    // If you store user data in localStorage on login, let's grab it
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed && parsed.email) {
          setUserEmail(parsed.email);
        }
      } catch (e) {
        console.error("Error reading session store:", e);
      }
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTE */}
        <Route path="/" element={<Login onLoginSuccess={(email) => setUserEmail(email)} />} />
        <Route path="/login" element={<Navigate to="/" replace />} />

        {/* 📱 PROTECTED PHONE FRAME APPLAYOUT WRAPPER */}
        <Route
          element={
            <RequireAuth>
              <AppLayout userEmail={userEmail} />
            </RequireAuth>
          }
        >
          <Route path="home" element={<Home userEmail={userEmail} />} />
          
          {/* This route handles path "/timeline" */}
          <Route path="timeline" element={<Timeline userEmail={userEmail} />} />
          
          {/* This route handles path "/map" */}
          <Route path="map" element={<MapPage userEmail={userEmail} />} />
          
          {/* This route handles path "/profile" */}
          <Route path="profile" element={<Profile userEmail={userEmail} />} />
        </Route>

        {/* CATCH-ALL FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
