import { API_REQUEST_HEADERS, apiUrl } from "../config/api";
import React, { useState, useRef } from 'react';
import { Camera, Loader2 } from "lucide-react";

export default function CreateMemory({ userEmail, onUploadSuccess }) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    // Open the native system file browser/camera input
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);

    // 1. Grab HTML5 Geolocation coordinates from the browser
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      setIsUploading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // 2. Convert the image file asset to a Base64 String
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
          const base64Image = reader.result;

          try {
            // 3. Post directly to your local Express server
            // (Make sure the path matches your exact server route name)
            const response = await fetch(apiUrl("/api/posts/create-proximity"), {
              method: "POST",
              headers: { "Content-Type": "application/json", ...API_REQUEST_HEADERS },
              body: JSON.stringify({
                email: userEmail,
                base64Image: base64Image,
                latitude: latitude,
                longitude: longitude,
                locationName: "Localhost Browser Capture"
              })
            });

            const data = await response.json();

            if (response.ok) {
              if (data.mode === "SHARED_PROXIMITY_HUB") {
                alert(`Moment synchronized! Shared with ${data.targetsReached} nearby ${data.targetsReached === 1 ? "user" : "users"}.`);
              } else {
                alert("Moment saved privately. No nearby users with location data were found.");
              }
              window.dispatchEvent(new Event("proximityMemoryCreated"));
              if (onUploadSuccess) onUploadSuccess();
            } else {
              alert(data.error || "Failed to cross-post to your proximity area.");
            }
          } catch (err) {
            console.error("Network upload error:", err);
            alert("Could not connect to the localhost backend server.");
          } finally {
            setIsUploading(false);
          }
        };
      },
      (error) => {
        setIsUploading(false);
        console.error("Location tracking blocked:", error);
        alert("Location access denied. Please allow location permissions in your browser address bar.");
      },
      { enableHighAccuracy: true } // Tells the PC to pinpoint your network/Wi-Fi router location
    );
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      {/* Hidden system input handler */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        style={{ display: "none" }} 
      />

      {/* Main interactive Nav Bar Camera Button */}
      <button 
        onClick={handleButtonClick}
        disabled={isUploading}
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "#0a84ff", // Classic vibrant UI blue
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(10, 132, 255, 0.4)",
          transition: "transform 0.15s ease",
          position: "relative",
          bottom: "10px" // Floats the button slightly out of the navigation bar
        }}
        onMouseEnter={(e) => !isUploading && (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseLeave={(e) => !isUploading && (e.currentTarget.style.transform = "scale(1)")}
      >
        {isUploading ? (
          <Loader2 
            size={24} 
            color="#fff" 
            style={{ animation: "spin 1s linear infinite" }} 
          />
        ) : (
          <Camera size={26} color="#fff" />
        )}
      </button>

      {/* Basic spinning keyframe rules injected directly for VS Code browser preview rendering */}
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
