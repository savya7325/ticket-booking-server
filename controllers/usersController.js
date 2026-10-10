
// import User from "../models/users.js";
// import jwt from "jsonwebtoken";

// const generateToken = (id, role) => jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "1d" });

// export const registerUser = async (req, res) => {
//   const { username, email, password, role, adminSecret } = req.body;
//   if (!username || !email || !password)
//     return res.status(400).json({ message: "All fields are required" });

//   let assignedRole = "user";
//   if (role === "admin" && adminSecret === process.env.ADMIN_SECRET) assignedRole = "admin";

//   try {
//     const userExists = await User.findOne({ email });
//     if (userExists) return res.status(400).json({ message: "User already exists" });

//     const user = await User.create({ username, email, password, role: assignedRole });
//     res.status(201).json({
//       _id: user._id,
//       username: user.username,
//       email: user.email,
//       role: user.role,
//       token: generateToken(user._id, user.role),
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const loginUser = async (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password) return res.status(400).json({ message: "Email and password required" });

//   try {
//     const user = await User.findOne({ email });
//     if (user && (await user.matchPassword(password))) {
//       res.json({
//         _id: user._id,
//         username: user.username,
//         email: user.email,
//         role: user.role,
//         token: generateToken(user._id, user.role),
//       });
//     } else res.status(401).json({ message: "Invalid email or password" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const logoutUser = (req, res) => {
//   res.json({ message: "Logged out successfully" });
// };

import path from "path";
import fs from "fs";
import User from "../models/users.js";  
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "../services/emailService.js"; // ← ADD THIS IMPORT

const generateToken = (id, role) => jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "1d" });

export const registerUser = async (req, res) => {
  const { username, email, password, role, adminSecret } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ message: "All fields are required" });
  
  let assignedRole = "user";
  if (role === "admin" && adminSecret === process.env.ADMIN_SECRET) assignedRole = "admin";
  
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });
    
    const user = await User.create({ username, email, password, role: assignedRole });
    
    // ← ADD EMAIL FUNCTIONALITY HERE (after user creation)
    // Send welcome email (non-blocking - won't fail registration if email fails)
    sendWelcomeEmail(user.email, user.username).catch(err => 
      console.error('Failed to send welcome email:', err)
    );
    
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });
  
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else res.status(401).json({ message: "Invalid email or password" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const logoutUser = (req, res) => {
  res.json({ message: "Logged out successfully" });
};


// export const uploadAvatar = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "No image uploaded" });
//     }

//     const user = await User.findById(req.user._id);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     //  DELETE OLD AVATAR ONLY IF IT IS NOT DEFAULT
//     // if (
//     //   user.avatar &&
//     //   user.avatar !== "default-avatar.png"
//     // ) {
//     //   const oldPath = path.join(
//     //     process.cwd(),
//     //     "uploads",
//     //     "avatars",
//     //     user.avatar
//     //   );

//     //   if (fs.existsSync(oldPath)) {
//     //     fs.unlinkSync(oldPath);
//     //   }
//     // }

//       if (
//       user.avatar &&
//       user.avatar !== "default-avatar.png" &&
//       user.avatar !== req.file.filename
//     ) {
//       const oldPath = path.join(
//         process.cwd(),
//         "uploads",
//         "avatars",
//         user.avatar
//       );

//       if (fs.existsSync(oldPath)) {
//         fs.unlinkSync(oldPath);
//       }
//     }

//     //  SAVE NEW AVATAR
// //     user.avatar = req.file.filename;
// //     await user.save();

// //     res.status(200).json({
// //       message: "Profile picture updated successfully",
// //       // avatarUrl: `/uploads/avatars/${user.avatar}`,
// //       avatarUrl: `${process.env.BASE_URL}/uploads/avatars/${user.avatar}`,
// //       user: {
// //         _id: user._id,
// //         username: user.username,
// //         email: user.email,
// //         role: user.role,
// //       },
// //     });
// //   } catch (error) {
// //     console.error("UPLOAD AVATAR ERROR:", error);
// //     res.status(500).json({ message: error.message });
// //   }
// // };


// user.avatar = req.file.filename;
//     await user.save();

//     res.status(200).json({
//       message: "Profile picture updated successfully",
//       avatarUrl: `${process.env.BASE_URL}/uploads/avatars/${user.avatar}`,
//     });
//   } catch (error) {
//     console.error("UPLOAD AVATAR ERROR:", error);
//     res.status(500).json({ message: error.message });
//   }
// };


export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ DELETE ONLY IF DIFFERENT FILE & NOT DEFAULT
    // if (
    //   user.avatar &&
    //   user.avatar !== "default-avatar.png" &&
    //   user.avatar !== req.file.filename
    // ) {
    if (user.avatar && user.avatar !== "default-avatar.png") {
      const oldPath = path.join(
        process.cwd(),
        "uploads",
        "avatars",
        user.avatar
      );

      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // save new avatar
    user.avatar = req.file.filename;
    await user.save();

    res.status(200).json({
      message: "Profile picture updated successfully",
      avatarUrl: `${process.env.BASE_URL}/uploads/avatars/${user.avatar}`,
    });
  } catch (error) {
    console.error("UPLOAD AVATAR ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};


export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // update username
    if (req.body.username) {
      user.username = req.body.username;
    }

    await user.save();

    res.json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatar
          ? `/uploads/avatars/${user.avatar}`
          : null,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
