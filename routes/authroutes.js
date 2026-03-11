import express from "express"
import {signUp,login,logout,getMe,sendOtp,verifyOtp,forgotPassword,resetPassword} from "../controllers/authcontroller.js"
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();
router.post("/signUp",signUp);
router.post("/login",login);
router.post("/logout",protectRoute,logout);
router.get("/me", protectRoute, getMe);
router.post("/send-otp",sendOtp);
router.post("/verify-otp",protectRoute,verifyOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
export default router;