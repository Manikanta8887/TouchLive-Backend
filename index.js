// import dotenv from "dotenv";
// import express from "express";
// import cors from "cors";
// import { createServer } from "http";
// import { Server } from "socket.io";
// import connectDB from "./Config/Mongoose.js";
// import userRoutes from "./Routes/userRoutes.js";
// import profileRoutes from "./Routes/profileRoutes.js";
// import streamRoutes from "./Routes/streamRoutes.js";
// import { saveEndedStream } from "./Controllers/streamController.js"; 

// dotenv.config();
// const app = express();
// const server = createServer(app);
// const io = new Server(server, {
//   cors: { origin: "*", methods: ["GET", "POST"] },
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

// io.on("connection", (socket) => {
//   console.log(`User connected: ${socket.id}`);


//   socket.on("start-stream", ({ streamTitle, streamerId }) => {
//     liveStreams[socket.id] = { 
//       id: socket.id,
//       streamTitle, 
//       chatMessages: [],
//       startTime: new Date(),
//       streamerId: streamerId || socket.id 
//     };
//     io.emit("update-streams", Object.values(liveStreams));
//   });

  
//   socket.on("chat-message", ({ message, user }) => {
//     if (liveStreams[socket.id]) {
//       liveStreams[socket.id].chatMessages.push({ user, message, timestamp: new Date() });
//     }
//     io.emit("chat-message", { user, message });
//   });

  
//   socket.on("stop-stream", () => {
//     if (liveStreams[socket.id]) {
//       saveEndedStream(liveStreams[socket.id]); 
//       delete liveStreams[socket.id];
//       io.emit("update-streams", Object.values(liveStreams));
//     }
//   });

  
//   socket.on("disconnect", () => {
//     if (liveStreams[socket.id]) {
//       saveEndedStream(liveStreams[socket.id]);
//       delete liveStreams[socket.id];
//       io.emit("update-streams", Object.values(liveStreams));
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
import { saveEndedStream } from "./Controllers/streamController.js";

dotenv.config();
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
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

let liveStreams = {};

// Socket.io Connection for Live Streaming, WebRTC Signaling, & Chat
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // When a client requests the current stream list:
  socket.on("get-streams", () => {
    socket.emit("stream-list", {
      liveStreams: Object.values(liveStreams),
      pastStreams: [], // Past streams can be fetched via REST API endpoints if needed
    });
  });

  // When a stream starts, register it with stream details.
  socket.on("start-stream", ({ streamTitle, streamerId }) => {
    liveStreams[socket.id] = {
      id: socket.id,
      streamerId: streamerId || socket.id,
      streamTitle,
      streamLink: `/livestreamingplatform/stream/${socket.id}`, // Useful for redirection
      chatMessages: [],
      startTime: new Date(),
      isFullscreen: false, // For fullscreen toggle
    };
    io.emit("update-streams", Object.values(liveStreams));
  });

  // WebRTC Signaling Events (offer, answer, ICE candidates)
  socket.on("offer", (offerData) => {
    socket.broadcast.emit("offer", offerData);
  });
  socket.on("answer", (answerData) => {
    socket.broadcast.emit("answer", answerData);
  });
  socket.on("ice-candidate", (candidateData) => {
    socket.broadcast.emit("ice-candidate", candidateData);
  });

  // Toggle fullscreen mode for a specific stream (if needed)
  socket.on("toggle-fullscreen", ({ streamId, isFullscreen }) => {
    if (liveStreams[streamId]) {
      liveStreams[streamId].isFullscreen = isFullscreen;
      io.emit("update-streams", Object.values(liveStreams));
    }
  });

  // When a chat message is sent, expect a full chat object.
  // The chatData object should include: streamId, username, message, etc.
  socket.on("chat-message", (chatData) => {
    // Use the streamId from the chatData to update the correct stream's chat.
    if (liveStreams[chatData.streamId]) {
      liveStreams[chatData.streamId].chatMessages.push({
        sender: chatData.username,
        message: chatData.message,
        timestamp: new Date(),
      });
    }
    io.emit("chat-message", chatData);
  });

  // When a stream stops, save the finished stream and remove it from active streams.
  socket.on("stop-stream", () => {
    if (liveStreams[socket.id]) {
      saveEndedStream(liveStreams[socket.id]);
      delete liveStreams[socket.id];
      io.emit("update-streams", Object.values(liveStreams));
    }
  });

  // Handle disconnect: if a streamer disconnects, treat it as a stream end.
  socket.on("disconnect", () => {
    if (liveStreams[socket.id]) {
      saveEndedStream(liveStreams[socket.id]);
      delete liveStreams[socket.id];
      io.emit("update-streams", Object.values(liveStreams));
    }
  });
});

server.listen(5000, () => console.log("🚀 Server running on port 5000"));
