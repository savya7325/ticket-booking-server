
import mongoose from "mongoose";
import dotenv from "dotenv";
import Event from "../models/events.js";

// Load environment variables
dotenv.config();

const fixOldEvents = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const events = await Event.find({});
    console.log(`Found ${events.length} events to check`);

    let fixed = 0;

    for (const event of events) {
      let needsUpdate = false;

      // Initialize seatsPerDate if missing
      if (!event.seatsPerDate || typeof event.seatsPerDate !== "object") {
        event.seatsPerDate = {};
        needsUpdate = true;
      }

      // Initialize bookedSeats if missing
      if (!event.bookedSeats || typeof event.bookedSeats !== "object") {
        event.bookedSeats = {};
        needsUpdate = true;
      }

      // Set default ticketsAvailable if missing
      if (!event.ticketsAvailable || event.ticketsAvailable === 0) {
        event.ticketsAvailable = 50; // Default value
        needsUpdate = true;
      }

      // Initialize seats for each date
      if (event.dates && Array.isArray(event.dates)) {
        event.dates.forEach(date => {
          const iso = new Date(date).toISOString();
          
          if (event.seatsPerDate[iso] === undefined) {
            event.seatsPerDate[iso] = event.ticketsAvailable;
            needsUpdate = true;
          }
          
          if (!event.bookedSeats[iso]) {
            event.bookedSeats[iso] = [];
            needsUpdate = true;
          }
        });
      }

      if (needsUpdate) {
        event.markModified('seatsPerDate');
        event.markModified('bookedSeats');
        await event.save();
        fixed++;
        console.log(`Fixed event: ${event.title}`);
      }
    }

    console.log(`\n✅ Migration complete! Fixed ${fixed} events.`);
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
};

fixOldEvents();