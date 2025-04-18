// Routes/videoRoutes.js
import express from "express";
import upload from "../middleware/upload.js";
import {
  uploadVideo,
  getUserVideos,
  getAllVideos,
} from "../Controllers/videoController.js";

const router = express.Router();

router.post("/upload/:uid", upload.single("video"), uploadVideo);
router.get("/:uid", getUserVideos);
router.get("/", getAllVideos);

export default router;
