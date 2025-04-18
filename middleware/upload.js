// middleware/upload.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/Cloudinary.js";

// Configure Cloudinary storage for video
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "touch_live_videos",
    resource_type: "video",
    allowed_formats: ["mp4", "mov", "webm"],
    transformation: [{ quality: "auto" }],
  },
});

const upload = multer({
  storage,
  // NOTE: individual‐file limits are enforced client‐side; total 1 GB cap is in frontend logic
});

export default upload;
