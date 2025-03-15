require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./Config/Mongoose");
const userRoutes = require("./Routes/userRoutes");
const profileRoutes = require("./Routes/profileRoutes");

const app = express();
// cors are used to allow resources from other ports 
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

connectDB();

app.use("/api/users", userRoutes);
app.use("/api/profile",profileRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
