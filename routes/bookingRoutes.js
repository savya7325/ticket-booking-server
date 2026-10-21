
import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import Booking from "../models/booking.js";
import Event from "../models/events.js";
import { dateKey } from "../utils/dateKey.js";

const router = express.Router();

router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "username email")
      .populate("event", "title");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/mybookings", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("Logged in user ID:", req.user._id);
    const bookings = await Booking.find({ user: userId }).populate("event");
     console.log("Found bookings:", bookings);
    res.json(bookings);
  } catch (err) {
       console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Update the event to remove these seats
    const event = await Event.findById(booking.event);
    if (event) {
      // Free the seats for that show date (older data may also have a full-ISO key).
      for (const k of [dateKey(booking.date), new Date(booking.date).toISOString()]) {
        if (Array.isArray(event.bookedSeats?.[k])) {
          event.bookedSeats[k] = event.bookedSeats[k].filter(seat => !booking.seats.includes(seat));
        }
      }
      event.markModified('bookedSeats');
      await event.save(); // pre-save recomputes seats left (capacity − booked) for every date
    }

    // Delete the booking
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking deleted and seats restored" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
