import express from "express";
import upload from "../middleware/upload.js";
import {
  uploadVideo,
  getUserVideos,
  getAllVideos,
  deleteVideo,
} from "../Controllers/videoController.js";

const router = express.Router();

router.post(
  "/upload/:uid",
  upload.single("video"),
  uploadVideo
);

router.get("/:uid", getUserVideos);

router.get("/", getAllVideos);

router.delete("/:public_id", deleteVideo);

export default router;
