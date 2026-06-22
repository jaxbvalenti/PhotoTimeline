import { API_REQUEST_HEADERS, apiUrl } from "../config/api";
import React, { useState, useEffect } from "react";
import { X, Search, Sparkles, Check, UserPlus, UserCheck, Clock, Layers } from "lucide-react";

export default function SocialNetworkSheet({ 
  isOpen, 
  onClose, 
  userEmail, 
  friendsList = [], 
  incomingRequests = [], 
  outgoingRequests = [],
  fetchSocialDashboard 
}) {
  const [friendFilter, setFriendFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [suggestedFriends, setSuggestedFriends] = useState([]);
  const [sentRequestsThisSession, setSentRequestsThisSession] = useState([]);
  const [respondingRequestIds, setRespondingRequestIds] = useState([]);

  // Fetch baseline recommendations when sheet opens
  useEffect(() => {
    if (isOpen && userEmail) {
      fetchSuggestions();
    }
  }, [isOpen, userEmail, friendsList, incomingRequests, outgoingRequests]);

  // 🔍 AUTOMATIC SEARCH TRIGGER: Hits the backend whenever you type into the search bar
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim() === "@") {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(
          apiUrl(`/api/friends/search?query=${encodeURIComponent(searchQuery.trim())}&currentEmail=${userEmail}`),
          { headers: API_REQUEST_HEADERS }
        );
        const data = await res.json();
        if (res.ok) {
          // Filter out users who are already friends or have pending requests
          const filteredResults = data.filter(user => {
            const isFriend = friendsList.some(f => f.id === user.id || f.email === user.email);
            const isPending = incomingRequests.some(r => r.sender?.id === user.id || r.sender?.email === user.email);
            const isRequested = outgoingRequests.some(r => r.receiver?.id === user.id || r.receiver?.email === user.email);
            return !isFriend && !isPending && !isRequested;
          });
          setSearchResults(filteredResults);
        }
      } catch (err) {
        console.error("Network error executing text search request:", err);
      }
    }, 300); // 300ms debounce keeps the server from getting hammered

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, userEmail, friendsList, incomingRequests, outgoingRequests]);

  const fetchSuggestions = async () => {
    try {
      const res = await fetch(apiUrl(`/api/friends/search?query=@&currentEmail=${userEmail}`), {
        headers: API_REQUEST_HEADERS
      });
      const data = await res.json();
      if (res.ok) {
        const filtered = data.filter(user => {
          const isFriend = friendsList.some(f => f.id === user.id || f.email === user.email);
          const isPending = incomingRequests.some(r => r.sender?.id === user.id || r.sender?.email === user.email);
          const isRequested = outgoingRequests.some(r => r.receiver?.id === user.id || r.receiver?.email === user.email);
          return !isFriend && !isPending && !isRequested;
        });
        setSuggestedFriends(filtered.slice(0, 5));
      }
    } catch (err) {
      console.error("Failed to collect user suggestion tracks:", err);
    }
  };

  const sendFriendRequest = async (targetEmail) => {
    try {
      const res = await fetch(apiUrl("/api/friends/request"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...API_REQUEST_HEADERS },
        body: JSON.stringify({
          senderEmail: userEmail,
          receiverEmail: targetEmail
        })
      });
      if (res.ok) {
        setSentRequestsThisSession(prev => [...prev, targetEmail]);
        if (fetchSocialDashboard) fetchSocialDashboard();
      }
    } catch (err) {
      console.error("Error dispatching social node connection link:", err);
    }
  };

  const respondToFriendRequest = async (requestId, action) => {
    if (respondingRequestIds.includes(requestId)) return;

    setRespondingRequestIds(prev => [...prev, requestId]);
    try {
      const res = await fetch(apiUrl("/api/friends/respond"), {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...API_REQUEST_HEADERS },
        body: JSON.stringify({ requestId, action })
      });

      if (res.ok && fetchSocialDashboard) {
        fetchSocialDashboard();
      }
    } catch (err) {
      console.error("Error resolving received friend request:", err);
    } finally {
      setRespondingRequestIds(prev => prev.filter(id => id !== requestId));
    }
  };

  if (!isOpen) return null;

  // Choose display tracking context based on search state activity
  const isSearching = searchQuery.trim().length > 0;
  const displayUsers = isSearching ? searchResults : suggestedFriends;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", justifyContent: "center", alignItems: "flex-end" }}>
      <section style={{ width: "100%", maxWidth: "500px", background: "#1c1c1e", borderTopLeftRadius: "20px", borderTopRightRadius: "20px", padding: "20px", maxHeight: "85vh", overflowY: "auto" }}>
        
        {/* Title Context Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ color: "#fff", margin: 0, fontSize: "1.25rem", fontWeight: "700" }}>Social Connections</h2>
          <button onClick={onClose} style={{ background: "#2c2c2e", border: "none", borderRadius: "50%", padding: "6px", color: "#fff", cursor: "pointer", display: "flex" }}>
            <X size={18} />
          </button>
        </div>

        {/* Dynamic Context Tabs */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
          <button onClick={() => setFriendFilter("all")} style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "none", background: friendFilter === "all" ? "#0a84ff" : "#2c2c2e", color: "#fff", fontWeight: "600", cursor: "pointer" }}>
            Friends ({friendsList.length})
          </button>
          <button onClick={() => setFriendFilter("requests")} style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "none", background: friendFilter === "requests" ? "#0a84ff" : "#2c2c2e", color: "#fff", fontWeight: "600", cursor: "pointer" }}>
            Requests ({incomingRequests.length})
          </button>
          <button onClick={() => setFriendFilter("discover")} style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "none", background: friendFilter === "discover" ? "#0a84ff" : "#2c2c2e", color: "#fff", fontWeight: "600", cursor: "pointer" }}>
            Find Users
          </button>
        </div>

        {friendFilter === "all" ? (
          /* ========================================================
             FRIENDS LIST COMPARTMENT
             ======================================================== */
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {friendsList.length === 0 ? (
              <p style={{ color: "#8e8e93", fontSize: "0.85rem", textAlign: "center", marginTop: "40px" }}>Your friend circle is currently empty.</p>
            ) : (
              friendsList.map((friend) => (
                <div key={friend.id || friend.email} style={{ background: "#2c2c2e", padding: "10px 14px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <img src={friend.avatar || friend.picture || "https://via.placeholder.com/150"} alt="" style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} />
                    <div>
                      <h4 style={{ margin: 0, color: "#fff", fontSize: "0.85rem" }}>{friend.name || friend.email.split('@')[0]}</h4>
                      <p style={{ margin: 0, color: "#8e8e93", fontSize: "0.7rem" }}>{friend.email}</p>
                    </div>
                  </div>
                  {friend.distanceMiles !== null && (
                    <span style={{ color: "#0a84ff", fontSize: "0.75rem", fontWeight: "500" }}>
                      {friend.distanceMiles < 1 ? "Nearby" : `${Math.round(friend.distanceMiles)} mi`}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        ) : friendFilter === "requests" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {incomingRequests.length === 0 ? (
              <p style={{ color: "#8e8e93", fontSize: "0.85rem", textAlign: "center", marginTop: "40px" }}>No received friend requests right now.</p>
            ) : (
              incomingRequests.map((request) => {
                const sender = request.sender || {};
                const isResponding = respondingRequestIds.includes(request.id);

                return (
                  <div key={request.id} style={{ background: "#2c2c2e", padding: "10px 14px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                      <img src={sender.picture || "https://via.placeholder.com/150"} alt="" style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <h4 style={{ margin: 0, color: "#fff", fontSize: "0.85rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sender.name || sender.email?.split('@')[0] || "New friend"}</h4>
                        <p style={{ margin: 0, color: "#8e8e93", fontSize: "0.7rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sender.email}</p>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                      <button
                        onClick={() => respondToFriendRequest(request.id, "ACCEPT")}
                        disabled={isResponding}
                        style={{ background: "#22c55e", border: "none", borderRadius: "8px", padding: "6px 10px", color: "#fff", fontSize: "0.75rem", fontWeight: "600", cursor: isResponding ? "default" : "pointer", display: "flex", alignItems: "center", gap: "4px", opacity: isResponding ? 0.6 : 1 }}
                      >
                        <Check size={12} />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => respondToFriendRequest(request.id, "REJECT")}
                        disabled={isResponding}
                        style={{ background: "#3a3a3c", border: "none", borderRadius: "8px", padding: "6px", color: "#fff", cursor: isResponding ? "default" : "pointer", display: "flex", alignItems: "center", opacity: isResponding ? 0.6 : 1 }}
                        aria-label="Decline friend request"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* ========================================================
             DISCOVER / TEXT SEARCH USERS ENGINE
             ======================================================== */
          <div>
            {/* Search Input Box */}
            <div style={{ position: "relative", marginBottom: "15px" }}>
              <Search size={16} color="#8e8e93" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Type name or email to search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: "100%", padding: "10px 12px 10px 38px", background: "#2c2c2e", border: "none", borderRadius: "10px", color: "#fff", fontSize: "0.85rem", outline: "none" }}
              />
            </div>

            <h3 style={{ color: "#8e8e93", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 10px 4px" }}>
              {isSearching ? "Search Results" : "Suggested Profiles"}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {displayUsers.length === 0 ? (
                <p style={{ color: "#8e8e93", fontSize: "0.85rem", textAlign: "center", marginTop: "20px" }}>
                  {isSearching ? "No matching profiles found." : "No new suggestions available."}
                </p>
              ) : (
                displayUsers.map((user) => {
                  const isSent = sentRequestsThisSession.includes(user.email);
                  return (
                    <div key={user.id} style={{ background: "#2c2c2e", padding: "10px 14px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <img src={user.picture || "https://via.placeholder.com/150"} alt="" style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} />
                        <div>
                          <h4 style={{ margin: 0, color: "#fff", fontSize: "0.85rem" }}>{user.name}</h4>
                          <p style={{ margin: 0, color: "#8e8e93", fontSize: "0.7rem" }}>{user.email}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => !isSent && sendFriendRequest(user.email)}
                        disabled={isSent}
                        style={{ background: isSent ? "rgba(44,44,46,0.6)" : "#0a84ff", border: "none", borderRadius: "8px", padding: "6px 12px", color: isSent ? "#8e8e93" : "#fff", fontSize: "0.75rem", fontWeight: "600", cursor: isSent ? "default" : "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                      >
                        {isSent ? (
                          <>
                            <Clock size={12} />
                            <span>Sent</span>
                          </>
                        ) : (
                          <>
                            <UserPlus size={12} />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
