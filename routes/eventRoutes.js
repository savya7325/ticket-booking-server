
import express from "express";
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  bookTickets,
} from "../controllers/eventController.js";

import { protect, adminOnly } from "../middleware/auth.js";
import { uploadEventImage } from "../middleware/eventUpload.js";
import {
  createEventValidators,
  createBookingValidators,
} from "../validators/eventValidators.js";
import { handleValidation } from "../middleware/handleValidation.js";

const router = express.Router();

// ================= PUBLIC ROUTES =================
router.get("/", getEvents);
router.get("/:id", getEventById);

// ================= ADMIN ROUTES =================
router.post(
  "/",
  protect,
  adminOnly,
  uploadEventImage.single("image"),
  createEventValidators,
  handleValidation,
  createEvent
);

router.put(
  "/:id",
  protect,
  adminOnly,
  uploadEventImage.single("image"),
  updateEvent
);

router.delete("/:id", protect, adminOnly, deleteEvent);

// ================= BOOKINGS =================
router.post(
  "/:id/book",
  protect,
  createBookingValidators,
  handleValidation,
  bookTickets
);

export default router;
