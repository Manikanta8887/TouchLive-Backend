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
import updateUserProfile from "./Controllers/bioUpdate.js";

const app = express();
const server = createServer(app);

const PORT = 5000;
const ENABLE_COOP = false;
const ALLOWED_ORIGINS = [
  "https://full-stack-project-mani.vercel.app",
  "https://full-stack-project-rho.vercel.app",
  "https://global.xirsys.net",
  "http://localhost:5000",
  "http://localhost:3000",
  "http://localhost:5173"
];

const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST","DELETE", "PUT"],
    credentials: true,
  },
});

connectDB();
app.use(express.json());
app.use(cors({ origin: ALLOWED_ORIGINS, methods: ["GET", "POST", "DELETE", "PUT"], credentials: true }));

app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/streams", streamRoutes);
app.use("/api/videos", videoRoutes);
app.put("/api/users/:uid", updateUserProfile);

let liveStreams = {};
let streamerSocketMap = {};

io.on("connection", (socket) => {
  console.log(`✅ [Socket Connected] ID: ${socket.id}`);

  socket.on("get-streams", async () => {
    console.log(`📡 [Get Streams] Requested by ${socket.id}`);
    const pastStreams = await getEndedStreams();
    socket.emit("stream-list", {
      liveStreams: Object.values(liveStreams),
      pastStreams,
    });
  });

  socket.on("get-stream-info", ({ streamId }) => {
    console.log(`ℹ️ [Stream Info] ${socket.id} requested info for stream ${streamId}`);
    socket.emit("stream-info", liveStreams[streamId] || null);
  });

  socket.on("join-stream", ({ streamId }) => {
    console.log(`👀 [Join Stream] ${socket.id} joined stream ${streamId}`);
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
    console.log(`👋 [Leave Stream] ${socket.id} left stream ${streamId}`);
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

  socket.on("start-stream", (data, ack) => {
    console.log(`🎥 [Start Stream] Stream started by ${socket.id}`, data);
    const { streamTitle, streamerId, streamerName, profilePic } = data;
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
    if (typeof ack === "function") ack();
  });

  socket.on("offer", ({ streamId, offer }) => {
    console.log(`📤 [WebRTC Offer] From ${socket.id} for stream ${streamId}`);
    socket.to(streamId).emit("offer", { offer, from: socket.id });
  });

  socket.on("answer", ({ streamId, answer }) => {
    console.log(`📥 [WebRTC Answer] From ${socket.id} for stream ${streamId}`);
    socket.to(streamId).emit("answer", { answer, from: socket.id });
  });

  socket.on("ice-candidate", ({ streamId, candidate }) => {
    console.log(`❄️ [ICE Candidate] From ${socket.id} for stream ${streamId}`);
    socket.to(streamId).emit("ice-candidate", { candidate, from: socket.id });
  });

  socket.on("chat-message", (chatData) => {
    const streamId = chatData.streamId || socket.data.currentStreamId;
    console.log(`💬 [Chat Message] in stream ${streamId} from ${chatData.username}: ${chatData.message}`);
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
    console.log(`🖥️ [Toggle Fullscreen] Stream ${streamId} set to fullscreen: ${isFullscreen}`);
    if (liveStreams[streamId]) {
      liveStreams[streamId].isFullscreen = isFullscreen;
      io.to(streamId).emit("update-streams", Object.values(liveStreams));
    }
  });

  socket.on("rejoin-stream", ({ streamerId }) => {
    console.log(`🔁 [Rejoin Stream] ${socket.id} rejoining stream ${streamerId}`);
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
      console.log(`🛑 [Stop Stream] ${socket.id} ended stream ${streamerId}`);
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
    console.log(`❌ [Socket Disconnected] ID: ${socket.id}`);

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
          console.log(`⚰️ [Cleanup] Streamer ${streamerId} fully disconnected. Ending stream.`);
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
  });
});

server.listen(PORT, () => console.log(` Server running on port ${PORT}`));
