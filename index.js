// server.js
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./Config/Mongoose.js";
import userRoutes from "./Routes/userRoutes.js";
import profileRoutes from "./Routes/profileRoutes.js";
import streamRoutes from "./Routes/streamRoutes.js";
import { saveEndedStream, getEndedStreams } from "./Controllers/streamController.js";
import videoRoutes   from "./Routes/videoRoutes.js";

const app = express();
const server = createServer(app);

// ✅ Inline Environment Configurations
const PORT = 5000;
const ENABLE_COOP = false;
const ALLOWED_ORIGINS = [
  "https://full-stack-project-mani.vercel.app",
  "https://full-stack-project-rho.vercel.app",
  "http://localhost:5000",
];

// ✅ Optional COOP/COEP Headers
if (ENABLE_COOP) {
  app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    next();
  });
}

const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

connectDB();
app.use(express.json());
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));

app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/streams", streamRoutes);
app.use("/api/videos", videoRoutes);

let liveStreams = {};
let streamerSocketMap = {};

io.on("connection", (socket) => {
  console.log(`✅ Socket connected: ${socket.id}`);

  socket.on("get-streams", async () => {
    const pastStreams = await getEndedStreams();
    socket.emit("stream-list", {
      liveStreams: Object.values(liveStreams),
      pastStreams,
    });
  });

  socket.on("get-stream-info", ({ streamId }) => {
    socket.emit("stream-info", liveStreams[streamId] || null);
  });

  socket.on("join-stream", ({ streamId }) => {
    socket.join(streamId);
    socket.data.currentStreamId = streamId;

    if (liveStreams[streamId]) {
      liveStreams[streamId].viewers = (liveStreams[streamId].viewers || 0) + 1;

      const streamerSocketId = streamerSocketMap[streamId];
      if (streamerSocketId) {
        io.to(streamerSocketId).emit("viewer-count", {
          streamId,
          count: liveStreams[streamId].viewers,
        });
      }

      io.to(streamId).emit("update-streams", Object.values(liveStreams));
    }
  });

  socket.on("leave-stream", ({ streamId }) => {
    socket.leave(streamId);
    if (liveStreams[streamId]) {
      liveStreams[streamId].viewers = Math.max((liveStreams[streamId].viewers || 1) - 1, 0);
      io.to(streamId).emit("viewer-count", {
        streamId,
        count: liveStreams[streamId].viewers,
      });
      io.to(streamId).emit("update-streams", Object.values(liveStreams));
    }
  });

  socket.on("start-stream", ({ streamTitle, streamerId, streamerName, profilePic }) => {
    const id = streamerId || socket.id;
    const newStream = {
      id,
      streamerId: id,
      streamerName,
      profilePic,
      streamTitle,
      streamLink: id,
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

  // --- Updated Signaling Events (Option B) ---

  socket.on("offer", ({ streamId, offer }) => {
    // Broadcast offer to everyone in the room except the sender.
    socket.to(streamId).emit("offer", { offer, from: socket.id });
  });

  socket.on("answer", ({ streamId, answer }) => {
    // Broadcast answer to everyone in the room except the sender.
    socket.to(streamId).emit("answer", { answer, from: socket.id });
  });

  socket.on("ice-candidate", ({ streamId, candidate }) => {
    // Broadcast ICE candidate to everyone in the room.
    socket.to(streamId).emit("ice-candidate", { candidate, from: socket.id });
  });

  // --- End of Updated Signaling Events ---

  socket.on("chat-message", (chatData) => {
    const streamId = chatData.streamId || socket.data.currentStreamId;
    if (streamId && liveStreams[streamId]) {
      liveStreams[streamId].chatMessages.push({
        sender: chatData.username,
        message: chatData.message,
        timestamp: new Date(),
      });
      io.to(streamId).emit("chat-message", { ...chatData, streamId });
    }
  });

  socket.on("toggle-fullscreen", ({ streamId, isFullscreen }) => {
    if (liveStreams[streamId]) {
      liveStreams[streamId].isFullscreen = isFullscreen;
      io.to(streamId).emit("update-streams", Object.values(liveStreams));
    }
  });

  socket.on("rejoin-stream", ({ streamerId }) => {
    const stream = liveStreams[streamerId];
    if (stream) {
      socket.join(streamerId);
      socket.data.streamerId = streamerId;
      streamerSocketMap[streamerId] = socket.id;
      socket.emit("stream-info", stream);
    }
  });

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

  socket.on("disconnect", async () => {
    const currentStreamId = socket.data.currentStreamId;
    if (currentStreamId && liveStreams[currentStreamId]) {
      liveStreams[currentStreamId].viewers = Math.max((liveStreams[currentStreamId].viewers || 1) - 1, 0);
      io.to(currentStreamId).emit("viewer-count", {
        streamId: currentStreamId,
        count: liveStreams[currentStreamId].viewers,
      });
      io.to(currentStreamId).emit("update-streams", Object.values(liveStreams));
    }

    const streamerId = socket.data.streamerId;
    if (streamerId && liveStreams[streamerId]) {
      setTimeout(async () => {
        const stillStreaming = [...io.sockets.sockets.values()].some(
          (s) => s.data.streamerId === streamerId
        );
        if (!stillStreaming) {
          const endedStream = liveStreams[streamerId];
          endedStream.endTime = new Date();
          await saveEndedStream(endedStream);
          delete liveStreams[streamerId];
          delete streamerSocketMap[streamerId];
          io.emit("update-streams", Object.values(liveStreams));
          io.to(streamerId).emit("stream-ended");
        }
      }, 5000);
    }

    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
