// import mongoose from "mongoose";

// const bookingSchema = new mongoose.Schema({
//   event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
//   user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   date: { type: String, required: true },
//   seats: [{ type: String, required: true }],
//   totalPrice: { type: Number, required: true },
// }, { timestamps: true });

// export default mongoose.model("Booking", bookingSchema);


import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  seats: { type: [String], required: true },
  totalPrice: Number,
}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);
