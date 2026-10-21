// Restores the public demo to a clean state after visitors have played with the demo admin.
//   node scripts/resetDemoData.js --save   -> snapshot the current events as the "clean" set
//   node scripts/resetDemoData.js          -> dry run: show what a reset would change
//   node scripts/resetDemoData.js --apply  -> reset
//
// A reset:
//   - restores every snapshot event (title, dates, price, capacity, image, ...) and re-creates deleted ones
//   - deletes events that aren't in the snapshot (e.g. added via the demo admin) and their bookings
//   - deletes bookings made by the demo accounts
//   - rebuilds each event's taken seats from the bookings that remain
//   - resets the demo accounts' names, roles and passwords
// Real users and their bookings on snapshot events are kept.
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { dateKey } from "../utils/dateKey.js";

const SNAPSHOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "demo-seed.json");
const DEMO_ACCOUNTS = [
  { username: "Demo User", email: "savyaak07+demouser@gmail.com", role: 2 },
  { username: "Demo Admin", email: "savyaak07+demoadmin@gmail.com", role: 1 },
];
const DEMO_PASSWORD = "Demo@1234";
const EVENT_FIELDS = ["title", "description", "dates", "location", "price", "capacity", "ticketsAvailable", "image"];

const SAVE = process.argv.includes("--save");
const APPLY = process.argv.includes("--apply");

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const eventsCol = db.collection("events");
  const bookingsCol = db.collection("bookings");
  const usersCol = db.collection("users");

  if (SAVE) {
    const events = await eventsCol.find({}).toArray();
    const seed = events.map((e) => ({ _id: String(e._id), ...Object.fromEntries(EVENT_FIELDS.map((k) => [k, e[k]])) }));
    fs.writeFileSync(SNAPSHOT, JSON.stringify(seed, null, 2));
    console.log(`Saved ${seed.length} events to ${path.basename(SNAPSHOT)}:\n  ${seed.map((e) => e.title).join("\n  ")}`);
    return mongoose.disconnect();
  }

  if (!fs.existsSync(SNAPSHOT)) throw new Error("No snapshot yet. Run with --save first.");
  const seed = JSON.parse(fs.readFileSync(SNAPSHOT, "utf8"));
  const seedIds = new Set(seed.map((e) => e._id));

  const demoUsers = await usersCol.find({ email: { $in: DEMO_ACCOUNTS.map((a) => a.email) } }).toArray();
  const demoUserIds = demoUsers.map((u) => u._id);

  const extraEvents = await eventsCol.find({ _id: { $nin: [...seedIds].map((id) => new mongoose.Types.ObjectId(id)) } }).toArray();
  const demoBookings = await bookingsCol.countDocuments({ user: { $in: demoUserIds } });
  const extraEventBookings = await bookingsCol.countDocuments({ event: { $in: extraEvents.map((e) => e._id) } });

  console.log(`Events to restore from snapshot: ${seed.length}`);
  console.log(`Events to delete (not in snapshot): ${extraEvents.length}${extraEvents.length ? " → " + extraEvents.map((e) => e.title).join(", ") : ""}`);
  console.log(`Bookings to delete: ${demoBookings} by demo accounts, ${extraEventBookings} on deleted events`);
  console.log(`Demo accounts to reset: ${DEMO_ACCOUNTS.map((a) => a.email).join(", ")}`);

  if (!APPLY) {
    console.log("\nDry run only. Re-run with --apply to reset.");
    return mongoose.disconnect();
  }

  await bookingsCol.deleteMany({ $or: [{ user: { $in: demoUserIds } }, { event: { $in: extraEvents.map((e) => e._id) } }] });
  await eventsCol.deleteMany({ _id: { $in: extraEvents.map((e) => e._id) } });

  for (const e of seed) {
    const _id = new mongoose.Types.ObjectId(e._id);
    const dates = (e.dates || []).map((d) => new Date(d));
    const capacity = e.capacity || e.ticketsAvailable || 50;
    // Seats taken = bookings that still exist for this event, per show date.
    const bookedSeats = Object.fromEntries(dates.map((d) => [dateKey(d), []]));
    for (const b of await bookingsCol.find({ event: _id }).toArray()) {
      const key = dateKey(b.date);
      if (bookedSeats[key]) bookedSeats[key] = [...new Set([...bookedSeats[key], ...(b.seats || [])])];
    }
    const seatsPerDate = Object.fromEntries(Object.entries(bookedSeats).map(([k, s]) => [k, Math.max(capacity - s.length, 0)]));
    await eventsCol.updateOne(
      { _id },
      {
        $set: { ...Object.fromEntries(EVENT_FIELDS.map((k) => [k, e[k]])), dates, capacity, ticketsAvailable: capacity, bookedSeats, seatsPerDate, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );
  }

  const hash = await bcrypt.hash(DEMO_PASSWORD, await bcrypt.genSalt(10));
  for (const a of DEMO_ACCOUNTS) {
    await usersCol.updateOne(
      { email: a.email },
      { $set: { username: a.username, role: a.role, password: hash, avatar: "default-avatar.png", updatedAt: new Date() }, $setOnInsert: { email: a.email, createdAt: new Date() } },
      { upsert: true }
    );
  }

  console.log("\nDemo data reset ✓");
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
