
import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import Booking from "../models/booking.js";

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
      const dateStr = new Date(booking.date).toISOString();
      
      // Remove seats from bookedSeats
      if (event.bookedSeats && event.bookedSeats[dateStr]) {
        event.bookedSeats[dateStr] = event.bookedSeats[dateStr].filter(
          seat => !booking.seats.includes(seat)
        );
      }
      
      // Restore available seats
      if (event.seatsPerDate && event.seatsPerDate[dateStr] !== undefined) {
        event.seatsPerDate[dateStr] += booking.seats.length;
      }
      
      event.markModified('seatsPerDate');
      event.markModified('bookedSeats');
      await event.save();
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
