// import express from "express";
// import saveUser from "../Controllers/userController.js";

// const router = express.Router();

// router.post("/", saveUser);


// export default  router;



import express from "express";
import { saveUser, getAllUsers } from "../Controllers/userController.js";

const router = express.Router();

// Store new user (Signup/Login)
router.post("/", saveUser);

// Get all users (For future use, e.g., displaying online users)
router.get("/", getAllUsers);

export default router;
