import React from "react";
import { Outlet } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import { getStoredUser } from "../pages/Login";

export default function AppLayout() {
  // Extract the live user session to feed to the proximity upload context
  const currentUser = getStoredUser();
  const userEmail = currentUser ? currentUser.email : "";

  return (
    <div style={{ 
      backgroundColor: "#0a0a0c",       // Sleek backdrop outside the phone frame
      minHeight: "100vh",
      width: "100vw",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      {/* 📱 PHONE WRAPPER CONTAINER */}
      <div style={{
        width: "100%",
        maxWidth: "430px",              // iPhone Pro Max width match
        height: "100vh",                
        maxHeight: "932px",             // iPhone Pro Max height match
        position: "relative",
        display: "flex",
        flexDirection: "column",
        background: "#000",             
        boxShadow: "0 24px 60px rgba(0,0,0,0.8)", 
        overflow: "hidden"              
      }}>
        
        {/* Full-bleed Viewport Body (Content scrolls completely behind the nav) */}
        <div style={{ 
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflowY: "auto",
          paddingBottom: "90px"         // Keeps important elements clickable at the very bottom
        }}>
          <Outlet /> 
        </div>
        
        {/* 🌟 OVERLAY FLOATING NAVIGATION ANCHOR */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 90,                    // Sits safely above the feed layout
          background: "rgba(28, 28, 30, 0.75)", // Translucent iOS style dark gray
          backdropFilter: "blur(20px)",  // Glassmorphism effect so images blur behind it
          WebkitBackdropFilter: "blur(20px)", // Safari compatibility
          borderTop: "1px solid rgba(255, 255, 255, 0.1)" // Subtle divider line
        }}>
          {/* Inject user email here so proximity uploading knows who is posting */}
          <BottomNav userEmail={userEmail} />
        </div>

      </div>
    </div>
  );
}
