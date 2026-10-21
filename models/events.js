import mongoose from "mongoose";
import { syncSeatMaps, MAX_CAPACITY } from "../utils/seatLayout.js";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  dates: { type: [Date], required: true },
  location: { type: String },
  price: { type: Number, default: 0 },
  // Fixed number of seats per show; the seat map always draws this many.
  capacity: { type: Number, min: 1, max: MAX_CAPACITY },
  // Legacy field kept for older clients; mirrors capacity and no longer shrinks on bookings.
  ticketsAvailable: { type: Number, default: 0 },
  image: { type: String },
  // Per show date ("YYYY-MM-DD"): seats left and the seat labels already taken.
  seatsPerDate: { type: mongoose.Schema.Types.Mixed, default: {} },
  bookedSeats: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

// Keep both seat maps in step with the dates and capacity on every save.
eventSchema.pre("save", function(next) {
  if (!this.capacity) this.capacity = this.ticketsAvailable || 50;
  this.ticketsAvailable = this.capacity;
  syncSeatMaps(this);
  next();
});

export default mongoose.model("Event", eventSchema);
