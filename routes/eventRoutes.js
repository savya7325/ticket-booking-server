

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
import upload from "../middleware/upload.js";
import { createEventValidators, createBookingValidators } from "../validators/eventValidators.js";
import { handleValidation } from "../middleware/handleValidation.js";

const router = express.Router();

router.get("/", getEvents);
router.get("/:id", getEventById);

router.post("/", protect, adminOnly, upload.single("image"),  createEventValidators,
  handleValidation, createEvent);

router.put("/:id", protect, adminOnly, upload.single("image"), updateEvent);
router.delete("/:id", protect, adminOnly, deleteEvent);


router.post("/:id/book", protect,   createBookingValidators,
  handleValidation, bookTickets);

export default router;
