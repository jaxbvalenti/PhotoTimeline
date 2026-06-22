import { API_REQUEST_HEADERS, apiUrl } from "../config/api";
import React, { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react"; 
import SocialNetworkSheet from "../components/SocialNetworkSheet"; 

// 🎯 CONFIGURATION GATEWAY: Change this to match your exact backend timeline route name
// Examples: "/api/dashboard", "/api/posts", "/api/timeline"
const TIMELINE_ENDPOINT_PATH = "/api/friends/dashboard";

export default function Home() {
  const getStoredSession = () => {
    try {
      const session = localStorage.getItem("user");
      return session ? JSON.parse(session) : null;
    } catch (e) {
      return null;
    }
  };

  const currentSession = getStoredSession();
  const userEmail = currentSession?.email || "";
  const displayName = currentSession?.name || "User";
  const avatar = currentSession?.picture || "https://via.placeholder.com/150";

  const [isSocialOpen, setIsSocialOpen] = useState(false);
  const [friendsList, setFriendsList] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  
  // 📸 Timeline posts state layers
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMemory, setEditingMemory] = useState(null);

  const fetchSocialDashboard = async () => {
    if (!userEmail) return;
    try {
      const res = await fetch(apiUrl(`/api/friends/dashboard?email=${userEmail}`), {
        headers: API_REQUEST_HEADERS
      });
      const data = await res.json();
      if (res.ok) {
        setFriendsList(data.friends || []);
        setIncomingRequests(data.inboundRequests || data.incomingRequests || []);
        setOutgoingRequests(data.outboundRequests || data.outgoingRequests || []);
      }
    } catch (err) {
      console.error("Error updating home social matrix:", err);
    }
  };

  const fetchTimeline = async () => {
    if (!userEmail) return;
    setIsLoading(true);
    try {
      // Uses the target configurable variable block
      const res = await fetch(apiUrl(`${TIMELINE_ENDPOINT_PATH}?email=${userEmail}`), {
        headers: API_REQUEST_HEADERS
      });
      const data = await res.json();
      if (res.ok) {
        // Safe formatting fallback engine
        setPosts(Array.isArray(data) ? data : data.memories || data.posts || []); 
      }
    } catch (err) {
      console.error("Error fetching timeline posts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSocialDashboard();
    fetchTimeline();

    const handleProximityMemoryCreated = () => {
      fetchTimeline();
    };

    window.addEventListener("proximityMemoryCreated", handleProximityMemoryCreated);
    return () => window.removeEventListener("proximityMemoryCreated", handleProximityMemoryCreated);
  }, [userEmail]);

  const saveMemoryField = async (postId, field, value) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      setEditingMemory(null);
      return;
    }

    const payload = field === "title" ? { caption: trimmedValue } : { location: trimmedValue };

    try {
      const res = await fetch(apiUrl(`/api/posts/${postId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...API_REQUEST_HEADERS },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        setPosts(prev => prev.map(post => {
          if (post.id !== postId) return post;
          return field === "title"
            ? { ...post, title: data.post.caption, caption: data.post.caption }
            : { ...post, locationName: data.post.location, location: data.post.location };
        }));
        window.dispatchEvent(new Event("postMetadataUpdated"));
      }
    } catch (err) {
      console.error("Could not update memory metadata:", err);
    } finally {
      setEditingMemory(null);
    }
  };

  const renderEditableMemoryField = (post, field, value, fallback, style) => {
    const isEditing = editingMemory?.postId === post.id && editingMemory?.field === field;

    if (isEditing) {
      return (
        <input
          autoFocus
          value={editingMemory.value}
          onChange={(event) => setEditingMemory(prev => ({ ...prev, value: event.target.value }))}
          onBlur={() => saveMemoryField(post.id, field, editingMemory.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
            if (event.key === "Escape") setEditingMemory(null);
          }}
          style={{ ...style, width: "100%", background: "#2c2c2e", border: "1px solid #3a3a3c", borderRadius: "6px", padding: "5px 7px", outline: "none" }}
        />
      );
    }

    return (
      <button
        type="button"
        onClick={() => setEditingMemory({ postId: post.id, field, value: value || fallback })}
        style={{ ...style, display: "block", width: "100%", padding: 0, background: "none", border: "none", textAlign: "left", cursor: "text" }}
      >
        {value || fallback}
      </button>
    );
  };

  return (
    <main className="phone-screen screen-dark home-screen" style={{ position: "relative", overflowX: "hidden", minHeight: "100vh" }}>
      
      {/* 👋 PROFILE HERO ROW */}
      <section className="profile-hero" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 16px 20px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <img 
            src={avatar} 
            alt="Profile Avatar" 
            style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover", border: "2px solid #0a84ff" }} 
          />
          <div>
            <h1 style={{ fontSize: "1.35rem", fontWeight: "700", color: "#fff", margin: 0 }}>Hello, {displayName.split(' ')[0]}</h1>
            <p style={{ fontSize: "0.8rem", color: "#8e8e93", margin: "2px 0 0 0" }}>Your personal photo timeline</p>
          </div>
        </div>
      </section>

      {/* 👥 FRIENDS ZONE BOX LAYER */}
      <section style={{ margin: "10px 16px 20px 16px", background: "#1c1c1e", borderRadius: "14px", padding: "12px 16px", border: "1px solid #2c2c2e" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: friendsList.length > 0 ? "12px" : "0px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <h2 style={{ fontSize: "0.95rem", color: "#fff", margin: 0, fontWeight: "600" }}>Friends</h2>
            {incomingRequests.length > 0 && (
              <span style={{ background: "#ff453a", color: "#fff", fontSize: "0.7rem", padding: "1px 6px", borderRadius: "10px", fontWeight: "bold" }}>{incomingRequests.length} New</span>
            )}
          </div>
          <button 
            onClick={() => setIsSocialOpen(true)} 
            style={{ background: "none", border: "none", color: "#0a84ff", fontSize: "0.85rem", display: "flex", alignItems: "center", cursor: "pointer", padding: 0 }}
          >
            See All <ChevronRight size={14} />
          </button>
        </div>

        {friendsList.length === 0 ? (
          <p style={{ color: "#8e8e93", fontSize: "0.8rem", margin: "4px 0", lineHeight: "1.3" }}>No connections yet. Tap See All to add friends!</p>
        ) : (
          <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "4px", scrollbarWidth: "none" }}>
            {friendsList.slice(0, 5).map((friend) => (
              <div key={friend.id || friend.email} style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "55px" }}>
                <img src={friend.avatar || friend.picture || "https://via.placeholder.com/150"} alt="" style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", background: "#2c2c2e" }} />
                <span style={{ color: "#8e8e93", fontSize: "0.65rem", marginTop: "6px", width: "55px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", textAlign: "center" }}>
                  {friend.name || friend.email.split('@')[0]}
                </span>
              </div>
            ))}
            {friendsList.length > 5 && (
              <div onClick={() => setIsSocialOpen(true)} style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#2c2c2e", display: "flex", alignItems: "center", justifyContent: "center", color: "#0a84ff", fontSize: "0.85rem", fontWeight: "bold", cursor: "pointer", minWidth: "40px" }}>
                +{friendsList.length - 5}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 📸 DYNAMIC PHOTO TIMELINE LAYER */}
      <section className="place-grid" style={{ padding: "0 16px 100px 16px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <h2 style={{ fontSize: "1.05rem", color: "#fff", margin: 0, fontWeight: "600" }}>Timeline Memories</h2>
        
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#8e8e93", fontSize: "0.9rem" }}>Loading your timeline...</div>
        ) : posts.length === 0 ? (
          <div style={{ padding: "40px 20px", background: "#1c1c1e", borderRadius: "14px", border: "1px solid #2c2c2e", textAlign: "center" }}>
            <p style={{ color: "#8e8e93", fontSize: "0.85rem", margin: 0 }}>
              Your timeline is empty. Capture a photo or connect with nearby friends to swap memories!
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {posts.map((post) => (
              <div key={post.id} style={{ background: "#1c1c1e", borderRadius: "14px", border: "1px solid #2c2c2e", overflow: "hidden" }}>
                
                {/* Header Context Bar */}
                <div style={{ display: "flex", alignItems: "center", justifyItems: "center", padding: "12px" }}>
                  <div style={{ flex: 1 }}>
                    {renderEditableMemoryField(post, "title", post.caption || post.title, "Timeline Update", { color: "#fff", fontSize: "0.85rem", fontWeight: "600" })}
                    <span style={{ display: "none" }}>
                      📍 {post.location || post.locationName || "Unknown"} • {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : (post.timeAgo || "Just Now")}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                      <span style={{ color: "#8e8e93", fontSize: "0.7rem" }}>📍</span>
                      {renderEditableMemoryField(post, "location", post.location || post.locationName, "Unknown", { color: "#8e8e93", fontSize: "0.7rem" })}
                      <span style={{ color: "#8e8e93", fontSize: "0.7rem", flexShrink: 0 }}>• {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : (post.timeAgo || "Just Now")}</span>
                    </div>
                  </div>
                </div>

                {/* Captured/Received Photo */}
                <img 
                  src={post.imageUrl || post.image} 
                  alt="Timeline memory asset" 
                  style={{ width: "100%", height: "auto", maxHeight: "380px", objectFit: "cover", display: "block" }} 
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <SocialNetworkSheet 
        isOpen={isSocialOpen}
        onClose={() => setIsSocialOpen(false)}
        userEmail={userEmail}
        friendsList={friendsList}
        incomingRequests={incomingRequests}
        outgoingRequests={outgoingRequests}
        fetchSocialDashboard={fetchSocialDashboard}
      />
    </main>
  );
}
