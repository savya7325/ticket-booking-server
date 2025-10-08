import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  dates: { type: [Date], required: true },
  location: { type: String },
  price: { type: Number, default: 0 },
  ticketsAvailable: { type: Number, default: 0 },
  image: { type: String },
  seatsPerDate: { type: mongoose.Schema.Types.Mixed, default: {} },
  bookedSeats: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

// Pre-save hook to initialize seatsPerDate and bookedSeats
eventSchema.pre("save", function(next) {
  if (!this.seatsPerDate || typeof this.seatsPerDate !== "object") {
    this.seatsPerDate = {};
  }
  if (!this.bookedSeats || typeof this.bookedSeats !== "object") {
    this.bookedSeats = {};
  }

  this.dates.forEach(date => {
    const iso = new Date(date).toISOString();
    
    if (!(iso in this.seatsPerDate)) {
      this.seatsPerDate[iso] = this.ticketsAvailable || 0;
    }
    if (!(iso in this.bookedSeats)) {
      this.bookedSeats[iso] = [];
    }
  });

  // Mark as modified so Mongoose saves the changes
  this.markModified('seatsPerDate');
  this.markModified('bookedSeats');

  next();
});

export default mongoose.model("Event", eventSchema);