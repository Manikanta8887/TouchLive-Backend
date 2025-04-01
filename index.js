// import dotenv from "dotenv";
// import express from "express";
// import cors from "cors";
// import { createServer } from "http";
// import { Server } from "socket.io";
// import connectDB from "./Config/Mongoose.js";
// import userRoutes from "./Routes/userRoutes.js";
// import profileRoutes from "./Routes/profileRoutes.js";

// dotenv.config();
// const app = express();
// const server = createServer(app);
// const io = new Server(server, {
//   cors: { origin: "*", methods: ["GET", "POST"] },
// });

// connectDB();
// app.use(express.json());

// app.use(
//   cors({
//     origin: ["https://full-stack-project-mani.vercel.app", "https://full-stack-project-rho.vercel.app/", "http://localhost:5000"], 
//     credentials: true, 
//     methods: "GET, POST, PUT, DELETE",
//     allowedHeaders: "Content-Type, Authorization",
//   })
// );


// app.use("/api/users", userRoutes);
// app.use("/api/profile", profileRoutes);

// let liveStreams = [];

// io.on("connection", (socket) => {
//   console.log(`User connected: ${socket.id}`);

//   socket.on("offer", (offer, streamTitle) => {
//     liveStreams.push({ id: socket.id, streamTitle });
//     socket.broadcast.emit("offer", offer);
//     io.emit("update-streams", liveStreams);
//   });

//   socket.on("stop-stream", () => {
//     liveStreams = liveStreams.filter((stream) => stream.id !== socket.id);
//     io.emit("update-streams", liveStreams);
//   });

//   socket.on("chat-message", (msg) => {
//     io.emit("chat-message", msg);
//   });

//   socket.on("disconnect", () => {
//     liveStreams = liveStreams.filter((stream) => stream.id !== socket.id);
//     io.emit("update-streams", liveStreams);
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


// dotenv.config();
// const app = express();
// const server = createServer(app);
// const io = new Server(server, {
//   cors: { origin: "*", methods: ["GET", "POST"] },
// });

// connectDB();
// app.use(express.json());

// app.use(
//   cors({
//     origin: ["https://full-stack-project-mani.vercel.app", "https://full-stack-project-rho.vercel.app/", "http://localhost:5000"], 
//     credentials: true, 
//     methods: "GET, POST, PUT, DELETE",
//     allowedHeaders: "Content-Type, Authorization",
//   })
// );

// app.use("/api/users", userRoutes);
// app.use("/api/profile", profileRoutes);
// app.use("/api/streams", streamRoutes);


// let liveStreams = {}; // Stores active streams { socketId: { streamTitle, chatMessages } }

// // Socket.io Connection
// io.on("connection", (socket) => {
//   console.log(`User connected: ${socket.id}`);

//   // Handle New Stream
//   socket.on("start-stream", ({ streamTitle }) => {
//     liveStreams[socket.id] = { streamTitle, chatMessages: [] };
//     io.emit("update-streams", Object.values(liveStreams));
//   });

//   // Handle Chat Messages
//   socket.on("chat-message", ({ message, user }) => {
//     if (liveStreams[socket.id]) {
//       liveStreams[socket.id].chatMessages.push({ user, message });
//     }
//     io.emit("chat-message", { user, message });
//   });

//   // Handle Stopping the Stream
//   socket.on("stop-stream", () => {
//     delete liveStreams[socket.id];
//     io.emit("update-streams", Object.values(liveStreams));
//   });

//   // Handle Disconnection
//   socket.on("disconnect", () => {
//     delete liveStreams[socket.id];
//     io.emit("update-streams", Object.values(liveStreams));
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
import { saveEndedStream } from "./Controllers/streamController.js"; // New import for saving streams

dotenv.config();
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// Connect to MongoDB
connectDB();

app.use(express.json());

// Enable CORS for specified origins
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

// In-memory storage for active streams
// Each stream object includes: id, streamTitle, chatMessages, startTime, and streamerId.
let liveStreams = {};

// Socket.io Connection: Handles streaming events and chat
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // When a user starts a stream, register it with a title, start time, and optional streamerId.
  socket.on("start-stream", ({ streamTitle, streamerId }) => {
    liveStreams[socket.id] = { 
      id: socket.id,
      streamTitle, 
      chatMessages: [],
      startTime: new Date(),
      streamerId: streamerId || socket.id 
    };
    io.emit("update-streams", Object.values(liveStreams));
  });

  // When a chat message is sent during a stream, store it and broadcast to all.
  socket.on("chat-message", ({ message, user }) => {
    if (liveStreams[socket.id]) {
      liveStreams[socket.id].chatMessages.push({ user, message, timestamp: new Date() });
    }
    io.emit("chat-message", { user, message });
  });

  // When a stream is stopped, save it to the database and remove it from active streams.
  socket.on("stop-stream", () => {
    if (liveStreams[socket.id]) {
      saveEndedStream(liveStreams[socket.id]); // Save the ended stream to MongoDB
      delete liveStreams[socket.id];
      io.emit("update-streams", Object.values(liveStreams));
    }
  });

  // On disconnection, if the user was streaming, save the stream and remove it.
  socket.on("disconnect", () => {
    if (liveStreams[socket.id]) {
      saveEndedStream(liveStreams[socket.id]);
      delete liveStreams[socket.id];
      io.emit("update-streams", Object.values(liveStreams));
    }
  });
});

server.listen(5000, () => console.log("🚀 Server running on port 5000"));
