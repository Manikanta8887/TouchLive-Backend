import express from "express";
import upload from "../middleware/upload.js";
import {
  uploadVideo,
  getUserVideos,
  getAllVideos,
  deleteVideo,
} from "../Controllers/videoController.js";
import { authenticate } from "../middleware/auth.js";
import { strictLimiter } from "../middleware/rateLimiter.js";
import { validateVideoUpload } from "../middleware/validator.js";

const router = express.Router();

router.post(
  "/upload/:uid",
  authenticate,
  strictLimiter,
  upload.single("video"),
  validateVideoUpload,
  uploadVideo
);

router.get("/:uid", getUserVideos);
router.get("/", getAllVideos);

router.delete("/:public_id", authenticate, deleteVideo);

export default router;
