import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./Config/Mongoose.js";
import userRoutes from "./Routes/userRoutes.js";
import profileRoutes from "./Routes/profileRoutes.js";
import streamRoutes from "./Routes/streamRoutes.js";
import { saveEndedStream, getEndedStreams } from "./Controllers/streamController.js";
import videoRoutes from "./Routes/videoRoutes.js";
import updateUserProfile from "./Controllers/bioUpdate.js";

const app = express();
const server = createServer(app);
const PORT = 5000;
const ALLOWED_ORIGINS = [
  "https://full-stack-project-mani.vercel.app",
  "https://full-stack-project-rho.vercel.app",
  "https://global.xirsys.net",
  "http://localhost:5000",
  "http://localhost:3000",
  "http://localhost:5173"
];

const io = new Server(server, {
  cors: { origin: ALLOWED_ORIGINS, methods: ["GET","POST","DELETE","PUT"], credentials: true },
});

connectDB();
app.use(express.json());
app.use(cors({ origin: ALLOWED_ORIGINS, methods: ["GET","POST","DELETE","PUT"], credentials: true }));

app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/streams", streamRoutes);
app.use("/api/videos", videoRoutes);
app.put("/api/users/:uid", updateUserProfile);

let liveStreams = {};
let streamerSocketMap = {};

io.on("connection", (socket) => {
  console.log(`[Socket Connected] ${socket.id}`);

  socket.on("get-streams", async () => {
    console.log(`📡 [Get Streams] ${socket.id}`);
    const past = await getEndedStreams();
    socket.emit("stream-list", {
      liveStreams: Object.values(liveStreams),
      pastStreams: past
    });
  });

  socket.on("get-stream-info", ({ streamId }) => {
    console.log(`ℹ[Stream Info] ${socket.id} → ${streamId}`);
    const stream = liveStreams[streamId];
    socket.emit("stream-info", stream
      ? { ...stream, streamerSocketId: streamerSocketMap[streamId] }
      : null);
  });

  socket.on("join-stream", ({ streamId }) => {
    console.log(`👀 [Join Stream] ${socket.id} → ${streamId}`);
    socket.join(streamId);
    socket.data.currentStreamId = streamId;

    if (liveStreams[streamId]) {
      liveStreams[streamId].viewers = (liveStreams[streamId].viewers || 0) + 1;

      const streamerSock = streamerSocketMap[streamId];
      if (streamerSock) {
        io.to(streamerSock).emit("viewer-joined", {
          streamId,
          viewerId: socket.id
        });
        console.log(`📣 [Notify Streamer] ${streamerSock} of viewer ${socket.id}`);

        socket.emit("stream-info", {
          ...liveStreams[streamId],
          streamerSocketId: streamerSock
        });
      }

      io.to(streamerSock).emit("viewer-count", {
        streamId,
        count: liveStreams[streamId].viewers
      });
      io.to(streamId).emit("update-streams", Object.values(liveStreams));
    }
  });

  socket.on("leave-stream", ({ streamId }) => {
    console.log(`[Leave Stream] ${socket.id} → ${streamId}`);
    socket.leave(streamId);
    if (liveStreams[streamId]) {
      liveStreams[streamId].viewers = Math.max((liveStreams[streamId].viewers || 1) - 1, 0);

      const streamerSock = streamerSocketMap[streamId];
      if (streamerSock) {
        io.to(streamerSock).emit("viewer-count", {
          streamId,
          count: liveStreams[streamId].viewers
        });
      }
      io.to(streamId).emit("update-streams", Object.values(liveStreams));
    }
  });

  socket.on("start-stream", (data, ack) => {
    console.log(`🎥 [Start Stream] ${socket.id}`, data);
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
      isFullscreen: false
    };
    liveStreams[id] = newStream;
    socket.data.streamerId = id;
    streamerSocketMap[id] = socket.id;
    socket.join(id);

    io.emit("update-streams", Object.values(liveStreams));
    socket.emit("start-stream", newStream);
    if (typeof ack === "function") ack();
  });

  socket.on("toggle-fullscreen", ({ streamId, isFullscreen }) => {
    console.log(`[Toggle Fullscreen] ${socket.id} → ${streamId}: ${isFullscreen}`);
    if (liveStreams[streamId]) {
      liveStreams[streamId].isFullscreen = isFullscreen;
      io.to(streamId).emit("update-streams", Object.values(liveStreams));
    }
  });

  socket.on("rejoin-stream", ({ streamerId }) => {
    console.log(`[Rejoin Stream] ${socket.id} → ${streamerId}`);
    const stream = liveStreams[streamerId];
    if (stream) {
      socket.join(streamerId);
      socket.data.streamerId = streamerId;
      streamerSocketMap[streamerId] = socket.id;
      socket.emit("stream-info", {
        ...stream,
        streamerSocketId: streamerSocketMap[streamerId]
      });
    }
  });

  socket.on("offer", ({ streamId, offer, target }) => {
    console.log(`[Offer] ${socket.id} → ${target}`, offer);
    io.to(target).emit("offer", { offer, from: socket.id });
  });

  socket.on("answer", ({ streamId, answer, target }) => {
    console.log(`[Answer] ${socket.id} → ${target}`, answer);
    io.to(target).emit("answer", { answer, from: socket.id });
  });

  socket.on("ice-candidate", ({ streamId, candidate, target }) => {
    console.log(`[ICE] ${socket.id} → ${target}`, candidate);
    io.to(target).emit("ice-candidate", { candidate, from: socket.id });
  });

  socket.on("chat-message", (chatData) => {
    const sid = chatData.streamId || socket.data.currentStreamId;
    console.log(`[Chat] ${chatData.username} @ ${sid}: ${chatData.message}`);
    if (liveStreams[sid]) {
      liveStreams[sid].chatMessages.push({
        sender: chatData.username,
        message: chatData.message,
        timestamp: new Date()
      });
      io.to(sid).emit("chat-message", chatData);
    }
  });

  socket.on("stop-stream", async () => {
    const sid = socket.data.streamerId;
    if (sid && liveStreams[sid]) {
      console.log(`[Stop Stream] ${socket.id} → ${sid}`);
      const ended = liveStreams[sid];
      ended.endTime = new Date();
      await saveEndedStream(ended);
      delete liveStreams[sid];
      delete streamerSocketMap[sid];
      io.emit("update-streams", Object.values(liveStreams));
      io.emit("stop-stream", ended);
    }
  });

  socket.on("disconnect", async () => {
    console.log(`[Disconnected] ${socket.id}`);
    const csid = socket.data.currentStreamId;
    if (csid && liveStreams[csid]) {
      liveStreams[csid].viewers = Math.max((liveStreams[csid].viewers || 1) - 1, 0);
      io.to(csid).emit("viewer-count", {
        streamId: csid,
        count: liveStreams[csid].viewers
      });
      io.to(csid).emit("update-streams", Object.values(liveStreams));
    }
    const strid = socket.data.streamerId;
    if (strid && liveStreams[strid]) {
      setTimeout(async () => {
        const still = [...io.sockets.sockets.values()]
          .some(s => s.data.streamerId === strid);
        if (!still) {
          console.log(`⚰️ [Cleanup] Ending stream ${strid}`);
          const ended = liveStreams[strid];
          ended.endTime = new Date();
          await saveEndedStream(ended);
          delete liveStreams[strid];
          delete streamerSocketMap[strid];
          io.emit("update-streams", Object.values(liveStreams));
          io.to(strid).emit("stream-ended");
        }
      }, 5000);
    }
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
