import express from "express";
import saveUser from "../Controllers/userController";

const router = express.Router();

router.post("/", saveUser);


export default  router;



