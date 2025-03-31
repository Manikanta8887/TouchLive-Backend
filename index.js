import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./Config/Mongoose.js";
import userRoutes from "./Routes/userRoutes.js";
import profileRoutes from "./Routes/profileRoutes.js";

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
    origin: ["https://full-stack-project-mani.vercel.app", "https://full-stack-project-rho.vercel.app/", "http://localhost:5000"], 
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
