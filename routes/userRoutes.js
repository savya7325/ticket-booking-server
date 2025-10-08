

import express from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/usersController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.get("/profile", protect, (req, res) => {
  res.json({ message: "This is your profile", user: req.user });
});

router.get("/admin/dashboard", protect, adminOnly, (req, res) => {
  res.json({ message: "Welcome to admin dashboard", user: req.user });
});

export default router;
