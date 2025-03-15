import dotenv from "dotenv";
import express from "express"; 
import cors from "cors";
import connectDB from "./Config/Mongoose.js"; 
import userRoutes from "./Routes/userRoutes.js"; 
import profileRoutes from "./Routes/profileRoutes.js"; 
dotenv.config()
const app = express();
// cors are used to allow resources from other ports
app.use(cors({
  origin: "https://full-stack-project-mani.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

connectDB();

app.use("/api/users", userRoutes);
app.use("/api/profile",profileRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
