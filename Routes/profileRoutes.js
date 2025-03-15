import express from "express";
import getUserProfile from"../Controllers/userProfile.js";
import updateUserProfile  from"../Controllers/bioUpdate.js";

const router = express.Router();
router.get("/:uid", getUserProfile);  
router.put("/:uid", updateUserProfile);


export default router;



