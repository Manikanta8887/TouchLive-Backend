// Routes/videoRoutes.js
import express from "express";
import upload from "../middleware/upload.js";
import {
  uploadVideo,
  getUserVideos,
  getAllVideos,
} from "../Controllers/videoController.js";

const router = express.Router();

// Frontend’s existing action: <Upload action="/api/upload-video/:uid">
router.post(
  "/upload-video/:uid",
  upload.single("video"),
  uploadVideo
);

// RESTful under /api/videos
router.post(
  "/upload/:uid",
  upload.single("video"),
  uploadVideo
);
router.get("/:uid", getUserVideos);
router.get("/", getAllVideos);

export default router;
