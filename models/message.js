import mongoose from "mongoose";

// Messages sent from the public Contact page. Saved even if the notification email fails.
const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    topic: { type: String, trim: true, maxlength: 60, default: "General" },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    status: { type: String, enum: ["new", "read"], default: "new" },
    adminNotified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
