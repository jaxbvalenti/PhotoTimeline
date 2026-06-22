import { apiUrl } from "../config/api";
import React, { useState } from "react";
import { MapPin, Image, Send, Loader2 } from "lucide-react";

export default function TimelineUpload({ userEmail, friendId, onUploadSuccess }) {
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [locationName, setLocationName] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePostToTimeline = async (e) => {
    e.preventDefault();
    if (!imageUrl.trim()) return alert("Please provide a photo URL or asset!");
    
    setLoading(true);
    try {
      const response = await fetch(apiUrl("/api/feeds/post"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: userEmail,
          currentFriendId: friendId, // Targets this friend's timeline explicitly
          imageUrls: [imageUrl],     // Wrapped in an array for the backend payload structure
          caption: caption,
          location: locationName || "Shared Location",
          latitude: null,            // Optional: Can tie into browser navigator.geolocation if needed
          longitude: null,
          autoDistributeNearby: false
        })
      });

      const data = await response.json();
      if (response.ok) {
        setImageUrl("");
        setCaption("");
        setLocationName("");
        if (onUploadSuccess) onUploadSuccess(); // Re-fetches timeline milestones instantly
      } else {
        alert(data.error || "Failed to drop moment on timeline.");
      }
    } catch (err) {
      console.error("Timeline upload failure:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.uploadCard}>
      <h3 style={styles.title}>Drop a Memory on this Timeline</h3>
      <form onSubmit={handlePostToTimeline} style={styles.form}>
        
        {/* Photo URL Input Area */}
        <div style={styles.inputWrapper}>
          <Image size={16} color="#8e8e93" />
          <input
            type="text"
            placeholder="Paste photo URL here..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            style={styles.input}
          />
        </div>

        {/* Location Selector Text Area */}
        <div style={styles.inputWrapper}>
          <MapPin size={16} color="#ff453a" />
          <input
            type="text"
            placeholder="Where was this taken? (e.g., Santa Monica Pier)"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            style={styles.input}
          />
        </div>

        {/* Optional Caption Input */}
        <div style={styles.inputWrapper}>
          <input
            type="text"
            placeholder="Add a custom caption or note..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            style={styles.inputNoIcon}
          />
          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>

      </form>
    </div>
  );
}

const styles = {
  uploadCard: {
    background: "#1c1c1e",
    border: "1px solid #2c2c2e",
    borderRadius: "14px",
    padding: "16px",
    margin: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
  },
  title: {
    margin: "0 0 12px 0",
    fontSize: "0.95rem",
    color: "#fff",
    fontWeight: "600"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    background: "#2c2c2e",
    borderRadius: "8px",
    padding: "8px 12px",
    gap: "10px"
  },
  input: {
    background: "none",
    border: "none",
    outline: "none",
    color: "#fff",
    fontSize: "0.85rem",
    flex: 1
  },
  inputNoIcon: {
    background: "none",
    border: "none",
    outline: "none",
    color: "#fff",
    fontSize: "0.85rem",
    flex: 1,
    paddingLeft: "4px"
  },
  submitBtn: {
    background: "#a283ff",
    border: "none",
    borderRadius: "6px",
    padding: "6px 10px",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
};
