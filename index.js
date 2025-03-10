const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "http://localhost:3000", // Allow React frontend
        methods: ["GET", "POST"]
    }
});


let rooms = {}; // Store active rooms

// When a user connects
io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // User joins a room
    socket.on("join-room", (roomId) => {
        if (!rooms[roomId]) {
            rooms[roomId] = [];
        }
        rooms[roomId].push(socket.id);
        socket.join(roomId);

        console.log(`User ${socket.id} joined Room: ${roomId}`);

        // Notify existing users
        socket.emit("existing-users", rooms[roomId].filter((id) => id !== socket.id));
        io.to(roomId).emit("user-joined", { userId: socket.id, roomId });
    });

    // When an offer is sent
    socket.on("offer", ({ userId, offer }) => {
        socket.to(userId).emit("offer", { userId: socket.id, offer });
    });

    // When an answer is received
    socket.on("answer", ({ userId, answer }) => {
        socket.to(userId).emit("answer", { userId: socket.id, answer });
    });

    // Handle ICE candidates
    socket.on("ice-candidate", ({ userId, candidate }) => {
        socket.to(userId).emit("ice-candidate", { userId: socket.id, candidate });
    });

    // When a user leaves
    socket.on("disconnect", () => {
        for (const roomId in rooms) {
            rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
            io.to(roomId).emit("user-left", socket.id);
            if (rooms[roomId].length === 0) delete rooms[roomId];
        }
        console.log(`User Disconnected: ${socket.id}`);
    });
});

// Start the server
server.listen(5000, () => console.log("Signaling Server running on port 5000"));
