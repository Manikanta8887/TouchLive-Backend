import express from "express";
import saveUser from "../Controllers/userController.js";

const router = express.Router();

router.post("/", saveUser);


export default  router;



