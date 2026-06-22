import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Compass, Map, User } from "lucide-react";
import CreateMemory from "../pages/CreateMemory";

export default function BottomNav({ userEmail }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Helper function to match the active route state
  const isActive = (path) => location.pathname === path;

  return (
    <div style={styles.navContainer}>
      
      {/* 🏠 HOME BUTTON */}
      <button 
        onClick={() => { console.log("Navigating to Home"); navigate("/home"); }} 
        style={styles.navButton}
      >
        <Home size={22} color={isActive("/home") ? "#a283ff" : "#8e8e93"} />
        <span style={{ ...styles.label, color: isActive("/home") ? "#a283ff" : "#8e8e93" }}>Home</span>
      </button>

      {/* 🧭 Messages BUTTON */}
      <button 
        onClick={() => { console.log("Navigating to timeline"); navigate("/timeline"); }} 
        style={styles.navButton}
      >
        <Compass size={22} color={isActive("/timeline") ? "#a283ff" : "#8e8e93"} />
        <span style={{ ...styles.label, color: isActive("/timeline") ? "#a283ff" : "#8e8e93" }}>Messages</span>
      </button>

      {/* 📸 FLOATING CENTRAL ACTIONS */}
      <div style={styles.centerActionWrapper}>
        <CreateMemory userEmail={userEmail} onUploadSuccess={() => navigate("/home")} />
      </div>

      {/* 🗺️ MAP BUTTON */}
      <button 
        onClick={() => { console.log("Navigating to Map"); navigate("/map"); }} 
        style={styles.navButton}
      >
        <Map size={22} color={isActive("/map") ? "#a283ff" : "#8e8e93"} />
        <span style={{ ...styles.label, color: isActive("/map") ? "#a283ff" : "#8e8e93" }}>Map</span>
      </button>

      {/* 👤 PROFILE BUTTON */}
      <button 
        onClick={() => { console.log("Navigating to Profile"); navigate("/profile"); }} 
        style={styles.navButton}
      >
        <User size={22} color={isActive("/profile") ? "#a283ff" : "#8e8e93"} />
        <span style={{ ...styles.label, color: isActive("/profile") ? "#a283ff" : "#8e8e93" }}>Profile</span>
      </button>

    </div>
  );
}

const styles = {
  navContainer: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    padding: "10px 0 24px 0",
    width: "100%",
    position: "relative"
  },
  navButton: {
    background: "none",
    border: "none",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    cursor: "pointer",
    flex: 1,
    outline: "none",
    WebkitTapHighlightColor: "transparent" // Prevents gray box flicker on mobile tap
  },
  label: {
    fontSize: "10px",
    fontWeight: "500",
    letterSpacing: "0.2px",
    transition: "color 0.2s ease"
  },
  centerActionWrapper: {
    position: "relative",
    bottom: "16px",
    padding: "0 8px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  }
};
