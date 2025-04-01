// import express from "express";
// import { getActiveStreams, getStreamChat } from "../Controllers/streamController.js";

// const router = express.Router();

// // Get all active streams
// router.get("/active", getActiveStreams);

// // Get chat messages for a specific stream
// router.get("/chat/:streamId", getStreamChat);

// export default router;

import express from "express";
import { getActiveStreams, getStreamChat, getPastStreams } from "../Controllers/streamController.js";

const router = express.Router();

// API to fetch active live streams
router.get("/active", getActiveStreams);

// API to fetch chat messages for a specific stream
router.get("/chat/:streamId", getStreamChat);

// API to fetch past streams for a specific user
router.get("/past/:userId", getPastStreams);

export default router;

