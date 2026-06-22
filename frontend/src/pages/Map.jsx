import { API_REQUEST_HEADERS, apiUrl } from "../config/api";
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { ChevronRight, Search, SlidersHorizontal, MapPin } from "lucide-react";
import L from "leaflet";
import { getStoredUser } from "./Login"; 

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// CAMERA ENGINE CONTROLLER: Forces main world map canvas view to pan directly to selected markers
function MapViewController({ center, zoomLevel = 11 }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] != null && center[1] != null) {
      map.flyTo(center, zoomLevel, { animate: true, duration: 1.2 });
    }
  }, [center, zoomLevel, map]);
  return null;
}

export default function Map() {
  const [groupedLocations, setGroupedLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingLocation, setEditingLocation] = useState(null);

  useEffect(() => {
    async function fetchSharedTimelineData() {
      const activeUser = getStoredUser();
      if (!activeUser || !activeUser.email) return;

      try {
        const res = await fetch(apiUrl(`/api/feeds/map-milestones?userEmail=${activeUser.email}`), {
          headers: API_REQUEST_HEADERS
        }); 
        const data = await res.json();
        if (res.ok) {
          groupPostsByLocation(data);
        }
      } catch (err) {
        console.error("Error reading shared map coordinates:", err);
      }
    }
    fetchSharedTimelineData();
  }, []);

  const groupPostsByLocation = (posts) => {
    const locationsMap = {};

    posts.forEach((post) => {
      if (!post.latitude || !post.longitude) return;
      const coordKey = `${post.latitude.toFixed(4)},${post.longitude.toFixed(4)}`;

      if (!locationsMap[coordKey]) {
        locationsMap[coordKey] = {
          id: coordKey,
          name: post.location.split(',')[0], 
          fullName: post.location,
          latitude: post.latitude,
          longitude: post.longitude,
          photos: [],
          postIds: [],
          dates: []
        };
      }
      locationsMap[coordKey].photos.push(post.imageUrl);
      locationsMap[coordKey].postIds.push(post.id);
      locationsMap[coordKey].dates.push(new Date(post.createdAt));
    });

    const formattedGroups = Object.values(locationsMap).map((loc) => {
      const sortedDates = loc.dates.sort((a, b) => a - b);
      const startMonth = sortedDates[0]?.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      
      return {
        ...loc,
        dateSummary: startMonth ? `${startMonth}` : "Recent Memories",
        count: loc.photos.length,
        coverImage: loc.photos[0]
      };
    });

    setGroupedLocations(formattedGroups);
    if (formattedGroups.length > 0) {
      setSelectedLocation(formattedGroups[0]);
    }
  };

  const filteredLocations = groupedLocations.filter((loc) =>
    loc.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Active center selector coordinate array
  const activeFocusPoint = 
    searchQuery.length > 0 && filteredLocations.length > 0
      ? [filteredLocations[0].latitude, filteredLocations[0].longitude]
      : selectedLocation 
        ? [selectedLocation.latitude, selectedLocation.longitude] 
        : [34.0194, -118.4912]; // Default Los Angeles grid fallback anchor point

  const createClusterIcon = (coverImage, count) => {
    return L.divIcon({
      className: "custom-map-pin",
      html: `
        <div class="custom-pin-bubble">
          <img src="${coverImage}" alt="" />
          <span class="custom-pin-count">${count}</span>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 44]
    });
  };

  const saveLocationName = async () => {
    const trimmedValue = editingLocation?.value?.trim();
    if (!selectedLocation || !trimmedValue) {
      setEditingLocation(null);
      return;
    }

    try {
      await Promise.all(selectedLocation.postIds.map((postId) => (
        fetch(apiUrl(`/api/posts/${postId}`), {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...API_REQUEST_HEADERS },
          body: JSON.stringify({ location: trimmedValue })
        })
      )));

      setGroupedLocations(prev => prev.map(loc => (
        loc.id === selectedLocation.id
          ? { ...loc, name: trimmedValue.split(",")[0], fullName: trimmedValue }
          : loc
      )));
      setSelectedLocation(prev => prev ? { ...prev, name: trimmedValue.split(",")[0], fullName: trimmedValue } : prev);
      window.dispatchEvent(new Event("postMetadataUpdated"));
    } catch (err) {
      console.error("Could not update map location name:", err);
    } finally {
      setEditingLocation(null);
    }
  };

  return (
    <main className="phone-screen map-screen" style={{ background: "#151517", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", position: "relative" }}>
      
      {/* Map Engine View Layer */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
        <MapContainer center={[activeFocusPoint[0], activeFocusPoint[1]]} zoom={11} style={{ width: "100%", height: "100%" }} zoomControl={false}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {filteredLocations.map((loc) => (
            <Marker
              key={loc.id}
              position={[loc.latitude, loc.longitude]}
              icon={createClusterIcon(loc.coverImage, loc.count)}
              eventHandlers={{ click: () => setSelectedLocation(loc) }}
            />
          ))}

          <MapViewController center={activeFocusPoint} zoomLevel={12} />
        </MapContainer>
      </div>

      {/* Floating Toolbar Header Panel */}
      <div className="map-search" style={{ position: "absolute", top: "50px", left: "16px", right: "16px", zIndex: 10, display: "flex", alignItems: "center", background: "rgba(28,28,30,0.92)", backdropFilter: "blur(20px)", padding: "10px 14px", borderRadius: "12px", border: "1px solid #2c2c2e", gap: "10px" }}>
        <Search size={18} color="#8e8e93" />
        <input 
          aria-label="Search locations" 
          placeholder="Filter map by city, place or landmark..." 
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            const matches = groupedLocations.filter(loc => loc.fullName.toLowerCase().includes(e.target.value.toLowerCase()));
            if (matches.length > 0) setSelectedLocation(matches[0]);
          }}
          style={{ background: "none", border: "none", outline: "none", color: "#fff", fontSize: "0.85rem", flex: 1 }}
        />
        <button type="button" aria-label="Filter memories" style={{ background: "none", border: "none", color: "#0a84ff", cursor: "pointer", display: "flex" }}>
          <SlidersHorizontal size={17} />
        </button>
      </div>

      {/* Slide Context Overlay Sheets */}
      {filteredLocations.length > 0 && selectedLocation ? (
        <section className="place-sheet" style={{ position: "absolute", bottom: "100px", left: "16px", right: "16px", zIndex: 10, background: "rgba(28,28,30,0.95)", backdropFilter: "blur(20px)", borderRadius: "16px", padding: "16px", border: "1px solid #3a3a3c", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
          <div className="place-sheet-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "1.1rem", color: "#fff", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                <MapPin size={16} color="#ff453a" />
                {editingLocation?.id === selectedLocation.id ? (
                  <input
                    autoFocus
                    value={editingLocation.value}
                    onChange={(event) => setEditingLocation(prev => ({ ...prev, value: event.target.value }))}
                    onBlur={saveLocationName}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") event.currentTarget.blur();
                      if (event.key === "Escape") setEditingLocation(null);
                    }}
                    style={{ flex: 1, minWidth: 0, background: "#2c2c2e", border: "1px solid #3a3a3c", borderRadius: "6px", padding: "5px 7px", color: "#fff", fontSize: "1rem", outline: "none" }}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingLocation({ id: selectedLocation.id, value: selectedLocation.fullName })}
                    style={{ flex: 1, minWidth: 0, background: "none", border: "none", color: "#fff", fontSize: "1.1rem", fontWeight: "600", textAlign: "left", cursor: "text", padding: 0 }}
                  >
                    {selectedLocation.name}
                  </button>
                )}
              </h1>
              <p style={{ margin: "2px 0 0 0", fontSize: "0.75rem", color: "#8e8e93" }}>
                {selectedLocation.dateSummary} • {selectedLocation.count} {selectedLocation.count === 1 ? "memory" : "memories"}
              </p>
            </div>
            <button aria-label="Open place details" style={{ background: "#2c2c2e", border: "none", borderRadius: "50%", padding: "6px", color: "#fff", cursor: "pointer", display: "flex" }}>
              <ChevronRight size={18} />
            </button>
          </div>
          
          <div className="thumb-strip" style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "2px" }}>
            {selectedLocation.photos.map((photo, index) => (
              <img src={photo} alt="" key={`${selectedLocation.id}-${index}`} style={{ width: "64px", height: "64px", borderRadius: "8px", objectFit: "cover", border: "1px solid #3a3a3c", flexShrink: 0 }} />
            ))}
          </div>
        </section>
      ) : (
        <div style={{ position: "absolute", bottom: "110px", left: "16px", right: "16px", zIndex: 10, background: "rgba(28,28,30,0.92)", backdropFilter: "blur(20px)", textAlign: "center", color: "#8e8e93", padding: "16px", borderRadius: "14px", fontSize: "0.8rem", border: "1px solid #2c2c2e" }}>
          {searchQuery.length > 0 ? `No pinned milestones match "${searchQuery}"` : "Add shared timeline items with GPS tags to populate the map grid..."}
        </div>
      )}
      
    </main>
  );
}
