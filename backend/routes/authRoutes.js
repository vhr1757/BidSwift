import express from "express";

import { login, registerUser, updatePassword } from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", login);

router.put("/password", authMiddleware,updatePassword);

export default router;