// One-off: give every event a fixed `capacity` and rebuild its per-date seat maps from real bookings.
//   node scripts/migrateCapacity.js          -> dry run, prints the plan
//   node scripts/migrateCapacity.js --apply  -> writes the changes
//
// Capacity is the larger of: the original per-date count stored under the old full-ISO keys
// (never decremented by bookings), and ticketsAvailable + seats in active bookings (every
// booking used to subtract from ticketsAvailable).
import "dotenv/config";
import mongoose from "mongoose";
import { dateKey } from "../utils/dateKey.js";
import { MAX_CAPACITY } from "../utils/seatLayout.js";

const APPLY = process.argv.includes("--apply");
const isFullIso = (k) => /T\d\d:\d\d/.test(k);

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const events = await db.collection("events").find({}).toArray();
  const bookings = await db.collection("bookings").find({}).toArray();

  for (const ev of events) {
    const mine = bookings.filter((b) => String(b.event) === String(ev._id));
    const bookedTotal = mine.reduce((n, b) => n + (b.seats?.length || 0), 0);

    const originals = Object.entries(ev.seatsPerDate || {})
      .filter(([k, v]) => isFullIso(k) && Number.isFinite(v))
      .map(([, v]) => v);
    // Edits through the old form could overwrite the "original" with a shrunken count, so take the larger estimate.
    const fromCounter = (ev.ticketsAvailable || 50) + bookedTotal;
    let capacity = ev.capacity || Math.max(fromCounter, ...originals);
    capacity = Math.min(Math.max(1, capacity), MAX_CAPACITY);

    // Source of truth for taken seats: the bookings collection.
    const bookedSeats = {};
    const seatsPerDate = {};
    for (const d of ev.dates || []) bookedSeats[dateKey(d)] = [];
    for (const b of mine) {
      const key = dateKey(b.date);
      if (!bookedSeats[key]) continue; // booking for a date the event no longer has
      bookedSeats[key] = [...new Set([...bookedSeats[key], ...(b.seats || [])])];
    }
    for (const [key, seats] of Object.entries(bookedSeats)) seatsPerDate[key] = Math.max(capacity - seats.length, 0);

    console.log(
      `${ev.title.padEnd(20)} capacity ${String(capacity).padStart(3)} (was ticketsAvailable ${ev.ticketsAvailable}) | ` +
        Object.entries(seatsPerDate)
          .map(([k, left]) => `${k}: ${left} left [${bookedSeats[k].join(",") || "-"}]`)
          .join(" | ")
    );

    if (APPLY) {
      await db.collection("events").updateOne(
        { _id: ev._id },
        { $set: { capacity, ticketsAvailable: capacity, seatsPerDate, bookedSeats } }
      );
    }
  }

  console.log(APPLY ? "\nApplied." : "\nDry run only. Re-run with --apply to write these changes.");
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
