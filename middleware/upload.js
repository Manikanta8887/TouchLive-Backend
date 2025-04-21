import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/Cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder:        "touch_live_videos",
    resource_type: "video",
    public_id:     `${req.params.uid}/${Date.now()}`,
    format:        file.mimetype === "video/webm" ? "webm" : "mp4",
    allowed_formats: ["mp4", "mov", "webm"],
    transformation: [{ quality: "auto" }],
  }),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("video/")) {
      return cb(new Error("Only video files are allowed"), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 1 * 1024 * 1024 * 1024 },
});

export default upload;
