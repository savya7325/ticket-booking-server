
import { body } from "express-validator";
import Event from "../models/events.js";

export const createEventValidators = [
  body("title")
    .trim()
    .notEmpty().withMessage("Title is required").bail()
    .isLength({ min: 3 }).withMessage("Title must be at least 3 characters"),

  body("description")
    .trim()
    .notEmpty().withMessage("Description is required").bail()
    .isLength({ min: 10 }).withMessage("Description must be at least 10 characters"),

  body("dates")
    .custom(value => {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        throw new Error("At least one date is required");
      }
      const arr = Array.isArray(value) ? value : [value];
      arr.forEach(d => {
        if (isNaN(Date.parse(d))) throw new Error("Invalid date format");
      });
      return true;
    }),

  body("location")
    .trim()
    .notEmpty().withMessage("Location is required"),

  body("price")
    .notEmpty().withMessage("Price is required").bail()
    .isFloat({ min: 0 }).withMessage("Price must be a positive number"),

  body("ticketsAvailable")
    .notEmpty().withMessage("Tickets available is required").bail()
    .isInt({ min: 1 }).withMessage("Tickets must be at least 1"),
];

export const createBookingValidators = [
  body("date")
    .notEmpty().withMessage("Date is required").bail()
    .custom(value => {
      if (isNaN(Date.parse(value))) throw new Error("Invalid date format");
      return true;
    }),

  body("seats")
    .isArray({ min: 1 }).withMessage("At least one seat must be selected"),

  body("totalPrice")
    .optional()
    .isFloat({ min: 0 }).withMessage("Total price must be a number >= 0"),

 body().custom(async (value, { req }) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new Error("Event not found");

  // Normalize date to match event
  const selected = new Date(req.body.date);
  const selectedKey = event.dates.find(d => {
    const eventDate = new Date(d);
    return selected.toDateString() === eventDate.toDateString();
  });

  if (!selectedKey) {
    throw new Error("Selected date is not available for this event");
  }

  const dateKey = new Date(selectedKey).toISOString();

  if (!event.seatsPerDate[dateKey] || event.seatsPerDate[dateKey] < req.body.seats.length) {
    throw new Error("Not enough seats available for this date");
  }

  return true;

  }),
];
