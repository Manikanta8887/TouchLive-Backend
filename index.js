// import dotenv from "dotenv";
// import express from "express"; 
// import cors from "cors";
// import connectDB from "./Config/Mongoose.js"; 
// import userRoutes from "./Routes/userRoutes.js"; 
// import profileRoutes from "./Routes/profileRoutes.js"; 
// dotenv.config()
// const app = express();
// // cors are used to allow resources from other ports
// app.use(cors({
//   origin: ["https://full-stack-project-mani.vercel.app","http://localhost:5000"],
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true
// }));

// app.use(express.json());

// connectDB();

// app.use("/api/users", userRoutes);
// app.use("/api/profile",profileRoutes)

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// import dotenv from "dotenv";
// import express from "express"; 
// import cors from "cors";
// import connectDB from "./Config/Mongoose.js"; 
// import userRoutes from "./Routes/userRoutes.js"; 
// import profileRoutes from "./Routes/profileRoutes.js"; 

// dotenv.config();

// const app = express();

// // ✅ Optimized CORS Setup
// app.use(cors({
//   origin: ["https://full-stack-project-mani.vercel.app", "http://localhost:5000"],
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true
// }));

// // ✅ Handle Preflight Requests
// app.options("*", cors());

// app.use(express.json());

// // ✅ Connect Database
// connectDB();

// // ✅ Define Routes
// app.use("/api/users", userRoutes);
// app.use("/api/profile", profileRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


import dotenv from "dotenv";
import express from "express"; 
import cors from "cors";
import connectDB from "./Config/Mongoose.js"; 
import userRoutes from "./Routes/userRoutes.js"; 
import profileRoutes from "./Routes/profileRoutes.js"; 

dotenv.config();

const app = express();

// ✅ Optimized CORS Setup
app.use(cors({
  origin: ["https://full-stack-project-mani.vercel.app", "https://full-stack-project-rho.vercel.app", "http://localhost:5000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// ✅ Handle Preflight Requests
app.options("*", cors());

// ✅ Set Security Headers (Fix for COOP issue)
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

app.use(express.json());

// ✅ Connect Database
connectDB();

// ✅ Define Routes
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
