// import dotenv from "dotenv";
// import express from "express";
// import cors from "cors";
// import { createServer } from "http";  // ✅ Import HTTP Server
// import { Server } from "socket.io";   // ✅ Import Socket.io
// import connectDB from "./Config/Mongoose.js";
// import userRoutes from "./Routes/userRoutes.js";
// import profileRoutes from "./Routes/profileRoutes.js";

// dotenv.config();

// // ✅ Initialize Express App
// const app = express();
// const server = createServer(app); // ✅ Create HTTP Server
// const io = new Server(server, {
//   cors: { origin: "*", methods: ["GET", "POST"] },
// });

// // ✅ Connect Database
// connectDB();

// // ✅ Middleware
// app.use(express.json());
// app.use(cors({
//   origin: [
//     "https://full-stack-project-mani.vercel.app",
//     "https://full-stack-project-rho.vercel.app",
//     "http://localhost:5000"
//   ],
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true
// }));

// app.options("*", cors());

// // ✅ Security Headers
// app.use((req, res, next) => {
//   res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
//   res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
//   next();
// });

// // ✅ Define Routes
// app.use("/api/users", userRoutes);
// app.use("/api/profile", profileRoutes);

// let liveStreams = [];

// // ✅ SINGLE Socket.io Connection Handling
// io.on("connection", (socket) => {
//   console.log(`New user connected: ${socket.id}`);

//   // 🔹 Handle WebRTC Signaling
//   socket.on("offer", (offer, streamTitle) => {
//     liveStreams.push({ id: socket.id, streamTitle });
//     socket.broadcast.emit("offer", offer);
//   });

//   socket.on("answer", (answer) => {
//     socket.broadcast.emit("answer", answer);
//   });

//   socket.on("candidate", (candidate) => {
//     socket.broadcast.emit("candidate", candidate);
//   });

//   socket.on("stop-stream", () => {
//     liveStreams = liveStreams.filter((stream) => stream.id !== socket.id);
//     io.emit("stream-stopped", socket.id);
//   });

//   // 🔹 Handle Chat Messaging
//   socket.on("chat-message", (msg) => {
//     io.emit("chat-message", msg);
//   });

//   // 🔹 Handle Disconnection & Cleanup
//   socket.on("disconnect", () => {
//     liveStreams = liveStreams.filter((stream) => stream.id !== socket.id);
//     io.emit("stream-stopped", socket.id);
//     console.log(`User disconnected: ${socket.id}`);
//   });
// });

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./Config/Mongoose.js";

dotenv.config();
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

connectDB();
app.use(express.json());

app.use(
  cors({
    origin: "https://full-stack-project-mani.vercel.app", 
    credentials: true, 
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: "Content-Type, Authorization",
  })
);


app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);

let liveStreams = [];

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("offer", (offer, streamTitle) => {
    liveStreams.push({ id: socket.id, streamTitle });
    socket.broadcast.emit("offer", offer);
    io.emit("update-streams", liveStreams);
  });

  socket.on("stop-stream", () => {
    liveStreams = liveStreams.filter((stream) => stream.id !== socket.id);
    io.emit("update-streams", liveStreams);
  });

  socket.on("chat-message", (msg) => {
    io.emit("chat-message", msg);
  });

  socket.on("disconnect", () => {
    liveStreams = liveStreams.filter((stream) => stream.id !== socket.id);
    io.emit("update-streams", liveStreams);
  });
});

server.listen(5000, () => console.log("🚀 Server running on port 5000"));
