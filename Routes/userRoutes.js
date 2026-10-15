import express from "express";
import { saveUser, getAllUsers } from "../Controllers/userController.js";
import { authenticate } from "../middleware/auth.js";
import { validateUserSave } from "../middleware/validator.js";

const router = express.Router();

router.post("/", authenticate, validateUserSave, saveUser);
router.get("/", getAllUsers);

export default router;
