const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();
const frontendDistPath = path.resolve(__dirname, "..", "frontend", "dist");
const allowedOrigins = new Set([
  "http://localhost:5000",
  "http://127.0.0.1:5000",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "https://surprised-bikini-asp-suffered.trycloudflare.com"
]);

// Comprehensive Cross-Origin Resource Sharing Configurations
const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin", "ngrok-skip-browser-warning"],
  credentials: true,
  optionsSuccessStatus: 200
};

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(cors(corsOptions));

// 🔄 FIXED FOR EXPRESS 5: Strict format matching for catch-all parameter paths
app.options("*any", cors(corsOptions));

// High-capacity request payload boundaries for base64 media data packages
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true, parameterLimit: 100000 }));

/* ==========================================================================
   MIDDLEWARE & REQUEST TELEMETRY TRACKING
   ========================================================================== */
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Incoming Request: ${req.method} ${req.originalUrl}`);
  console.log(`[${timestamp}] Content-Length: ${req.headers['content-length'] || 0} bytes`);
  next();
});

app.use(express.static(frontendDistPath, { index: false }));

/* ==========================================================================
   ROOT NETWORK GATEWAY & SYSTEM STATUS DIAGNOSTICS
   ========================================================================== */
app.get("/", (req, res) => {
  if (req.accepts("html")) {
    return res.sendFile(path.join(frontendDistPath, "index.html"));
  }

  console.log("Root health gateway pinged successfully.");
  return res.status(200).json({
    status: "online",
    service: "PhotoTimeline Backend Microservice Engine",
    environment: process.env.NODE_ENV || "development",
    databaseConnection: "VERIFIED",
    tunnelingStatus: "Active via ngrok secure infrastructure",
    serverTime: new Date().toISOString(),
    apiEndpoints: {
      auth: "/api/auth/*",
      user: "/api/user/*",
      friends: "/api/friends/*",
      feeds: "/api/feeds/*",
      posts: "/api/posts/*"
    }
  });
});

app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({
      status: "HEALTHY",
      database: "CONNECTED",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Critical Health Check Failure:", error);
    return res.status(500).json({
      status: "UNHEALTHY",
      database: "DISCONNECTED",
      error: error.message
    });
  }
});

/* ==========================================================================
   🔐 IDENTITY MANAGEMENT & GOOGLE OAUTH COORDINATION
   ========================================================================== */
app.post("/api/auth/google-sync", async (req, res) => {
  console.log("Initiating Google Authentication profile synchronization pipeline...");
  try {
    const { email, name, picture } = req.body;

    if (!email) {
      console.warn("Authentication abort: Missing email property in data payload.");
      return res.status(400).json({ error: "Email parameter validation constraint missing" });
    }

    console.log(`Looking up application database register for entity: ${email}`);
    let user = await prisma.user.findUnique({ where: { email: email } });

    if (!user) {
      console.log(`No existing account matches profile token. Provisioning brand new user registry row for ${email}...`);
      const fallbackName = email.split("@")[0];
      
      user = await prisma.user.create({
        data: {
          email: email,
          name: name || fallbackName,
          picture: picture || "",
          password: "OAUTH_EXTERNAL_IDENTITY_PROVIDER_SIGNATURE",
          latitude: null,
          longitude: null
        },
      });
      console.log(`Account initialized securely with internal sequence ID: ${user.id}`);
    } else {
      console.log(`Account matched successfully for user sequence ID: ${user.id}. Refreshing tracking instances if changed.`);
      if (picture && user.picture !== picture) {
        user = await prisma.user.update({
          where: { email: email },
          data: { picture: picture }
        });
        console.log("Updated avatar layout source matching latest OAuth packet.");
      }
    }

    console.log("Authentication profile verification finalized without system issues.");
    return res.status(200).json({ 
      success: true, 
      message: "Identity token securely integrated into state graph",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture
      }
    });
  } catch (error) {
    console.error("Fatal breakdown inside identity token validation processing pipeline:", error);
    return res.status(500).json({ 
      error: "Identity token capture failed", 
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
});

/* ==========================================================================
   👤 PROFILE EDITING & ANALYTICAL TELEMETRY AGGREGATION
   ========================================================================== */
app.put("/api/user/profile", async (req, res) => {
  console.log("Processing account baseline modifications request row adjustments...");
  try {
    const { email, name, picture } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Missing identifying search criteria field: email" });
    }

    const updatedUser = await prisma.user.update({
      where: { email: email },
      data: {
        name: name,
        picture: picture
      }
    });

    console.log(`Profile adjustments committed for record index: ${updatedUser.id}`);
    return res.status(200).json({ 
      success: true, 
      message: "Profile properties modified on active table registry",
      user: updatedUser 
    });
  } catch (error) {
    console.error("Profile synchronization database execution error:", error);
    return res.status(500).json({ error: "Failed to persist identity adjustments", details: error.message });
  }
});

app.get("/api/user/stats", async (req, res) => {
  const { userEmail } = req.query;
  console.log(`Aggregating tracking metrics and operational logs for user: ${userEmail}`);
  
  try {
    if (!userEmail) {
      return res.status(400).json({ error: "Target email argument missing from compilation query" });
    }

    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
      console.warn(`Telemetry inquiry targeted non-existent dataset row reference matching: ${userEmail}`);
      return res.status(404).json({ error: "User profile record index mismatch" });
    }

    console.log(`Calculating structural totals across post instances linking back to profile row index: ${user.id}`);
    const memoryCount = await prisma.post.count({
      where: {
        OR: [
          { authorId: user.id }, 
          { recipientId: user.id }
        ]
      }
    });

    console.log("Isolating unique geographic locations tagged across dataset tables...");
    const uniquePlaces = await prisma.post.groupBy({
      by: ["location"],
      where: {
        OR: [
          { authorId: user.id }, 
          { recipientId: user.id }
        ],
        NOT: {
          location: "Unknown Location"
        }
      }
    });

    console.log(`Metrics calculations completed successfully. Memories: ${memoryCount}, Venues: ${uniquePlaces.length}`);
    return res.status(200).json({
      memories: memoryCount,
      places: uniquePlaces.length
    });
  } catch (error) {
    console.error("Statistics collection analytical thread extraction failure:", error);
    return res.status(500).json({ error: "Could not aggregate telemetry dataset properties", details: error.message });
  }
});

/* ==========================================================================
   🆕 INTERACTIVE SOCIAL SEARCH & AUTO-SUGGESTIONS (DIAGNOSTIC BUILD)
   ========================================================================== */
app.get("/api/friends/search", async (req, res) => {
  console.log("\n--- [SEARCH ROUTE HIT] ---");
  console.log("Raw Query Parameters received:", req.query);
  
  try {
    const { query, currentEmail } = req.query;

    if (!currentEmail) {
      console.warn("⚠️ Search Aborted: 'currentEmail' query parameter is undefined or missing!");
      return res.status(400).json({ error: "Missing current user email identification parameters." });
    }

    const isInitialSuggestion = query === "@" || !query || query.trim() === "";
    console.log(`Is Initial Recommendation State (@ or blank)? -> ${isInitialSuggestion}`);
    console.log(`Sanitized Search String: "${query ? query.trim() : ''}"`);

    const currentUser = await prisma.user.findUnique({
      where: { email: currentEmail },
      select: { id: true }
    });

    if (!currentUser) {
      console.warn(`Search aborted: no current user exists for email ${currentEmail}`);
      return res.status(404).json({ error: "Current user profile could not be found." });
    }

    const existingConnections = await prisma.friendRequest.findMany({
      where: {
        OR: [
          { senderId: currentUser.id },
          { receiverId: currentUser.id }
        ],
        status: {
          in: ["PENDING", "ACCEPTED"]
        }
      },
      select: {
        senderId: true,
        receiverId: true
      }
    });

    const excludedUserIds = [
      currentUser.id,
      ...existingConnections.map((request) =>
        request.senderId === currentUser.id ? request.receiverId : request.senderId
      )
    ];

    // Build filter layout
    const searchConditions = {
      id: { 
        notIn: excludedUserIds 
      }
    };

    if (!isInitialSuggestion) {
      const sanitizedQuery = query.trim();
      
      searchConditions.OR = [
        { name: { contains: sanitizedQuery, mode: "insensitive" } },
        { email: { contains: sanitizedQuery, mode: "insensitive" } }
      ];
    }

    // 🎯 CRITICAL DEBUG LOG: Look at this output in your terminal window!
    console.log("CRITICAL: Exact where clause object passed to Prisma:\n", JSON.stringify(searchConditions, null, 2));

    console.log("Hitting database via Prisma Client...");
    const matchedUsers = await prisma.user.findMany({
      where: searchConditions,
      select: {
        id: true,
        name: true,
        email: true,
        picture: true
      },
      take: 15 
    });

    console.log(`Database transaction complete. Found ${matchedUsers.length} user records matching this filter structure.`);
    console.log("Records payload preview:", matchedUsers);
    console.log("---------------------------\n");

    return res.status(200).json(matchedUsers);
  } catch (error) {
    console.error("❌ Critical context error breaking active system user search routines:", error);
    return res.status(500).json({ 
      error: "Search framework failed to execute lookups matching specified configuration.",
      details: error.message 
    });
  }
});

/* ==========================================================================
   👥 SOCIAL INTERACTION ROUTING & GRAPH NODE LINKING
   ========================================================================== */
app.post("/api/friends/request", async (req, res) => {
  console.log("Friend relationship initialization attempt received...");
  const { senderEmail, receiverEmail } = req.body;

  try {
    if (!senderEmail || !receiverEmail) {
      return res.status(400).json({ error: "Both request source and connection target parameters must be specified" });
    }

    const sender = await prisma.user.findUnique({ where: { email: senderEmail } });
    const receiver = await prisma.user.findUnique({ where: { email: receiverEmail } });

    if (!sender || !receiver) {
      console.warn("Aborting graph modification: One or both entity targets cannot be found.");
      return res.status(404).json({ error: "Target platform entity records missing from profile database matching parameters" });
    }

    console.log(`Checking inverse relationship configurations between Sender [${sender.id}] and Receiver [${receiver.id}]`);
    const reverseReq = await prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: {
          senderId: receiver.id,
          receiverId: sender.id
        }
      }
    });

    if (reverseReq) {
      console.log("An overlapping relationship inversion was detected. Auto-upgrading state index to ACCEPTED.");
      const activeMatch = await prisma.friendRequest.update({
        where: { id: reverseReq.id },
        data: { status: "ACCEPTED" }
      });
      return res.status(200).json({ 
        success: true, 
        message: "Mutual social relationship triggered auto-acceptance algorithms successfully", 
        request: activeMatch 
      });
    }

    console.log("Creating new explicit non-directional connection edge on friend requests list table...");
    const newRequest = await prisma.friendRequest.create({
      data: {
        senderId: sender.id,
        receiverId: receiver.id,
        status: "PENDING"
      }
    });

    console.log(`Friend connection tracking record written down into database index row: ${newRequest.id}`);
    return res.status(200).json({ success: true, request: newRequest });
  } catch (error) {
    console.error("Relational index database transaction clash inside request tracking engine:", error);
    return res.status(400).json({ 
      error: "Request integrity constraint exception or duplicate record element mismatch", 
      details: error.message 
    });
  }
});

app.put("/api/friends/respond", async (req, res) => {
  console.log("Processing pending validation answer parameter modification action...");
  const { requestId, action } = req.body;

  try {
    if (!requestId || !action) {
      return res.status(400).json({ error: "Missing structural data properties: requestId and action parameters required" });
    }

    const numericId = Number(requestId);
    if (isNaN(numericId)) {
      return res.status(400).json({ error: "Target data record index identifier must be numerical" });
    }

    if (action === "ACCEPT") {
      console.log(`Updating relational indicator flag status to ACCEPTED for request entry id: ${numericId}`);
      const updatedRequest = await prisma.friendRequest.update({
        where: { id: numericId },
        data: { status: "ACCEPTED" }
      });
      return res.status(200).json({ success: true, message: "Relationship validated successfully", request: updatedRequest });
    } else if (action === "REJECT" || action === "REMOVE") {
      console.log(`Severing connection links. Deleting request tracking entry matching index reference: ${numericId}`);
      await prisma.friendRequest.delete({
        where: { id: numericId }
      });
      return res.status(200).json({ success: true, message: "Social interaction records severed safely from target array" });
    } else {
      return res.status(400).json({ error: "Invalid operational parameter. Must match ACCEPT or REJECT parameters" });
    }
  } catch (error) {
    console.error("Mutation constraint structural execution error encountered handling relationship parameters:", error);
    return res.status(500).json({ error: "Failed to resolve relationship transition state inside engine", details: error.message });
  }
});

/* ==========================================================================
   📍 AUTOMATED GEOGRAPHIC CAM PROXIMITY CALCULATIONS INTERFACE
   ========================================================================= */
app.post("/api/posts/create-proximity", async (req, res) => {
  console.log("Proximity camera asset received. Activating positioning mapping layers...");
  const {
    authorEmail,
    email: payloadEmail,
    image,
    base64Image: payloadBase64Image,
    latitude,
    longitude,
    caption,
    locationName
  } = req.body;
  const email = payloadEmail || authorEmail;
  const base64Image = payloadBase64Image || image;

  try {
    if (!email || !base64Image) {
      return res.status(400).json({ error: "Incomplete dataset package payload profiles. Image data asset and author identification required." });
    }

    const parsedLat = parseFloat(latitude);
    const parsedLon = parseFloat(longitude);

    if (isNaN(parsedLat) || isNaN(parsedLon)) {
      return res.status(400).json({ error: "Geographic coordinate matrices parsing validation error. Checked options are not numbers." });
    }

    const currentUser = await prisma.user.findUnique({ where: { email: email } });
    if (!currentUser) {
      return res.status(404).json({ error: "Identity check lookup verification exception error." });
    }

    console.log(`Updating spatial positioning logs tracking grid parameters for record profile index: ${currentUser.id}`);
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { 
        latitude: parsedLat, 
        longitude: parsedLon 
      }
    });

    console.log("Extracting external user coordinates mapping matrices to evaluate physical proximity boundaries...");
    const allUsers = await prisma.user.findMany({
      where: { 
        NOT: { id: currentUser.id } 
      }
    });

    // Haversine Trigonometric Formula calculation computing distance matrices inside 150 meters grid bounds
    const nearbyProfiles = allUsers.filter(targetNode => {
      if (targetNode.latitude == null || targetNode.longitude == null) return false;
      
      const earthRadiusKm = 6371; 
      const deltaLatRadians = (targetNode.latitude - parsedLat) * Math.PI / 180;
      const deltaLonRadians = (targetNode.longitude - parsedLon) * Math.PI / 180;
      
      const processingComponentA = 
        Math.sin(deltaLatRadians / 2) * Math.sin(deltaLatRadians / 2) +
        Math.cos(parsedLat * Math.PI / 180) * Math.cos(targetNode.latitude * Math.PI / 180) *
        Math.sin(deltaLonRadians / 2) * Math.sin(deltaLonRadians / 2);
      
      const processingComponentC = 2 * Math.atan2(Math.sqrt(processingComponentA), Math.sqrt(1 - processingComponentA));
      const totalComputedDistanceKm = earthRadiusKm * processingComponentC; 
      
      console.log(`Calculated relative spacing distance to User [${targetNode.name}]: ${totalComputedDistanceKm.toFixed(4)} KM`);
      return totalComputedDistanceKm <= 0.15; // Limit evaluated constraints strictly underneath 150 meters boundary line
    });

    if (nearbyProfiles.length === 0) {
      console.log("No tracking entities matched location profiles. Locking asset securely inside owner's Private Vault.");
      const privateVaultPost = await prisma.post.create({
        data: {
          imageUrl: base64Image,
          caption: caption || "Private Timeline Vault Entry",
          location: locationName || "Private Coordinate Zone",
          latitude: parsedLat,
          longitude: parsedLon,
          authorId: currentUser.id,
          recipientId: currentUser.id
        }
      });
      return res.status(200).json({ 
        success: true, 
        mode: "PRIVATE_VAULT", 
        message: "No user entities identified inside operational grid range. Item secured privately.",
        post: privateVaultPost 
      });
    }

    console.log(`Proximity calculation match verified. Distributing image content structures to ${nearbyProfiles.length} recipient node channels.`);
    const dataDistributionTasks = [
      prisma.post.create({
        data: {
          imageUrl: base64Image,
          caption: caption || "Private Timeline Vault Entry",
          location: locationName || "Shared Proximity Hub Location",
          latitude: parsedLat,
          longitude: parsedLon,
          authorId: currentUser.id,
          recipientId: currentUser.id
        }
      }),
      ...nearbyProfiles.map(recipientRecord => prisma.post.create({
        data: {
          imageUrl: base64Image,
          caption: caption || `Shared proximity moment captured by ${currentUser.name}`,
          location: locationName || "Shared Proximity Hub Location",
          latitude: parsedLat,
          longitude: parsedLon,
          authorId: currentUser.id,
          recipientId: recipientRecord.id
        }
      }))
    ];

    const executionSummaryPackets = await Promise.all(dataDistributionTasks);
    console.log("All data distribution threads successfully executed down into relational matrices indices.");
    
    return res.status(200).json({ 
      success: true, 
      mode: "SHARED_PROXIMITY_HUB", 
      targetsReached: nearbyProfiles.length,
      recordsCommittedCount: executionSummaryPackets.length
    });

  } catch (error) {
    console.error("Fatal spatial proximity engine routing tracking thread crash error:", error);
    return res.status(500).json({ error: "Proximity distribution pipeline runtime error encountered", details: error.message });
  }
});

/* ==========================================================================
   🔄 GRAPH DATA FEEDS & TIMELINE CONTEXT COMPILATION AGGREGATORS
   ========================================================================== */
app.put("/api/posts/:id", async (req, res) => {
  const postId = Number(req.params.id);
  const { caption, title, location } = req.body;

  try {
    if (Number.isNaN(postId)) {
      return res.status(400).json({ error: "Post id must be a number" });
    }

    const updateData = {};
    if (caption !== undefined || title !== undefined) {
      updateData.caption = caption !== undefined ? caption : title;
    }
    if (location !== undefined) {
      updateData.location = location;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No editable post fields were provided" });
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: updateData,
      include: { author: true }
    });

    return res.status(200).json({ success: true, post: updatedPost });
  } catch (error) {
    console.error("Post metadata update failed:", error);
    return res.status(500).json({ error: "Could not update post metadata", details: error.message });
  }
});

app.get("/api/feeds/private-timeline", async (req, res) => {
  const { email } = req.query;
  console.log(`Loading standalone private dashboard layout elements targeting matching row: ${email}`);

  try {
    if (!email) {
      return res.status(400).json({ error: "Identifying email lookup parameter argument required" });
    }

    const user = await prisma.user.findUnique({ where: { email: email } });
    if (!user) {
      return res.status(404).json({ error: "Target system account parameters identity mapping structure is broken" });
    }

    console.log(`Querying historical vault instances containing matching self references for user sequence index: ${user.id}`);
    const privateVaultTimelineRecords = await prisma.post.findMany({
      where: { 
        authorId: user.id, 
        recipientId: user.id 
      },
      orderBy: { 
        createdAt: "desc" 
      }
    });

    console.log(`Extracted ${privateVaultTimelineRecords.length} records back from timeline registry rows.`);
    return res.status(200).json(privateVaultTimelineRecords);
  } catch (error) {
    console.error("Chronological timeline database collection processing extraction error:", error);
    return res.status(500).json({ error: "Could not fetch structural collection records matching profile indexes", details: error.message });
  }
});

app.get("/api/feeds/timeline", async (req, res) => {
  const { userEmail, friendId } = req.query;

  try {
    if (!userEmail || !friendId) {
      return res.status(400).json({ error: "User email and friend id are required" });
    }

    const currentUser = await prisma.user.findUnique({ where: { email: userEmail } });
    const friend = await prisma.user.findUnique({ where: { id: Number(friendId) } });

    if (!currentUser || !friend) {
      return res.status(404).json({ error: "Timeline participants could not be found" });
    }

    const acceptedFriendship = await prisma.friendRequest.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [
          { senderId: currentUser.id, receiverId: friend.id },
          { senderId: friend.id, receiverId: currentUser.id }
        ]
      }
    });

    if (!acceptedFriendship) {
      return res.status(403).json({ error: "Only accepted friends can open a joint timeline" });
    }

    const timelinePosts = await prisma.post.findMany({
      where: {
        OR: [
          { authorId: currentUser.id, recipientId: friend.id },
          { authorId: friend.id, recipientId: currentUser.id }
        ]
      },
      orderBy: { createdAt: "asc" },
      include: { author: true, recipient: true }
    });

    return res.status(200).json(timelinePosts);
  } catch (error) {
    console.error("Joint timeline retrieval failed:", error);
    return res.status(500).json({ error: "Could not fetch joint timeline", details: error.message });
  }
});

app.post("/api/feeds/post", async (req, res) => {
  const {
    userEmail,
    currentFriendId,
    friendId,
    imageUrls = [],
    caption,
    location,
    latitude,
    longitude
  } = req.body;

  try {
    const targetFriendId = Number(currentFriendId || friendId);
    const normalizedImages = Array.isArray(imageUrls) ? imageUrls.filter(Boolean) : [];

    if (!userEmail || !targetFriendId || normalizedImages.length === 0) {
      return res.status(400).json({ error: "User email, friend id, and at least one image are required" });
    }

    const currentUser = await prisma.user.findUnique({ where: { email: userEmail } });
    const friend = await prisma.user.findUnique({ where: { id: targetFriendId } });

    if (!currentUser || !friend) {
      return res.status(404).json({ error: "Timeline participants could not be found" });
    }

    const acceptedFriendship = await prisma.friendRequest.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [
          { senderId: currentUser.id, receiverId: friend.id },
          { senderId: friend.id, receiverId: currentUser.id }
        ]
      }
    });

    if (!acceptedFriendship) {
      return res.status(403).json({ error: "Only accepted friends can add to a joint timeline" });
    }

    const batchTimestamp = new Date();
    const createdPosts = await prisma.$transaction(
      normalizedImages.map(imageUrl => prisma.post.create({
        data: {
          imageUrl,
          caption: caption || "Shared timeline memory",
          location: location || "Shared Timeline",
          latitude: latitude ?? null,
          longitude: longitude ?? null,
          createdAt: batchTimestamp,
          authorId: currentUser.id,
          recipientId: friend.id
        },
        include: { author: true, recipient: true }
      }))
    );

    return res.status(201).json({
      success: true,
      count: createdPosts.length,
      posts: createdPosts
    });
  } catch (error) {
    console.error("Joint timeline upload failed:", error);
    return res.status(500).json({ error: "Could not add photos to joint timeline", details: error.message });
  }
});

app.get("/api/feeds/map-milestones", async (req, res) => {
  const { userEmail } = req.query;
  console.log(`Loading map milestone records for user: ${userEmail}`);

  try {
    if (!userEmail) {
      return res.status(400).json({ error: "User email query parameter is required" });
    }

    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
      return res.status(404).json({ error: "User profile could not be found" });
    }

    const milestonePosts = await prisma.post.findMany({
      where: {
        recipientId: user.id,
        latitude: { not: null },
        longitude: { not: null }
      },
      orderBy: {
        createdAt: "desc"
      },
      include: {
        author: true
      }
    });

    return res.status(200).json(milestonePosts);
  } catch (error) {
    console.error("Map milestone extraction failed:", error);
    return res.status(500).json({ error: "Could not fetch map milestone records", details: error.message });
  }
});

app.get("/api/friends/dashboard", async (req, res) => {
  const { email } = req.query;
  console.log(`Compiling dashboard views and contextual data for account: ${email}`);

  try {
    if (!email) {
      return res.status(400).json({ error: "Host profile target specification email query parameter is required" });
    }

    const currentUser = await prisma.user.findUnique({ where: { email: email } });
    if (!currentUser) {
      return res.status(404).json({ error: "Ecosystem platform entity lookup validation parameter missing" });
    }

    console.log(`Extracting outbound requests from user sequence row index matching code number: ${currentUser.id}`);
    const outboundPending = await prisma.friendRequest.findMany({
      where: { 
        senderId: currentUser.id, 
        status: "PENDING" 
      },
      include: { 
        receiver: true 
      }
    });

    console.log(`Extracting inbound requests from user sequence row index matching code number: ${currentUser.id}`);
    const inboundPending = await prisma.friendRequest.findMany({
      where: { 
        receiverId: currentUser.id, 
        status: "PENDING" 
      },
      include: { 
        sender: true 
      }
    });

    console.log("Fetching matching verification rows tracking confirmed connection statuses...");
    const establishedConnections = await prisma.friendRequest.findMany({
      where: {
        OR: [
          { senderId: currentUser.id }, 
          { receiverId: currentUser.id }
        ],
        status: "ACCEPTED"
      },
      include: { 
        sender: true, 
        receiver: true 
      }
    });

    console.log("Formatting structural records array to filter identities out from relationship lines...");
    const rawFriendsList = establishedConnections.map(relationRow => 
      relationRow.senderId === currentUser.id ? relationRow.receiver : relationRow.sender
    );

    console.log("Processing Spherical Cosine calculations to determine friend tracking metrics in miles...");
    const processedFriends = rawFriendsList.map(friendNode => {
      let relativeDistanceMiles = null;
      
      if (currentUser.latitude && currentUser.longitude && friendNode.latitude && friendNode.longitude) {
        const meanEarthRadiusMiles = 3958.8; 
        const radLatDelta = (friendNode.latitude - currentUser.latitude) * Math.PI / 180;
        const radLonDelta = (friendNode.longitude - currentUser.longitude) * Math.PI / 180;
        
        const expressionStepA = 
          Math.sin(radLatDelta / 2) * Math.sin(radLatDelta / 2) +
          Math.cos(currentUser.latitude * Math.PI / 180) * Math.cos(friendNode.latitude * Math.PI / 180) *
          Math.sin(radLonDelta / 2) * Math.sin(radLonDelta / 2);
          
        const expressionStepC = 2 * Math.atan2(Math.sqrt(expressionStepA), Math.sqrt(1 - expressionStepA));
        relativeDistanceMiles = meanEarthRadiusMiles * expressionStepC;
      }
      
      return {
        id: friendNode.id,
        name: friendNode.name,
        email: friendNode.email,
        avatar: friendNode.picture || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(friendNode.name || 'User')}`, 
        distanceMiles: relativeDistanceMiles
      };
    }).sort((alpha, beta) => {
      if (alpha.distanceMiles === null) return 1;
      if (beta.distanceMiles === null) return -1;
      return alpha.distanceMiles - beta.distanceMiles;
    }); 

    console.log("Pulling social memories feeding active dynamic dashboards layout updates...");
    const actualMemoriesRecords = await prisma.post.findMany({
      where: { 
        recipientId: currentUser.id 
      },
      orderBy: { 
        createdAt: "desc" 
      },
      take: 15,
      include: { 
        author: true 
      }
    });

    const formattedDashboardMemories = actualMemoriesRecords.map(dataRow => ({
      id: dataRow.id,
      title: dataRow.caption || "Shared Photographic Memory Link", 
      image: dataRow.imageUrl, 
      timeAgo: dataRow.createdAt ? new Date(dataRow.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      }) : "Just Now", 
      locationName: dataRow.location || "Adjacent Coordinates Zone",
      authorProfile: {
        id: dataRow.author.id,
        name: dataRow.author.name,
        picture: dataRow.author.picture
      }
    }));

    console.log("Data packet preparation finished cleanly. Dispatching state payload directly back to client interface.");
    const outboundRequests = outboundPending.map(r => ({ id: r.id, receiver: r.receiver }));
    const inboundRequests = inboundPending.map(r => ({ id: r.id, sender: r.sender }));

    return res.status(200).json({
      name: currentUser.name,
      email: currentUser.email,
      picture: currentUser.picture,
      outboundRequests,
      inboundRequests,
      outgoingRequests: outboundRequests,
      incomingRequests: inboundRequests,
      friends: processedFriends, 
      memories: formattedDashboardMemories
    });

  } catch (error) {
    console.error("Critical structural failure during dashboard compilation process:", error);
    return res.status(500).json({ error: "Internal aggregator subsystem failure compiling dashboard assets", details: error.message });
  }
});

/* ==========================================================================
   🎧 ERROR OVERRIDE CATCH ALL AND SYSTEM PORT INITIALIZATION LAYER
   ========================================================================== */
app.get(/^\/(?!api\/).*/, (req, res, next) => {
  if (!req.accepts("html")) {
    return next();
  }

  return res.sendFile(path.join(frontendDistPath, "index.html"), (error) => {
    if (error) {
      next();
    }
  });
});

app.use((req, res, next) => {
  res.status(404).json({
    error: "Route Not Found",
    message: "The requested path does not map to an active endpoint structural interface.",
    path: req.originalUrl
  });
});

app.use((err, req, res, next) => {
  console.error("🔴 Unhandled Global Application Exception Error Stack:", err);
  res.status(500).json({
    error: "Internal Server Error Triggered",
    message: err.message || "An unhandled execution logic crash occurred on the server.",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;
const serverInstance = app.listen(PORT, () => {
  console.log("\n====================================================================");
  console.log(`🚀 PHOTOTIMELINE INTEGRATED API SYSTEM ENGINE STARTED`);
  console.log(`🔗 Local Address Loopback Interface: http://localhost:${PORT}`);
  console.log(`📦 Prisma Core Engine Model Client Matrix Connected Successfully`);
  console.log("====================================================================\n");
});

process.on("SIGTERM", () => {
  console.log("SIGTERM system signal interception caught. Shutting down application channels...");
  serverInstance.close(() => {
    prisma.$disconnect();
    console.log("Ecosystem database connections severed safely. Server framework offline.");
  });
});
