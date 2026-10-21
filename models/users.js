
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES, normalizeRole } from "../utils/roles.js";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // 1 = admin, 2 = user. The custom cast also reads legacy "admin"/"user" strings.
  role: {
    type: Number,
    enum: [ROLES.ADMIN, ROLES.USER],
    default: ROLES.USER,
    cast: normalizeRole,
  },

    avatar: {
      type: String,
      default: "default-avatar.png",  
    },
}, 
{ timestamps: true });

userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
