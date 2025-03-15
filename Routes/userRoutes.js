const express = require("express");
const { saveUser,  } = require("../Controllers/userController");

const router = express.Router();

router.post("/", saveUser);


module.exports = router;



