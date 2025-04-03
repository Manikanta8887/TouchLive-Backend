import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  process.exit(1);
}

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

export default connectDB;
