import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import Message from "../models/message.js";
import { sendContactAutoReply, sendContactNotification } from "../services/emailService.js";

const router = express.Router();

const TOPICS = ["Booking help", "Hosting an event", "Feedback", "Something else"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Simple in-memory limit: 5 messages per 10 minutes per IP.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const recent = new Map();
const tooMany = (ip) => {
  const now = Date.now();
  const hits = (recent.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  return hits.length > MAX_PER_WINDOW;
};

// Public: send a message from the Contact page.
router.post("/", async (req, res) => {
  const { name = "", email = "", topic = "", message = "", website = "" } = req.body || {};

  // Honeypot: real visitors never see or fill the "website" field; bots do. Pretend success.
  if (website) return res.status(201).json({ message: "Message sent" });

  const errors = [];
  if (!String(name).trim()) errors.push({ field: "name", message: "Tell us your name" });
  if (!EMAIL_RE.test(String(email).trim())) errors.push({ field: "email", message: "Enter a valid email so we can reply" });
  if (String(message).trim().length < 10) errors.push({ field: "message", message: "A few more words, please (10+ characters)" });
  if (String(message).length > 5000) errors.push({ field: "message", message: "Please keep it under 5000 characters" });
  if (errors.length) return res.status(400).json({ message: errors[0].message, errors });

  if (tooMany(req.ip)) {
    return res.status(429).json({ message: "Too many messages. Please try again in a few minutes." });
  }

  try {
    const saved = await Message.create({
      name: String(name).trim().slice(0, 100),
      email: String(email).trim(),
      topic: TOPICS.includes(topic) ? topic : "Something else",
      message: String(message).trim(),
    });

    // Notify the admin and wait, so we know whether it went out. The message is saved either way.
    try {
      await sendContactNotification(saved);
      saved.adminNotified = true;
      await saved.save();
    } catch (err) {
      console.error("Contact notification email failed:", err.message);
    }

    // Auto-reply to the visitor in the background.
    sendContactAutoReply(saved).catch((err) => console.error("Contact auto-reply failed:", err.message));

    res.status(201).json({ message: "Message sent", id: saved._id });
  } catch (err) {
    console.error("Contact message error:", err);
    res.status(500).json({ message: "Couldn't send your message. Please try again." });
  }
});

// Admin: latest messages (for an inbox view).
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }).limit(100).lean();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Could not load messages" });
  }
});

export default router;
