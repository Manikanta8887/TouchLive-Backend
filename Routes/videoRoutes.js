// Routes/videoRoutes.js
import express from "express";
import upload from "../middleware/upload.js";
import {
  uploadVideo,
  getUserVideos,
  getAllVideos,
  deleteVideo,
} from "../Controllers/videoController.js";


const router = express.Router();

// POST /api/videos/upload/:uid
router.post(
  "/upload/:uid",
  upload.single("video"),
  uploadVideo
);

// GET /api/videos/:uid
router.get("/:uid", getUserVideos);

// GET /api/videos
router.get("/", getAllVideos);

router.delete("/:public_id", deleteVideo);

export default router;
