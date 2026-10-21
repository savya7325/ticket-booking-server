// One-off: convert legacy string roles to numbers (admin -> 1, user -> 2).
// Optional — the User model already reads both forms. Run: node scripts/migrateRoles.js
import "dotenv/config";
import mongoose from "mongoose";

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = mongoose.connection.db.collection("users");

  const admins = await users.updateMany({ role: { $in: ["admin", "1"] } }, { $set: { role: 1 } });
  const regular = await users.updateMany({ role: { $in: ["user", "2"] } }, { $set: { role: 2 } });
  const missing = await users.updateMany({ role: { $exists: false } }, { $set: { role: 2 } });

  console.log(`admins -> 1: ${admins.modifiedCount}`);
  console.log(`users  -> 2: ${regular.modifiedCount + missing.modifiedCount}`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
