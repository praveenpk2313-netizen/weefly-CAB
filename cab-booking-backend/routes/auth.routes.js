import express from "express";
import { sendOtp, verifyOtp, signup, login, getUserById } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/signup", signup);
router.post("/login", login);
router.get("/user/:id", getUserById);

export default router;