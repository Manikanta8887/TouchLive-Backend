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
//       "https://full-stack-project-rho.vercel.app",
//       "http://localhost:5000",
//     ],
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// connectDB();

// app.use(express.json());
// app.use(
//   cors({
//     origin: [
//       "https://full-stack-project-mani.vercel.app",
//       "https://full-stack-project-rho.vercel.app",
//       "http://localhost:5000",
//     ],
//     credentials: true,
//     methods: "GET, POST, PUT, DELETE",
//     allowedHeaders: "Content-Type, Authorization",
//   })
// );

// app.use("/api/users", userRoutes);
// app.use("/api/profile", profileRoutes);
// app.use("/api/streams", streamRoutes);

// let liveStreams = {};
// let streamerSocketMap = {};

// io.on("connection", (socket) => {
//   console.log(`✅ Socket connected: ${socket.id}`);

//   socket.on("get-streams", async () => {
//     const pastStreams = await getEndedStreams();
//     socket.emit("stream-list", {
//       liveStreams: Object.values(liveStreams),
//       pastStreams,
//     });
//   });

//   socket.on("get-stream-info", ({ streamId }) => {
//     socket.emit("stream-info", liveStreams[streamId] || null);
//   });

//   socket.on("join-stream", ({ streamId }) => {
//     socket.join(streamId);
//     socket.data.currentStreamId = streamId;

//     if (liveStreams[streamId]) {
//       liveStreams[streamId].viewers = (liveStreams[streamId].viewers || 0) + 1;
//       io.emit("update-streams", Object.values(liveStreams));

//       const streamerSocketId = streamerSocketMap[streamId];
//       if (streamerSocketId) {
//         io.to(streamerSocketId).emit("viewer-count", {
//           streamId,
//           count: liveStreams[streamId].viewers,
//         });
//       }
//     }
//   });

//   socket.on("start-stream", ({ streamTitle, streamerId, streamerName, profilePic }) => {
//     const id = streamerId || socket.id;
//     const newStream = {
//       id,
//       streamerId: id,
//       streamerName,
//       profilePic,
//       streamTitle,
//       streamLink: `/livestreamingplatform/watch/${id}`,
//       chatMessages: [],
//       startTime: new Date(),
//       isFullscreen: false,
//       viewers: 0,
//     };
//     liveStreams[id] = newStream;
//     socket.data.streamerId = id;
//     streamerSocketMap[id] = socket.id;
//     socket.join(id);
//     io.emit("update-streams", Object.values(liveStreams));
//     socket.emit("start-stream", newStream);
//   });

//   socket.on("offer", ({ streamId, offer }) => {
//     socket.to(streamId).emit("offer", { offer });
//   });

//   socket.on("answer", ({ streamId, answer }) => {
//     socket.to(streamId).emit("answer", { answer });
//   });

//   socket.on("ice-candidate", ({ streamId, candidate }) => {
//     socket.to(streamId).emit("ice-candidate", { candidate });
//   });

//   socket.on("chat-message", (chatData) => {
//     let streamId =
//       chatData.streamId ||
//       socket.data.currentStreamId ||
//       Array.from(socket.rooms).find((room) => room !== socket.id);

//     if (streamId && liveStreams[streamId]) {
//       liveStreams[streamId].chatMessages.push({
//         sender: chatData.username,
//         message: chatData.message,
//         timestamp: new Date(),
//       });
//       io.to(streamId).emit("chat-message", { ...chatData, streamId });
//     }
//   });

//   socket.on("toggle-fullscreen", ({ streamId, isFullscreen }) => {
//     if (liveStreams[streamId]) {
//       liveStreams[streamId].isFullscreen = isFullscreen;
//       io.emit("update-streams", Object.values(liveStreams));
//     }
//   });

//   socket.on("rejoin-stream", ({ streamerId }) => {
//     const stream = liveStreams[streamerId];
//     if (stream) {
//       socket.join(streamerId);
//       socket.data.streamerId = streamerId;
//       streamerSocketMap[streamerId] = socket.id;
//       socket.emit("stream-info", stream);
//     }
//   });

//   socket.on("stop-stream", async () => {
//     const streamerId = socket.data.streamerId;
//     if (streamerId && liveStreams[streamerId]) {
//       const endedStream = liveStreams[streamerId];
//       endedStream.endTime = new Date();
//       await saveEndedStream(endedStream);
//       delete liveStreams[streamerId];
//       delete streamerSocketMap[streamerId];
//       io.emit("update-streams", Object.values(liveStreams));
//       io.emit("stop-stream", endedStream);
//     }
//   });

//   socket.on("disconnect", async () => {
//     const currentStreamId = socket.data.currentStreamId;
//     if (currentStreamId && liveStreams[currentStreamId]) {
//       liveStreams[currentStreamId].viewers = Math.max((liveStreams[currentStreamId].viewers || 1) - 1, 0);
//       io.emit("update-streams", Object.values(liveStreams));

//       const streamerSocketId = streamerSocketMap[currentStreamId];
//       if (streamerSocketId) {
//         io.to(streamerSocketId).emit("viewer-count", {
//           streamId: currentStreamId,
//           count: liveStreams[currentStreamId].viewers,
//         });
//       }
//     }

//     const streamerId = socket.data.streamerId;
//     if (streamerId && liveStreams[streamerId]) {
//       setTimeout(async () => {
//         const stillStreaming = Object.values(io.sockets.sockets).some(
//           (s) => s.data.streamerId === streamerId
//         );

//         if (!stillStreaming && liveStreams[streamerId]) {
//           const endedStream = liveStreams[streamerId];
//           endedStream.endTime = new Date();
//           await saveEndedStream(endedStream);
//           delete liveStreams[streamerId];
//           delete streamerSocketMap[streamerId];
//           io.emit("update-streams", Object.values(liveStreams));
//           io.emit("stop-stream", endedStream);

//           io.to(streamerId).emit("stream-ended");
//         }
//       }, 5000);
//     }

//     console.log(`❌ Socket disconnected: ${socket.id}`);
//   });
// });

// // server.listen(5000, () => console.log("🚀 Server running on port 5000"));

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


// index.js
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

// --- COOP Header Middleware to address "window.closed" warnings ---
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin"),
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "https://full-stack-project-mani.vercel.app",
      "https://full-stack-project-rho.vercel.app",
      "http://localhost:5000",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

connectDB();

app.use(express.json());
app.use(
  cors({
    origin: [
      "https://full-stack-project-mani.vercel.app",
      "https://full-stack-project-rho.vercel.app",
      "http://localhost:5000",
    ],
    credentials: true,
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: "Content-Type, Authorization",
  })
);

app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/streams", streamRoutes);

// In-memory storage for active live streams and streamer's socket mapping
let liveStreams = {}; // Keyed by streamerId (or chosen stream id)
let streamerSocketMap = {}; // Map from streamerId to their current socket.id

io.on("connection", (socket) => {
  console.log(`✅ Socket connected: ${socket.id}`);

  // When a client requests the stream lists
  socket.on("get-streams", async () => {
    const pastStreams = await getEndedStreams();
    socket.emit("stream-list", {
      liveStreams: Object.values(liveStreams),
      pastStreams,
    });
  });

  // Client requests info about a particular stream by its id
  socket.on("get-stream-info", ({ streamId }) => {
    socket.emit("stream-info", liveStreams[streamId] || null);
  });

  // When a viewer joins a stream
  socket.on("join-stream", ({ streamId }) => {
    socket.join(streamId);
    socket.data.currentStreamId = streamId;

    if (liveStreams[streamId]) {
      // Increase viewer count
      liveStreams[streamId].viewers = (liveStreams[streamId].viewers || 0) + 1;
      // Broadcast updated streams info
      io.emit("update-streams", Object.values(liveStreams));
      // Also notify the streamer of the new viewer count
      const streamerSocketId = streamerSocketMap[streamId];
      if (streamerSocketId) {
        io.to(streamerSocketId).emit("viewer-count", {
          streamId,
          count: liveStreams[streamId].viewers,
        });
      }
    }
  });

  // Optional: When a viewer leaves (if you implement an explicit leave mechanism)
  socket.on("leave-stream", ({ streamId }) => {
    socket.leave(streamId);
    if (liveStreams[streamId]) {
      liveStreams[streamId].viewers = Math.max((liveStreams[streamId].viewers || 1) - 1, 0);
      io.to(streamId).emit("viewer-count", {
        streamId,
        count: liveStreams[streamId].viewers,
      });
      io.emit("update-streams", Object.values(liveStreams));
    }
  });

  // When a streamer starts streaming
  socket.on("start-stream", ({ streamTitle, streamerId, streamerName, profilePic }) => {
    const id = streamerId || socket.id;
    const newStream = {
      id,
      streamerId: id,
      streamerName,
      profilePic,
      streamTitle,
      streamLink: `/livestreamingplatform/watch/${id}`,
      chatMessages: [],
      startTime: new Date(),
      isFullscreen: false,
      viewers: 0,
    };
    liveStreams[id] = newStream;
    socket.data.streamerId = id;
    streamerSocketMap[id] = socket.id;
    socket.join(id);
    io.emit("update-streams", Object.values(liveStreams));
    socket.emit("start-stream", newStream);
  });

  // WebRTC signaling: relay offer from streamer to viewers, answer from viewer to streamer, and ICE candidates.
  socket.on("offer", ({ streamId, offer }) => {
    socket.to(streamId).emit("offer", { offer });
  });

  socket.on("answer", ({ streamId, answer }) => {
    socket.to(streamId).emit("answer", { answer });
  });

  socket.on("ice-candidate", ({ streamId, candidate }) => {
    socket.to(streamId).emit("ice-candidate", { candidate });
  });

  // Chat messages within a stream
  socket.on("chat-message", (chatData) => {
    let streamId = 
      chatData.streamId || 
      socket.data.currentStreamId || 
      Array.from(socket.rooms).find((room) => room !== socket.id);
    if (streamId && liveStreams[streamId]) {
      liveStreams[streamId].chatMessages.push({
        sender: chatData.username,
        message: chatData.message,
        timestamp: new Date(),
      });
      io.to(streamId).emit("chat-message", { ...chatData, streamId });
    }
  });

  // Toggle fullscreen signal (broadcast)
  socket.on("toggle-fullscreen", ({ streamId, isFullscreen }) => {
    if (liveStreams[streamId]) {
      liveStreams[streamId].isFullscreen = isFullscreen;
      io.emit("update-streams", Object.values(liveStreams));
    }
  });

  // Rejoin-stream event allows a streamer to rejoin after a refresh
  socket.on("rejoin-stream", ({ streamerId }) => {
    const stream = liveStreams[streamerId];
    if (stream) {
      socket.join(streamerId);
      socket.data.streamerId = streamerId;
      streamerSocketMap[streamerId] = socket.id;
      socket.emit("stream-info", stream);
    }
  });

  // When the streamer stops streaming intentionally
  socket.on("stop-stream", async () => {
    const streamerId = socket.data.streamerId;
    if (streamerId && liveStreams[streamerId]) {
      const endedStream = liveStreams[streamerId];
      endedStream.endTime = new Date();
      await saveEndedStream(endedStream);
      delete liveStreams[streamerId];
      delete streamerSocketMap[streamerId];
      io.emit("update-streams", Object.values(liveStreams));
      io.emit("stop-stream", endedStream);
    }
  });

  // Handle disconnect events
  socket.on("disconnect", async () => {
    // If a viewer disconnects, update viewer count
    const currentStreamId = socket.data.currentStreamId;
    if (currentStreamId && liveStreams[currentStreamId]) {
      liveStreams[currentStreamId].viewers = Math.max((liveStreams[currentStreamId].viewers || 1) - 1, 0);
      io.emit("update-streams", Object.values(liveStreams));
      const streamerSocketId = streamerSocketMap[currentStreamId];
      if (streamerSocketId) {
        io.to(streamerSocketId).emit("viewer-count", {
          streamId: currentStreamId,
          count: liveStreams[currentStreamId].viewers,
        });
      }
    }
    // If a streamer disconnects, delay stopping the stream (allowing rejoin within 5 sec)
    const streamerId = socket.data.streamerId;
    if (streamerId && liveStreams[streamerId]) {
      setTimeout(async () => {
        const stillStreaming = Object.values(io.sockets.sockets).some(
          (s) => s.data.streamerId === streamerId
        );
        if (!stillStreaming && liveStreams[streamerId]) {
          const endedStream = liveStreams[streamerId];
          endedStream.endTime = new Date();
          await saveEndedStream(endedStream);
          delete liveStreams[streamerId];
          delete streamerSocketMap[streamerId];
          io.emit("update-streams", Object.values(liveStreams));
          io.emit("stop-stream", endedStream);
          io.to(streamerId).emit("stream-ended");
        }
      }, 5000);
    }
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
