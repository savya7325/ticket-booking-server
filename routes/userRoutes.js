
// import express from "express";
// import { registerUser, loginUser, logoutUser } from "../controllers/usersController.js";
// import { protect, adminOnly } from "../middleware/auth.js";

// const router = express.Router();

// router.post("/register", registerUser);
// router.post("/login", loginUser);
// router.post("/logout", logoutUser);

// router.get("/profile", protect, (req, res) => {
//   res.json({ message: "This is your profile", user: req.user });
// });

// router.get("/admin/dashboard", protect, adminOnly, (req, res) => {
//   res.json({ message: "Welcome to admin dashboard", user: req.user });
// });

// export default router;


import express from "express";
import upload from "../middleware/upload.js";
import { registerUser, loginUser, logoutUser, uploadAvatar, updateProfile } from "../controllers/usersController.js";
import { protect, adminOnly } from "../middleware/auth.js";
import fs from "fs";
import path from "path";
import User from "../models/users.js";


const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.get("/profile", protect, (req, res) => {
  res.json({ message: "This is your profile", user: req.user });
});

router.put("/profile", protect, updateProfile);
router.put("/profile/avatar", protect, upload.single("avatar"), uploadAvatar);

router.get("/admin/dashboard", protect, adminOnly, (req, res) => {
  res.json({ message: "Welcome to admin dashboard", user: req.user });
});


router.delete("/profile/avatar", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // delete only real uploaded avatar
    if (user.avatar && user.avatar !== "default-avatar.png") {
      const filePath = path.join(
        process.cwd(),
        "uploads",
        "avatars",
        user.avatar
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    user.avatar = "default-avatar.png";
    await user.save();

    res.status(200).json({
      message: "Avatar removed successfully",
      avatarUrl: null,
    });
  } catch (error) {
    console.error("REMOVE AVATAR ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});



export default router;
