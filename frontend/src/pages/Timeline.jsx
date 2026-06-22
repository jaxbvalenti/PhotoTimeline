import React from "react";

export default function Timeline() {
  return (
    <div className="phone-screen" style={{ 
      background: "#000", 
      minHeight: "100vh", 
      color: "#fff", 
      display: "flex", 
      flexDirection: "column", 
      fontFamily: "sans-serif" 
    }}>
      
      {/* Main Content Area */}
      <main style={{ 
        flex: 1, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        flexDirection: "column",
        gap: "16px"
      }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "600" }}>Coming Soon</h1>
        <p style={{ color: "#8e8e93", fontSize: "0.9rem" }}>Our new messaging interface is under construction.</p>
      </main>

      {/* Bottom Navigation */}
      <nav style={{ 
        padding: "20px", 
        borderTop: "1px solid #1c1c1e", 
        textAlign: "center",
        background: "#000",
        fontWeight: "600",
        color: "#3897f0"
      }}>
        Messages
      </nav>
      
    </div>
  );
}
