// import express from "express";
// import { getActiveStreams, getStreamChat, getPastStreams } from "../Controllers/streamController.js";

// const router = express.Router();


// router.get("/active", getActiveStreams);


// router.get("/chat/:streamId", getStreamChat);


// router.get("/past/:userId", getPastStreams);

// export default router;


// Routes/streamRoutes.js
import express from "express";
import { getActiveStreams, getStreamChat, getPastStreams } from "../Controllers/streamController.js";

const router = express.Router();

router.get("/active", getActiveStreams);
router.get("/chat/:streamId", getStreamChat);
router.get("/past/:userId", getPastStreams);

export default router;
