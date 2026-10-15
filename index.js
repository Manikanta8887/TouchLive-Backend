import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./Config/Mongoose.js";
import userRoutes from "./Routes/userRoutes.js";
import profileRoutes from "./Routes/profileRoutes.js";
import streamRoutes from "./Routes/streamRoutes.js";
import videoRoutes from "./Routes/videoRoutes.js";
import turnRoutes from "./Routes/turnRoutes.js";
import { saveEndedStream, getEndedStreams } from "./Controllers/streamController.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import streamStore from "./utils/streamStore.js";
import logger from "./utils/logger.js";

const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 5000;

const defaultOrigins = [
  "https://full-stack-project-mani.vercel.app",
  "https://full-stack-project-rho.vercel.app",
  "https://global.xirsys.net",
  "http://localhost:5000",
  "http://localhost:3000",
  "http://localhost:5173",
];

const customOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((u) => u.trim())
  : [];

const ALLOWED_ORIGINS = [...new Set([...defaultOrigins, ...customOrigins])];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      ALLOWED_ORIGINS.includes(origin) ||
      /^https:\/\/.*\.vercel\.app$/.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive fallback to prevent connection drops in deployment
  },
  methods: ["GET", "POST", "DELETE", "PUT"],
  credentials: true,
};

const io = new Server(server, {
  cors: corsOptions,
});

connectDB();

app.use(express.json());
app.use(cors(corsOptions));
app.use(apiLimiter);

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/streams", streamRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/turn-credentials", turnRoutes);


// Socket.io Connection & Streaming Logic
io.on("connection", (socket) => {
  logger.socket("Connected", socket.id);

  socket.on("get-streams", async () => {
    logger.socket("get-streams", socket.id);
    const past = await getEndedStreams();
    socket.emit("stream-list", {
      liveStreams: streamStore.getAllStreams(),
      pastStreams: past,
    });
  });

  socket.on("get-stream-info", ({ streamId }) => {
    logger.socket("get-stream-info", socket.id, streamId);
    const stream = streamStore.getStream(streamId);
    const streamerSock = streamStore.getStreamerSocket(streamId);
    socket.emit(
      "stream-info",
      stream ? { ...stream, streamerSocketId: streamerSock } : null
    );
  });

  socket.on("join-stream", ({ streamId }) => {
    logger.socket("join-stream", socket.id, streamId);
    socket.join(streamId);
    socket.data.currentStreamId = streamId;

    const stream = streamStore.getStream(streamId);
    if (stream) {
      const newViewerCount = streamStore.updateViewerCount(streamId, 1);
      const streamerSock = streamStore.getStreamerSocket(streamId);

      if (streamerSock) {
        io.to(streamerSock).emit("viewer-joined", {
          streamId,
          viewerId: socket.id,
        });
        logger.socket("viewer-joined notify", streamerSock, socket.id);

        socket.emit("stream-info", {
          ...streamStore.getStream(streamId),
          streamerSocketId: streamerSock,
        });
      }

      if (streamerSock) {
        io.to(streamerSock).emit("viewer-count", {
          streamId,
          count: newViewerCount,
        });
      }
      io.to(streamId).emit("update-streams", streamStore.getAllStreams());
    }
  });

  socket.on("leave-stream", ({ streamId }) => {
    logger.socket("leave-stream", socket.id, streamId);
    socket.leave(streamId);

    const stream = streamStore.getStream(streamId);
    if (stream) {
      const newViewerCount = streamStore.updateViewerCount(streamId, -1);
      const streamerSock = streamStore.getStreamerSocket(streamId);
      if (streamerSock) {
        io.to(streamerSock).emit("viewer-count", {
          streamId,
          count: newViewerCount,
        });
      }
      io.to(streamId).emit("update-streams", streamStore.getAllStreams());
    }
  });

  socket.on("start-stream", (data, ack) => {
    logger.socket("start-stream", socket.id, data);
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
      viewers: 0,
      isFullscreen: false,
    };

    streamStore.setStream(id, newStream);
    streamStore.setStreamerSocket(id, socket.id);
    socket.data.streamerId = id;
    socket.join(id);

    io.emit("update-streams", streamStore.getAllStreams());
    socket.emit("start-stream", newStream);
    if (typeof ack === "function") ack();
  });

  socket.on("toggle-fullscreen", ({ streamId, isFullscreen }) => {
    logger.socket("toggle-fullscreen", socket.id, `${streamId}: ${isFullscreen}`);
    streamStore.setFullscreenState(streamId, isFullscreen);
    io.to(streamId).emit("update-streams", streamStore.getAllStreams());
  });

  socket.on("rejoin-stream", ({ streamerId }) => {
    logger.socket("rejoin-stream", socket.id, streamerId);
    const stream = streamStore.getStream(streamerId);
    if (stream) {
      socket.join(streamerId);
      socket.data.streamerId = streamerId;
      streamStore.setStreamerSocket(streamerId, socket.id);
      socket.emit("stream-info", {
        ...stream,
        streamerSocketId: socket.id,
      });
    }
  });

  socket.on("offer", ({ streamId, offer, target }) => {
    logger.socket("offer", socket.id, target);
    io.to(target).emit("offer", { offer, from: socket.id });
  });

  socket.on("answer", ({ streamId, answer, target }) => {
    logger.socket("answer", socket.id, target);
    io.to(target).emit("answer", { answer, from: socket.id });
  });

  socket.on("ice-candidate", ({ streamId, candidate, target }) => {
    logger.socket("ice-candidate", socket.id, target);
    io.to(target).emit("ice-candidate", { candidate, from: socket.id });
  });

  socket.on("chat-message", (chatData) => {
    const sid = chatData.streamId || socket.data.currentStreamId;
    logger.socket("chat-message", socket.id, `${chatData.username} @ ${sid}`);
    const stream = streamStore.getStream(sid);
    if (stream) {
      const msgObj = {
        sender: chatData.username,
        message: chatData.message,
        timestamp: new Date(),
      };
      streamStore.addChatMessage(sid, msgObj);
      io.to(sid).emit("chat-message", chatData);
    }
  });

  socket.on("stop-stream", async () => {
    const sid = socket.data.streamerId;
    const ended = streamStore.getStream(sid);
    if (sid && ended) {
      logger.socket("stop-stream", socket.id, sid);
      ended.endTime = new Date();
      await saveEndedStream(ended);
      streamStore.removeStream(sid);
      io.emit("update-streams", streamStore.getAllStreams());
      io.emit("stop-stream", ended);
    }
  });

  socket.on("disconnect", async () => {
    logger.socket("Disconnected", socket.id);
    const csid = socket.data.currentStreamId;
    if (csid) {
      const newViewerCount = streamStore.updateViewerCount(csid, -1);
      io.to(csid).emit("viewer-count", {
        streamId: csid,
        count: newViewerCount,
      });
      io.to(csid).emit("update-streams", streamStore.getAllStreams());
    }

    const strid = socket.data.streamerId;
    if (strid && streamStore.getStream(strid)) {
      setTimeout(async () => {
        const still = [...io.sockets.sockets.values()].some(
          (s) => s.data.streamerId === strid
        );
        if (!still) {
          logger.info(`Ending stream ${strid} after streamer disconnect timeout`);
          const ended = streamStore.getStream(strid);
          if (ended) {
            ended.endTime = new Date();
            await saveEndedStream(ended);
            streamStore.removeStream(strid);
            io.emit("update-streams", streamStore.getAllStreams());
            io.to(strid).emit("stream-ended");
          }
        }
      }, 5000);
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Touch-Live Backend running on port ${PORT}`);
});
