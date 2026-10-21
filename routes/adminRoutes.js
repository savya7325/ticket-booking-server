import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import User from "../models/users.js";
import Event from "../models/events.js";
import Booking from "../models/booking.js";

const router = express.Router();

// Raw records for the admin dashboard; the frontend buckets them by day/week/month.
// Only non-sensitive fields are returned (no passwords).
router.get("/stats", protect, adminOnly, async (req, res) => {
  try {
    const [users, events, bookings] = await Promise.all([
      User.find({}, "username email role createdAt").sort({ createdAt: -1 }).lean(),
      Event.find({}, "title location price capacity ticketsAvailable bookedSeats dates image createdAt").sort({ createdAt: -1 }).lean(),
      Booking.find({}, "event user date seats totalPrice createdAt")
        .populate("event", "title")
        .populate("user", "username email")
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    // Documents created before timestamps were enabled fall back to the ObjectId's creation time.
    const withCreatedAt = (doc) => ({ ...doc, createdAt: doc.createdAt || doc._id.getTimestamp() });

    res.json({
      users: users.map(withCreatedAt),
      events: events.map(withCreatedAt),
      bookings: bookings.map(withCreatedAt),
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ message: "Could not load dashboard stats" });
  }
});

export default router;
