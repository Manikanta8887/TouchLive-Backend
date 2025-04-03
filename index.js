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

// Socket.io Connection for Live Streaming & Chat
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // // When a stream starts, register it along with the streamer info.
  // socket.on("start-stream", ({ streamTitle, streamerId }) => {
  //   liveStreams[socket.id] = {
  //     id: socket.id,
  //     streamerId: streamerId || socket.id,
  //     streamTitle,
  //     chatMessages: [],
  //     startTime: new Date(),
  //   };
  //   io.emit("update-streams", Object.values(liveStreams));
  // });

  socket.on("start-stream", ({ streamTitle, streamerId }) => {
    liveStreams[socket.id] = {
      id: socket.id,
      streamerId: streamerId || socket.id,
      streamTitle,
      chatMessages: [],
      startTime: new Date(),
      isFullscreen: false, // New property for fullscreen toggle
    };
    io.emit("update-streams", Object.values(liveStreams));
  });
  
  // Toggle Fullscreen Mode
  socket.on("toggle-fullscreen", ({ streamId, isFullscreen }) => {
    if (liveStreams[streamId]) {
      liveStreams[streamId].isFullscreen = isFullscreen;
      io.emit("update-streams", Object.values(liveStreams));
    }
  });
  

  // When a chat message is sent, expect a full chat object from the client.
  // socket.on("chat-message", (chatData) => {
  //   // Append timestamp to the chat message and store it in the active stream.
  //   if (liveStreams[socket.id]) {
  //     liveStreams[socket.id].chatMessages.push({
  //       ...chatData,
  //       timestamp: new Date(),
  //     });
  //   }
  //   // Broadcast the full chatData object to all clients.
  //   io.emit("chat-message", chatData);
  // });
  socket.on("chat-message", (chatData) => {
    if (liveStreams[chatData.streamId]) {
      liveStreams[chatData.streamId].chatMessages.push({
        sender: chatData.sender, // Ensure sender is stored properly
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
