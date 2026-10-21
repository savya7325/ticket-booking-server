
import jwt from "jsonwebtoken";
import User from "../models/users.js";
import { ROLES } from "../utils/roles.js";

export const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    // Load the user from the DB so the role is current, not whatever the token says.
    req.user = await User.findById(decoded.id).select("-password");
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }

  if (!req.user) {
    return res.status(401).json({ message: "Not authorized, user not found" });
  }
  next();
};

export const adminOnly = (req, res, next) => {
  if (req.user?.role === ROLES.ADMIN) next();
  else res.status(403).json({ message: "Access denied: Admins only" });
};
