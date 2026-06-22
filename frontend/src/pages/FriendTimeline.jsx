import { API_REQUEST_HEADERS, apiUrl } from "../config/api";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Images,
  Loader2,
  UploadCloud,
  X
} from "lucide-react";

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function displayNameFor(person) {
  if (!person) return "Friend";
  return person.name || person.email?.split("@")[0] || "Friend";
}

export default function FriendTimeline({ friend, userEmail, onBack }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState("");
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const fileInputRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    fetchTimeline();
  }, [friend?.id, userEmail]);

  const fetchTimeline = async () => {
    if (!friend?.id || !userEmail) return;

    setLoading(true);
    try {
      const res = await fetch(
        apiUrl(`/api/feeds/timeline?userEmail=${encodeURIComponent(userEmail)}&friendId=${friend.id}`),
        { headers: API_REQUEST_HEADERS }
      );
      const data = await res.json();
      if (res.ok) {
        setPosts(Array.isArray(data) ? data : []);
      } else {
        setStatus(data.error || "Could not load this joint timeline.");
      }
    } catch (err) {
      console.error("Joint timeline fetch failed:", err);
      setStatus("Could not reach the timeline server.");
    } finally {
      setLoading(false);
    }
  };

  const timelineGroups = useMemo(() => {
    const grouped = new Map();

    posts.forEach((post) => {
      const key = `${post.authorId}-${post.createdAt}-${post.caption || ""}-${post.location || ""}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          key,
          author: post.author,
          caption: post.caption,
          location: post.location,
          createdAt: post.createdAt,
          images: []
        });
      }

      grouped.get(key).images.push({
        id: post.id,
        url: post.imageUrl
      });
    });

    return Array.from(grouped.values()).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [posts]);

  const handleFileSelection = (event) => {
    const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith("image/"));
    setSelectedFiles(files);
    if (files.length > 0) {
      setStatus(`${files.length} photo${files.length === 1 ? "" : "s"} ready to add.`);
    }
  };

  const uploadSelectedFiles = async () => {
    if (selectedFiles.length === 0 || isUploading) return;

    setIsUploading(true);
    setStatus("Adding photos to your joint timeline...");

    try {
      const imageUrls = await Promise.all(selectedFiles.map(fileToDataUrl));
      const res = await fetch(apiUrl("/api/feeds/post"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...API_REQUEST_HEADERS
        },
        body: JSON.stringify({
          userEmail,
          currentFriendId: friend.id,
          imageUrls,
          caption: caption.trim() || "Shared memory",
          location: location.trim() || "Shared Timeline"
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error || "Upload failed.");
        return;
      }

      setCaption("");
      setLocation("");
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setStatus(`${data.count || imageUrls.length} photo${(data.count || imageUrls.length) === 1 ? "" : "s"} added.`);
      await fetchTimeline();
    } catch (err) {
      console.error("Joint timeline upload failed:", err);
      setStatus("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setStatus(""), 4500);
    }
  };

  const scrollTrack = (direction) => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: direction * 320, behavior: "smooth" });
  };

  const friendPhoto = friend?.picture || friend?.avatar || "https://via.placeholder.com/150";
  const currentUserLabel = userEmail?.split("@")[0] || "You";
  const friendLabel = displayNameFor(friend);

  return (
    <div className="phone-screen screen-dark" style={styles.screen}>
      <header style={styles.header}>
        <button onClick={onBack} style={styles.iconButton} aria-label="Back">
          <ArrowLeft size={22} />
        </button>

        <div style={styles.peopleStack}>
          <div style={styles.avatarPair}>
            <div style={{ ...styles.avatarCircle, background: "#30d158" }}>{currentUserLabel.slice(0, 1).toUpperCase()}</div>
            <img src={friendPhoto} alt="" style={{ ...styles.avatarCircle, marginLeft: "-10px", border: "2px solid #1c1c1e" }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h3 style={styles.heading}>{currentUserLabel} + {friendLabel}</h3>
            <p style={styles.subheading}>Joint photo timeline</p>
          </div>
        </div>
      </header>

      {status && (
        <div style={styles.statusBar}>
          <Images size={14} />
          <span>{status}</span>
        </div>
      )}

      <section style={styles.timelineShell}>
        <button type="button" onClick={() => scrollTrack(-1)} style={{ ...styles.railControl, left: 10 }} aria-label="Scroll left">
          <ChevronLeft size={18} />
        </button>
        <button type="button" onClick={() => scrollTrack(1)} style={{ ...styles.railControl, right: 10 }} aria-label="Scroll right">
          <ChevronRight size={18} />
        </button>

        <div ref={trackRef} style={styles.track} className="hide-scrollbar">
          {loading ? (
            <div style={styles.emptyState}>
              <Loader2 size={20} />
              <span>Loading joint timeline...</span>
            </div>
          ) : timelineGroups.length === 0 ? (
            <div style={styles.emptyState}>
              <ImagePlus size={24} />
              <span>Add the first photo or batch for this two-person timeline.</span>
            </div>
          ) : (
            <div style={styles.rail}>
              <div style={styles.railLine} />
              {timelineGroups.map((group, index) => {
                const isTop = index % 2 === 0;
                const dateLabel = new Date(group.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric"
                });
                const coverImage = group.images[0]?.url;

                return (
                  <article key={group.key} style={styles.node}>
                    {isTop && (
                      <TimelineCard
                        group={group}
                        coverImage={coverImage}
                        dateLabel={dateLabel}
                        placement="top"
                        onOpen={() => {
                          setActiveGroup(group);
                          setLightboxIndex(0);
                        }}
                      />
                    )}

                    <div style={styles.pinColumn}>
                      <div style={{ ...styles.connector, top: isTop ? 68 : "auto", bottom: isTop ? "auto" : 68 }} />
                      <div style={styles.pinDot} />
                      <span style={styles.pinDate}>{dateLabel}</span>
                    </div>

                    {!isTop && (
                      <TimelineCard
                        group={group}
                        coverImage={coverImage}
                        dateLabel={dateLabel}
                        placement="bottom"
                        onOpen={() => {
                          setActiveGroup(group);
                          setLightboxIndex(0);
                        }}
                      />
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <footer style={styles.uploadTray}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelection}
          style={{ display: "none" }}
        />

        <div style={styles.uploadFields}>
          <input
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            placeholder="Title this batch"
            style={styles.textInput}
          />
          <input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Location"
            style={styles.textInput}
          />
        </div>

        <div style={styles.uploadActions}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={styles.pickButton}
            aria-label="Pick photos"
          >
            <Camera size={20} />
            <span>{selectedFiles.length > 0 ? `${selectedFiles.length} selected` : "Photos"}</span>
          </button>
          <button
            type="button"
            disabled={selectedFiles.length === 0 || isUploading}
            onClick={uploadSelectedFiles}
            style={{
              ...styles.uploadButton,
              opacity: selectedFiles.length === 0 || isUploading ? 0.55 : 1,
              cursor: selectedFiles.length === 0 || isUploading ? "not-allowed" : "pointer"
            }}
            aria-label="Upload photos"
          >
            {isUploading ? <Loader2 size={20} /> : <UploadCloud size={20} />}
          </button>
        </div>
      </footer>

      {activeGroup && lightboxIndex !== null && (
        <div style={styles.lightbox}>
          <header style={styles.lightboxHeader}>
            <div>
              <h3 style={styles.lightboxTitle}>{activeGroup.caption || "Shared memory"}</h3>
              <p style={styles.lightboxMeta}>{activeGroup.location || "Shared Timeline"} · {lightboxIndex + 1} of {activeGroup.images.length}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveGroup(null);
                setLightboxIndex(null);
              }}
              style={styles.closeButton}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </header>

          <div style={styles.lightboxBody}>
            <button
              type="button"
              onClick={() => setLightboxIndex((lightboxIndex - 1 + activeGroup.images.length) % activeGroup.images.length)}
              style={{ ...styles.lightboxNav, left: 14 }}
              aria-label="Previous photo"
            >
              <ChevronLeft size={22} />
            </button>
            <img src={activeGroup.images[lightboxIndex]?.url} alt="" style={styles.lightboxImage} />
            <button
              type="button"
              onClick={() => setLightboxIndex((lightboxIndex + 1) % activeGroup.images.length)}
              style={{ ...styles.lightboxNav, right: 14 }}
              aria-label="Next photo"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TimelineCard({ group, coverImage, placement, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        ...styles.card,
        top: placement === "top" ? "24px" : "auto",
        bottom: placement === "bottom" ? "24px" : "auto"
      }}
    >
      <div style={styles.cardImageWrap}>
        {coverImage ? (
          <img src={coverImage} alt="" style={styles.cardImage} />
        ) : (
          <ImagePlus size={24} color="#8e8e93" />
        )}
        {group.images.length > 1 && (
          <span style={styles.batchBadge}>{group.images.length}</span>
        )}
      </div>
      <div style={styles.cardText}>
        <strong>{group.caption || "Shared memory"}</strong>
        <span>{group.location || "Shared Timeline"}</span>
      </div>
    </button>
  );
}

const styles = {
  screen: {
    position: "absolute",
    inset: 0,
    zIndex: 200,
    background: "#d8e3e3",
    color: "#111",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "40px 16px 12px 16px",
    background: "#1c1c1e",
    borderBottom: "1px solid #2c2c2e",
    color: "#fff"
  },
  iconButton: {
    width: "34px",
    height: "34px",
    border: "none",
    borderRadius: "50%",
    background: "#2c2c2e",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer"
  },
  peopleStack: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: 0
  },
  avatarPair: {
    display: "flex",
    alignItems: "center",
    flexShrink: 0
  },
  avatarCircle: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    objectFit: "cover",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "0.9rem",
    fontWeight: 800
  },
  heading: {
    margin: 0,
    fontSize: "0.95rem",
    lineHeight: 1.15,
    color: "#fff",
    fontWeight: 700,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "240px"
  },
  subheading: {
    margin: "2px 0 0 0",
    fontSize: "0.72rem",
    color: "#8e8e93"
  },
  statusBar: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "7px 14px",
    background: "#23443a",
    color: "#d8ffe7",
    fontSize: "0.75rem",
    fontWeight: 700
  },
  timelineShell: {
    flex: 1,
    position: "relative",
    minHeight: 0,
    overflow: "hidden"
  },
  track: {
    height: "100%",
    overflowX: "auto",
    overflowY: "hidden",
    display: "flex",
    alignItems: "center",
    padding: "0 44px"
  },
  rail: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    minWidth: "max-content",
    height: "100%",
    padding: "0 40px"
  },
  railLine: {
    position: "absolute",
    left: "40px",
    right: "40px",
    top: "50%",
    height: "18px",
    transform: "translateY(-50%)",
    background: "#2d2b43",
    clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%, 16px 50%)"
  },
  node: {
    width: "220px",
    height: "430px",
    position: "relative",
    flex: "0 0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  pinColumn: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "1px",
    height: "1px",
    transform: "translate(-50%, -50%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3
  },
  connector: {
    position: "absolute",
    width: "3px",
    height: "86px",
    background: "#343146"
  },
  pinDot: {
    width: "13px",
    height: "13px",
    borderRadius: "50%",
    background: "#f3f6f5",
    border: "2px solid #dbe7b6",
    boxShadow: "0 0 0 2px #2d2b43",
    zIndex: 4
  },
  pinDate: {
    position: "absolute",
    top: "18px",
    color: "#343146",
    fontSize: "0.68rem",
    fontWeight: 800,
    whiteSpace: "nowrap"
  },
  card: {
    position: "absolute",
    width: "164px",
    minHeight: "152px",
    border: "none",
    borderRadius: "8px",
    background: "#ffffff",
    padding: "7px",
    top: "28px",
    color: "#17171a",
    textAlign: "left",
    boxShadow: "0 16px 34px rgba(39, 42, 54, 0.18)",
    cursor: "pointer"
  },
  cardImageWrap: {
    position: "relative",
    width: "100%",
    aspectRatio: "1 / 0.78",
    borderRadius: "6px",
    overflow: "hidden",
    background: "#e7eeee",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  cardImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block"
  },
  batchBadge: {
    position: "absolute",
    right: "7px",
    top: "7px",
    minWidth: "24px",
    height: "24px",
    padding: "0 7px",
    borderRadius: "999px",
    background: "#ff6746",
    color: "#fff",
    fontSize: "0.72rem",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  cardText: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    padding: "7px 2px 1px 2px"
  },
  emptyState: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    color: "#343146",
    fontSize: "0.86rem",
    fontWeight: 700,
    textAlign: "center",
    padding: "0 24px"
  },
  railControl: {
    position: "absolute",
    top: "50%",
    zIndex: 8,
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    border: "none",
    background: "rgba(28, 28, 30, 0.88)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer"
  },
  uploadTray: {
    background: "#1c1c1e",
    borderTop: "1px solid #2c2c2e",
    padding: "12px 16px 30px 16px",
    display: "flex",
    gap: "10px",
    alignItems: "stretch"
  },
  uploadFields: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  textInput: {
    width: "100%",
    minHeight: "38px",
    boxSizing: "border-box",
    border: "1px solid #3a3a3c",
    borderRadius: "8px",
    background: "#2c2c2e",
    color: "#fff",
    outline: "none",
    padding: "0 10px",
    fontSize: "0.82rem"
  },
  uploadActions: {
    display: "flex",
    gap: "8px",
    alignItems: "stretch"
  },
  pickButton: {
    width: "84px",
    border: "1px solid #3a3a3c",
    borderRadius: "8px",
    background: "#2c2c2e",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    fontSize: "0.68rem",
    fontWeight: 700,
    cursor: "pointer"
  },
  uploadButton: {
    width: "52px",
    border: "none",
    borderRadius: "50%",
    background: "#30d158",
    color: "#082111",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  lightbox: {
    position: "absolute",
    inset: 0,
    zIndex: 300,
    background: "#050506",
    display: "flex",
    flexDirection: "column"
  },
  lightboxHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "42px 16px 12px 16px",
    background: "rgba(20,20,22,0.96)",
    color: "#fff"
  },
  lightboxTitle: {
    margin: 0,
    fontSize: "0.95rem",
    color: "#fff"
  },
  lightboxMeta: {
    margin: "3px 0 0 0",
    fontSize: "0.72rem",
    color: "#8e8e93"
  },
  closeButton: {
    width: "34px",
    height: "34px",
    border: "none",
    borderRadius: "50%",
    background: "#2c2c2e",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer"
  },
  lightboxBody: {
    flex: 1,
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  lightboxImage: {
    width: "100%",
    maxHeight: "82vh",
    objectFit: "contain"
  },
  lightboxNav: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: "38px",
    height: "38px",
    border: "none",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.18)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer"
  }
};
