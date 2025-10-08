
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