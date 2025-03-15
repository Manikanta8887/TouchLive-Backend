import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profilePic: { type: String, default: "https://i.pinimg.com/736x/51/24/9f/51249f0c2caed9e7c06e4a5453c57857.jpg" },
  bio: { type: String, default: "Streamer" }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
