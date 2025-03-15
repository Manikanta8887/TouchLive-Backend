const express = require("express");
const getUserProfile = require("../Controllers/userProfile.js");
const  updateUserProfile  = require("../Controllers/bioUpdate.js");

const router = express.Router();

router.get("/:uid", getUserProfile);  
router.put("/:uid", updateUserProfile);


module.exports = router;



