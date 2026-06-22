import { API_REQUEST_HEADERS, apiUrl } from "../config/api";
import React, { useState, useRef, useEffect } from "react";
import { googleLogout } from '@react-oauth/google'; 
import { Settings, User, LogOut, X, Check, Camera, ChevronRight } from "lucide-react"; 
import FriendTimeline from "./FriendTimeline";
import SocialNetworkSheet from "../components/SocialNetworkSheet"; 

export default function Profile() {
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
  const emailDisplay = currentSession?.email || "Signed in with Google";

  const [displayName, setDisplayName] = useState(
    currentSession?.name && currentSession.name !== "Photo Timeline User"
      ? currentSession.name 
      : (currentSession?.email ? currentSession.email.split('@')[0] : "Photo Timeline User")
  );
  const [avatar, setAvatar] = useState(currentSession?.picture || "https://via.placeholder.com/150");
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const [isEditing, setIsEditing] = useState(false);   
  const [selectedFile, setSelectedFile] = useState(null); 
  const fileInputRef = useRef(null);

  const [isFriendsModalOpen, setIsFriendsModalOpen] = useState(false);
  const [friendsList, setFriendsList] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [activeTimelineFriend, setActiveTimelineFriend] = useState(null);
  const [stats, setStats] = useState({ memories: 0, places: 0 });

  useEffect(() => {
    const session = getStoredSession();
    if (session) {
      if (session.name) setDisplayName(session.name);
      if (session.picture) setAvatar(session.picture);
    }
    if (userEmail) {
      fetchSocialDashboard();
      fetchProfileStats(); 
    }
  }, [isEditing, userEmail]);

  const fetchProfileStats = async () => {
    try {
      const res = await fetch(apiUrl(`/api/user/stats?userEmail=${userEmail}`));
      const data = await res.json();
      if (res.ok) {
        setStats({
          memories: data.memories || 0,
          places: data.places || 0
        });
      }
    } catch (err) {
      console.error("Live profile statistics breakdown error:", err);
    }
  };

  const fetchSocialDashboard = async () => {
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
      console.error("Error fetching relationships:", err);
    }
  };

  const handlePhotoSelected = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setSelectedFile(file); 
    setAvatar(URL.createObjectURL(file)); 
  };

  const handleSave = async () => {
    if (!userEmail) return;
    setIsEditing(false);

    const convertToBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = () => resolve(fileReader.result);
        fileReader.onerror = (error) => reject(error);
      });
    };

    try {
      let base64Picture = avatar;
      if (selectedFile) {
        base64Picture = await convertToBase64(selectedFile);
      }

      const payload = {
        email: userEmail,
        name: displayName,
        picture: base64Picture,
      };

      const response = await fetch(apiUrl("/api/user/profile"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok && data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setDisplayName(data.user.name);
        setAvatar(data.user.picture);
        setSelectedFile(null);
        fetchProfileStats(); 
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleSignOut = () => {
    googleLogout(); 
    localStorage.clear(); 
    window.location.replace("/login"); 
  };

  return (
    <main className="phone-screen screen-dark profile-screen" style={{ position: "relative", overflowX: "hidden", minHeight: "100vh" }}>
      <input type="file" ref={fileInputRef} onChange={handlePhotoSelected} accept="image/*" style={{ display: "none" }} />

      {activeTimelineFriend && (
        <FriendTimeline 
          friend={activeTimelineFriend}
          userEmail={userEmail}
          onBack={() => setActiveTimelineFriend(null)}
        />
      )}

      <header className="profile-top">
        <p className="status-time">9:41</p>
        {isEditing ? (
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="icon-button dark" onClick={handleSave}><Check size={18} color="#22c55e" /></button>
            <button className="icon-button dark" onClick={() => { setIsEditing(false); setSelectedFile(null); }}><X size={18} color="#ef4444" /></button>
          </div>
        ) : (
          <button className="icon-button dark" onClick={() => setIsMenuOpen(true)}><Settings size={18} /></button>
        )}
      </header>

      <section className="profile-hero" style={{ paddingBottom: "10px" }}>
        <div onClick={isEditing ? () => fileInputRef.current.click() : undefined} style={{ position: "relative", display: "block", margin: "0 auto", width: "96px", height: "96px", cursor: isEditing ? "pointer" : "default" }}>
          <img src={avatar} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", display: "block", border: "2px solid #0a84ff" }} />
          {isEditing && (
            <div style={{ position: "absolute", bottom: 0, right: 0, background: "#0a84ff", borderRadius: "50%", padding: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Camera size={14} color="#fff" />
            </div>
          )}
        </div>
        
        {isEditing ? (
          <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", marginTop: "12px" }}>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} style={{ background: "#222", border: "1px solid #444", color: "#fff", fontSize: "1.4rem", fontWeight: "bold", textAlign: "center", borderRadius: "8px", padding: "6px", width: "80%" }} />
            <button onClick={() => fileInputRef.current.click()} style={{ background: "#2c2c2e", border: "1px solid #3a3a3c", color: "#0a84ff", fontSize: "0.85rem", fontWeight: "600", borderRadius: "20px", padding: "6px 16px" }}>Upload New Photo</button>
          </div>
        ) : (
          <>
            <h1>{displayName}</h1>
            <p style={{ margin: "4px 0 0 0" }}>{emailDisplay}</p>
          </>
        )}
        
        <div className="stats-row" style={{ marginTop: "15px" }}>
          <span><strong>{stats.memories}</strong> Memories</span>
          <span><strong>{friendsList.length}</strong> Friends</span>
          <span><strong>{stats.places}</strong> Places</span>
        </div>
      </section>

      <section style={{ margin: "10px 16px 20px 16px", background: "#1c1c1e", borderRadius: "14px", padding: "12px 16px", border: "1px solid #2c2c2e" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: friendsList.length > 0 ? "12px" : "0px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <h2 style={{ fontSize: "0.95rem", color: "#fff", margin: 0, fontWeight: "600" }}>Friends</h2>
            {incomingRequests.length > 0 && (
              <span style={{ background: "#ff453a", color: "#fff", fontSize: "0.7rem", padding: "1px 6px", borderRadius: "10px", fontWeight: "bold" }}>{incomingRequests.length} New</span>
            )}
          </div>
          <button onClick={() => setIsFriendsModalOpen(true)} style={{ background: "none", border: "none", color: "#0a84ff", fontSize: "0.85rem", display: "flex", alignItems: "center", cursor: "pointer" }}>See More <ChevronRight size={14} /></button>
        </div>

        {friendsList.length === 0 ? (
          <p style={{ color: "#8e8e93", fontSize: "0.8rem", margin: "4px 0" }}>No connections yet. Tap See More to add friends!</p>
        ) : (
          <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "4px" }}>
            {friendsList.slice(0, 5).map((friend) => (
              <div key={friend.id} onClick={() => setActiveTimelineFriend(friend)} style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "55px", cursor: "pointer" }}>
                <img src={friend.picture || friend.avatar || "https://via.placeholder.com/150"} alt="" style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
                <span style={{ color: "#8e8e93", fontSize: "0.65rem", marginTop: "4px", width: "55px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", textAlign: "center" }}>{friend.name || friend.email.split('@')[0]}</span>
              </div>
            ))}
            {friendsList.length > 5 && (
              <div onClick={() => setIsFriendsModalOpen(true)} style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#2c2c2e", display: "flex", alignItems: "center", justifyContent: "center", color: "#0a84ff", fontSize: "0.85rem", fontWeight: "bold", cursor: "pointer" }}>+{friendsList.length - 5}</div>
            )}
          </div>
        )}
      </section>

      <section className="place-grid" style={{ padding: "0 16px 100px 16px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <h2 style={{ fontSize: "1.05rem", color: "#fff", margin: "0 0 4px 0", fontWeight: "600" }}>My Memories</h2>
        <p style={{ color: "#8e8e93", fontSize: "0.85rem", margin: 0 }}>
          Your chronological history is safely managed by the Timeline Engine feed layers.
        </p>
      </section>

      {/* --- MOUNTED DECOUPLED CHILD MODULE --- */}
      <SocialNetworkSheet 
        isOpen={isFriendsModalOpen}
        onClose={() => setIsFriendsModalOpen(false)}
        userEmail={userEmail}
        friendsList={friendsList}
        incomingRequests={incomingRequests}
        outgoingRequests={outgoingRequests}
        fetchSocialDashboard={fetchSocialDashboard} 
      />

      {/* --- SETTINGS DRAWER OVERLAY --- */}
      {isMenuOpen && (
        <>
          <div onClick={() => setIsMenuOpen(false)} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 100 }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "#1c1c1e", borderTopLeftRadius: "16px", borderTopRightRadius: "16px", padding: "20px", zIndex: 110, display: "flex", flexDirection: "column", gap: "15px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #2c2c2e", paddingBottom: "10px" }}>
              <h3 style={{ margin: 0, color: "#fff", fontSize: "1.1rem" }}>Settings</h3>
              <button onClick={() => setIsMenuOpen(false)} style={{ background: "none", border: "none", padding: "4px", cursor: "pointer" }}><X size={20} color="#8e8e93" /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button onClick={() => { setIsMenuOpen(false); setIsEditing(true); }} style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", padding: "12px", background: "#2c2c2e", border: "none", borderRadius: "8px", color: "#fff", fontSize: "1rem", textAlign: "left", cursor: "pointer" }}><User size={18} color="#0a84ff" /><span>Edit User Info</span></button>
              <button onClick={handleSignOut} style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", padding: "12px", background: "#2c2c2e", border: "none", borderRadius: "8px", color: "#ff453a", fontSize: "1rem", textAlign: "left", cursor: "pointer" }}><LogOut size={18} color="#ff453a" /><span>Sign Out</span></button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
