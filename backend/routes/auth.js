import express from "express";
import * as authController from "../controllers/auth.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);

// Protected routes
router.get("/profile", auth, authController.getProfile);
router.patch("/profile", auth, authController.updateProfile);
router.post("/logout", auth, authController.logout);

export default router;
