import express from 'express';
import { getUserProfile, loginUser, logout, registerUser, updateProfile } from '../controllers/userControllers.js';
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../utils/multer.js";
const router = express.Router();


router.post("/login", loginUser)
router.post("/register", registerUser)
router.route("/logout").get(logout);
router.route("/profile").get(isAuthenticated, getUserProfile);
router.route("/profile/update").put(isAuthenticated, upload.single("profilePhoto"), updateProfile);
export default router