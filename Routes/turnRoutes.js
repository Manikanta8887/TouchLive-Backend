import express from "express";
import { getTurnCredentials } from "../Controllers/turnController.js";

const router = express.Router();

router.get("/", getTurnCredentials);

export default router;

