import express from "express";
import { saveUser, getAllUsers } from "../Controllers/userController.js";

const router = express.Router();


router.post("/", saveUser);


router.get("/", getAllUsers);

export default router;
