// import express from "express";
// import getUserProfile from"../Controllers/userProfile.js";
// import updateUserProfile  from"../Controllers/bioUpdate.js";

// const router = express.Router();
// router.get("/:uid", getUserProfile);  
// router.put("/:uid", updateUserProfile);


// export default router;



import express from "express";
import getUserProfile from "../Controllers/userProfile.js";
import updateUserProfile from "../Controllers/bioUpdate.js";

const router = express.Router();

// Get user profile by Firebase UID
router.get("/:uid", getUserProfile);

// Update user profile (bio, profile picture, etc.)
router.put("/:uid", updateUserProfile);

export default router;
