// import dotenv from "dotenv";
// import express from "express";
// import cors from "cors";
// import { createServer } from "http";
// import { Server } from "socket.io";
// import connectDB from "./Config/Mongoose.js";
// import userRoutes from "./Routes/userRoutes.js";
// import profileRoutes from "./Routes/profileRoutes.js";
// import streamRoutes from "./Routes/streamRoutes.js";
// import { saveEndedStream, getEndedStreams } from "./Controllers/streamController.js";

// dotenv.config();
// const app = express();
// const server = createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: [
//       "https://full-stack-project-mani.vercel.app",
//       "https://full-stack-project-rho.vercel.app/",
//       "http://localhost:5000",
//     ],
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// // Connect to MongoDB
// connectDB();

// app.use(express.json());
// app.use(
//   cors({
//     origin: [
//       "https://full-stack-project-mani.vercel.app",
//       "https://full-stack-project-rho.vercel.app/",
//       "http://localhost:5000",
//     ],
//     credentials: true,
//     methods: "GET, POST, PUT, DELETE",
//     allowedHeaders: "Content-Type, Authorization",
//   })
// );

// // API Routes
// app.use("/api/users", userRoutes);
// app.use("/api/profile", profileRoutes);
// app.use("/api/streams", streamRoutes);

// let liveStreams = {};

// // Socket.io Connection for Live Streaming, WebRTC Signaling, & Chat
// io.on("connection", (socket) => {
//   console.log(`User connected: ${socket.id}`);

//   // When a client requests the current stream lists:
//   socket.on("get-streams", async () => {
//     const pastStreams = await getEndedStreams();
//     socket.emit("stream-list", {
//       liveStreams: Object.values(liveStreams),
//       pastStreams,
//     });
//   });

//   // NEW: When a client requests details for a specific stream:
//   socket.on("get-stream-info", ({ streamId }) => {
//     const stream = liveStreams[streamId];
//     socket.emit("stream-info", stream || null);
//   });

//   // When a stream starts, register it with details and emit an event.
//   socket.on("start-stream", ({ streamTitle, streamerId }) => {
//     const newStream = {
//       id: socket.id,
//       streamerId: streamerId || socket.id,
//       streamTitle,
//       // Update streamLink to point to the viewer page:
//       streamLink: `/livestreamingplatform/watch/${socket.id}`,
//       chatMessages: [],
//       startTime: new Date(),
//       isFullscreen: false, // For fullscreen toggle
//     };
//     liveStreams[socket.id] = newStream;
//     io.emit("update-streams", Object.values(liveStreams));
//     io.emit("start-stream", newStream);
//   });

//   // WebRTC signaling events
//   socket.on("offer", (offerData) => {
//     socket.broadcast.emit("offer", offerData);
//   });
//   socket.on("answer", (answerData) => {
//     socket.broadcast.emit("answer", answerData);
//   });
//   socket.on("ice-candidate", (candidateData) => {
//     socket.broadcast.emit("ice-candidate", candidateData);
//   });

//   // Toggle fullscreen mode for a specific stream
//   socket.on("toggle-fullscreen", ({ streamId, isFullscreen }) => {
//     if (liveStreams[streamId]) {
//       liveStreams[streamId].isFullscreen = isFullscreen;
//       io.emit("update-streams", Object.values(liveStreams));
//     }
//   });

//   // When a chat message is sent, expect a full chat object (with streamId, username, message, etc.)
//   socket.on("chat-message", (chatData) => {
//     if (liveStreams[chatData.streamId]) {
//       liveStreams[chatData.streamId].chatMessages.push({
//         sender: chatData.username,
//         message: chatData.message,
//         timestamp: new Date(),
//       });
//     }
//     io.emit("chat-message", chatData);
//   });

//   // For rejoining stream after tab change
//   socket.on("rejoin-stream", () => {
//     if (liveStreams[socket.id]) {
//       io.emit("update-streams", Object.values(liveStreams));
//     }
//   });

//   // When a stream stops, save it and remove it from active streams.
//   socket.on("stop-stream", async () => {
//     const endedStream = liveStreams[socket.id];
//     if (endedStream) {
//       endedStream.endTime = new Date();
//       await saveEndedStream(endedStream);
//       delete liveStreams[socket.id];
//       io.emit("update-streams", Object.values(liveStreams));
//       io.emit("stop-stream", endedStream);
//     }
//   });

//   // On disconnect, treat as stream end if active.
//   socket.on("disconnect", async () => {
//     const endedStream = liveStreams[socket.id];
//     if (endedStream) {
//       endedStream.endTime = new Date();
//       await saveEndedStream(endedStream);
//       delete liveStreams[socket.id];
//       io.emit("update-streams", Object.values(liveStreams));
//       io.emit("stop-stream", endedStream);
//     }
//   });
// });

// server.listen(5000, () => console.log("🚀 Server running on port 5000"));

// import dotenv from "dotenv";
// import express from "express";
// import cors from "cors";
// import { createServer } from "http";
// import { Server } from "socket.io";
// import connectDB from "./Config/Mongoose.js";
// import userRoutes from "./Routes/userRoutes.js";
// import profileRoutes from "./Routes/profileRoutes.js";
// import streamRoutes from "./Routes/streamRoutes.js";
// import { saveEndedStream, getEndedStreams } from "./Controllers/streamController.js";

// dotenv.config();
// const app = express();
// const server = createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: [
//       "https://full-stack-project-mani.vercel.app",
//       "https://full-stack-project-rho.vercel.app/",
//       "http://localhost:5000",
//     ],
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// // Connect to MongoDB
// connectDB();

// app.use(express.json());
// app.use(
//   cors({
//     origin: [
//       "https://full-stack-project-mani.vercel.app",
//       "https://full-stack-project-rho.vercel.app/",
//       "http://localhost:5000",
//     ],
//     credentials: true,
//     methods: "GET, POST, PUT, DELETE",
//     allowedHeaders: "Content-Type, Authorization",
//   })
// );

// // API Routes
// app.use("/api/users", userRoutes);
// app.use("/api/profile", profileRoutes);
// app.use("/api/streams", streamRoutes);

// let liveStreams = {}; // Stores active streams

// // Socket.io Connection for WebRTC & Live Streaming
// io.on("connection", (socket) => {
//   console.log(`✅ User connected: ${socket.id}`);

//   // Send updated stream list on request
//   socket.on("get-streams", async () => {
//     const pastStreams = await getEndedStreams();
//     socket.emit("stream-list", {
//       liveStreams: Object.values(liveStreams),
//       pastStreams,
//     });
//   });

//   // Fetch stream details
//   socket.on("get-stream-info", ({ streamId }) => {
//     socket.emit("stream-info", liveStreams[streamId] || null);
//   });

//   // Start a new stream
//   socket.on("start-stream", ({ streamTitle, streamerId }) => {
//     const newStream = {
//       id: socket.id,
//       streamerId: streamerId || socket.id,
//       streamTitle,
//       streamLink: `/livestreamingplatform/watch/${socket.id}`,
//       chatMessages: [],
//       startTime: new Date(),
//       isFullscreen: false,
//     };
//     liveStreams[socket.id] = newStream;
//     io.emit("update-streams", Object.values(liveStreams));
//     socket.emit("start-stream", newStream);
//   });

//   // WebRTC Signaling (Offer, Answer, ICE Candidates)
//   socket.on("offer", ({ streamId, offer }) => {
//     if (liveStreams[streamId]) {
//       io.to(streamId).emit("offer", { offer });
//     }
//   });

//   socket.on("answer", ({ streamId, answer }) => {
//     if (liveStreams[streamId]) {
//       io.to(streamId).emit("answer", { answer });
//     }
//   });

//   socket.on("ice-candidate", ({ streamId, candidate }) => {
//     if (liveStreams[streamId]) {
//       io.to(streamId).emit("ice-candidate", { candidate });
//     }
//   });

//   // Toggle fullscreen for a stream
//   socket.on("toggle-fullscreen", ({ streamId, isFullscreen }) => {
//     if (liveStreams[streamId]) {
//       liveStreams[streamId].isFullscreen = isFullscreen;
//       io.emit("update-streams", Object.values(liveStreams));
//     }
//   });

//   // Handle chat messages
//   socket.on("chat-message", (chatData) => {
//     if (liveStreams[chatData.streamId]) {
//       liveStreams[chatData.streamId].chatMessages.push({
//         sender: chatData.username,
//         message: chatData.message,
//         timestamp: new Date(),
//       });
//     }
//     io.to(chatData.streamId).emit("chat-message", chatData);
//   });

//   // Rejoin a stream after tab change
//   socket.on("rejoin-stream", () => {
//     if (liveStreams[socket.id]) {
//       io.emit("update-streams", Object.values(liveStreams));
//     }
//   });

//   // Stop a stream
//   socket.on("stop-stream", async () => {
//     const endedStream = liveStreams[socket.id];
//     if (endedStream) {
//       endedStream.endTime = new Date();
//       await saveEndedStream(endedStream);
//       delete liveStreams[socket.id];
//       io.emit("update-streams", Object.values(liveStreams));
//       io.emit("stop-stream", endedStream);
//     }
//   });

//   // Handle disconnection (Stop stream if active)
//   socket.on("disconnect", async () => {
//     console.log(`❌ User disconnected: ${socket.id}`);
//     const endedStream = liveStreams[socket.id];
//     if (endedStream) {
//       endedStream.endTime = new Date();
//       await saveEndedStream(endedStream);
//       delete liveStreams[socket.id];
//       io.emit("update-streams", Object.values(liveStreams));
//       io.emit("stop-stream", endedStream);
//     }
//   });
// });

// server.listen(5000, () => console.log("🚀 Server running on port 5000"));


import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./Config/Mongoose.js";
import userRoutes from "./Routes/userRoutes.js";
import profileRoutes from "./Routes/profileRoutes.js";
import streamRoutes from "./Routes/streamRoutes.js";
import { saveEndedStream, getEndedStreams } from "./Controllers/streamController.js";

dotenv.config();
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "https://full-stack-project-mani.vercel.app",
      "https://full-stack-project-rho.vercel.app/",
      "http://localhost:5000",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Connect to MongoDB
connectDB();

app.use(express.json());
app.use(
  cors({
    origin: [
      "https://full-stack-project-mani.vercel.app",
      "https://full-stack-project-rho.vercel.app/",
      "http://localhost:5000",
    ],
    credentials: true,
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: "Content-Type, Authorization",
  })
);

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/streams", streamRoutes);

let liveStreams = {}; // Stores active streams

// Socket.io Connection for WebRTC & Live Streaming
io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // When a client requests the current stream lists:
  socket.on("get-streams", async () => {
    const pastStreams = await getEndedStreams();
    socket.emit("stream-list", {
      liveStreams: Object.values(liveStreams),
      pastStreams,
    });
  });

  // Fetch stream details
  socket.on("get-stream-info", ({ streamId }) => {
    socket.emit("stream-info", liveStreams[streamId] || null);
  });

  // When a stream starts, register it with details and emit an event.
  socket.on("start-stream", ({ streamTitle, streamerId }) => {
    const newStream = {
      id: socket.id,
      streamerId: streamerId || socket.id,
      streamTitle,
      // Updated streamLink to point to the viewer page:
      streamLink: `/livestreamingplatform/watch/${socket.id}`,
      chatMessages: [],
      startTime: new Date(),
      isFullscreen: false, // For fullscreen toggle
    };
    liveStreams[socket.id] = newStream;
    io.emit("update-streams", Object.values(liveStreams));
    socket.emit("start-stream", newStream);
  });

  // WebRTC Signaling (Offer, Answer, ICE Candidates)
  socket.on("offer", ({ streamId, offer }) => {
    if (liveStreams[streamId]) {
      io.to(streamId).emit("offer", { offer });
    }
  });
  socket.on("answer", ({ streamId, answer }) => {
    if (liveStreams[streamId]) {
      io.to(streamId).emit("answer", { answer });
    }
  });
  socket.on("ice-candidate", ({ streamId, candidate }) => {
    if (liveStreams[streamId]) {
      io.to(streamId).emit("ice-candidate", { candidate });
    }
  });

  // Toggle fullscreen mode for a specific stream
  socket.on("toggle-fullscreen", ({ streamId, isFullscreen }) => {
    if (liveStreams[streamId]) {
      liveStreams[streamId].isFullscreen = isFullscreen;
      io.emit("update-streams", Object.values(liveStreams));
    }
  });

  // When a chat message is sent, expect a full chat object (with streamId, username, message, etc.)
  socket.on("chat-message", (chatData) => {
    if (liveStreams[chatData.streamId]) {
      liveStreams[chatData.streamId].chatMessages.push({
        sender: chatData.username,
        message: chatData.message,
        timestamp: new Date(),
      });
    }
    io.to(chatData.streamId).emit("chat-message", chatData);
  });

  // NEW: Rejoin stream event – the client should send their streamerId (Firebase UID)
  socket.on("rejoin-stream", ({ streamerId }) => {
    const streamFound = Object.values(liveStreams).find(
      (s) => s.streamerId === streamerId
    );
    if (streamFound) {
      socket.emit("stream-info", streamFound);
    }
  });

  // When a stream stops, save it and remove it from active streams.
  socket.on("stop-stream", async () => {
    const endedStream = liveStreams[socket.id];
    if (endedStream) {
      endedStream.endTime = new Date();
      await saveEndedStream(endedStream);
      delete liveStreams[socket.id];
      io.emit("update-streams", Object.values(liveStreams));
      io.emit("stop-stream", endedStream);
    }
  });

  // On disconnect, treat as stream end if active.
  socket.on("disconnect", async () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    const endedStream = liveStreams[socket.id];
    if (endedStream) {
      endedStream.endTime = new Date();
      await saveEndedStream(endedStream);
      delete liveStreams[socket.id];
      io.emit("update-streams", Object.values(liveStreams));
      io.emit("stop-stream", endedStream);
    }
  });
});

server.listen(5000, () => console.log("🚀 Server running on port 5000"));
