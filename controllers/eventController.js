// import Event from "../models/events.js";
// import Booking from "../models/booking.js";

// const parseDates = (input) => {
//   if (!input) return [];
//   if (Array.isArray(input)) return input.map(d => new Date(d));
//   return input.split(",").map(d => new Date(d));
// };

// // Helper function to initialize event seats data
// const initializeEventSeats = (event, ticketsAvailable) => {
//   if (!event.seatsPerDate || typeof event.seatsPerDate !== "object") {
//     event.seatsPerDate = {};
//   }
//   if (!event.bookedSeats || typeof event.bookedSeats !== "object") {
//     event.bookedSeats = {};
//   }
  
//   if (event.dates && Array.isArray(event.dates)) {
//     event.dates.forEach(date => {
//       const iso = new Date(date).toISOString();
//       if (event.seatsPerDate[iso] === undefined) {
//         event.seatsPerDate[iso] = ticketsAvailable;
//       }
//       if (!event.bookedSeats[iso]) {
//         event.bookedSeats[iso] = [];
//       }
//     });
//   }
  
//   return event;
// };

// export const createEvent = async (req, res) => {
//   try {
//     const { title, description, location, price, ticketsAvailable } = req.body;
    
//     let dates = req.body.dates || req.body['dates[]'];
    
//     if (!Array.isArray(dates)) {
//       dates = dates ? [dates] : [];
//     }
    
//     const parsedDates = parseDates(dates);
//     const availableSeats = Number(ticketsAvailable) || 50;

//     const seatsPerDate = {};
//     const bookedSeats = {};

//     parsedDates.forEach(d => {
//       const iso = new Date(d).toISOString();
//       seatsPerDate[iso] = availableSeats;
//       bookedSeats[iso] = [];
//     });

//     const event = await Event.create({
//       title,
//       description,
//       dates: parsedDates,
//       location,
//       price: Number(price) || 0,
//       ticketsAvailable: availableSeats,
//       image: req.file ? req.file.filename : null,
//       seatsPerDate,
//       bookedSeats
//     });

//     res.status(201).json({
//       ...event.toObject(),
//       dates: event.dates.map(d => new Date(d).toISOString()),
//       seatsPerDate: event.seatsPerDate || {},
//       bookedSeats: event.bookedSeats || {}
//     });
//   } catch (err) {
//     console.error("Create event error:", err);
//     res.status(400).json({ message: err.message });
//   }
// };

// export const getEvents = async (req, res) => {
//   try {
//     const { location, maxPrice, date } = req.query;
//     const filter = {};

//     if (location) filter.location = { $regex: location, $options: "i" };
//     if (maxPrice) filter.price = { $lte: Number(maxPrice) };
//     if (date) {
//       const selected = new Date(date);
//       selected.setHours(0, 0, 0, 0);
//       const nextDay = new Date(selected);
//       nextDay.setDate(selected.getDate() + 1);
//       filter.dates = { $elemMatch: { $gte: selected, $lt: nextDay } };
//     }

//     const events = await Event.find(filter);

//     const eventsData = events.map(ev => ({
//       ...ev.toObject(),
//       dates: ev.dates.map(d => d.toISOString()),
//       seatsPerDate: ev.seatsPerDate || {},
//       bookedSeats: ev.bookedSeats || {},
//       ticketsAvailable: ev.ticketsAvailable || 50
//     }));

//     res.json(eventsData);
//   } catch (err) {
//     console.error("Get events error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// export const getEventById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const event = await Event.findById(id);
//     if (!event) return res.status(404).json({ message: "Event not found" });

//     // Initialize seats if missing (for old events)
//     const ticketsAvailable = event.ticketsAvailable || 50;
    
//     if (!event.seatsPerDate || Object.keys(event.seatsPerDate).length === 0) {
//       initializeEventSeats(event, ticketsAvailable);
//       event.markModified('seatsPerDate');
//       event.markModified('bookedSeats');
//       await event.save();
//     }

//     res.json({
//       ...event.toObject(),
//       dates: event.dates.map(d => d.toISOString()),
//       seatsPerDate: event.seatsPerDate || {},
//       bookedSeats: event.bookedSeats || {},
//       ticketsAvailable: ticketsAvailable
//     });
//   } catch (err) {
//     console.error("Get event by ID error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// export const updateEvent = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { title, description, location, price, ticketsAvailable } = req.body;
    
//     let dates = req.body.dates || req.body['dates[]'];
//     if (!Array.isArray(dates)) {
//       dates = dates ? [dates] : [];
//     }

//     const event = await Event.findById(id);
//     if (!event) return res.status(404).json({ message: "Event not found" });

//     const newDates = parseDates(dates);
//     const newSeats = Number(ticketsAvailable) || event.ticketsAvailable || 50;

//     // Initialize if missing
//     if (!event.seatsPerDate || typeof event.seatsPerDate !== "object") event.seatsPerDate = {};
//     if (!event.bookedSeats || typeof event.bookedSeats !== "object") event.bookedSeats = {};

//     // Update seats for each date
//     newDates.forEach(d => {
//       const iso = d.toISOString();
//       const alreadyBooked = (event.bookedSeats[iso] || []).length;
//       event.seatsPerDate[iso] = Math.max(newSeats - alreadyBooked, 0);
//       if (!event.bookedSeats[iso]) {
//         event.bookedSeats[iso] = [];
//       }
//     });

//     // Remove dates that are no longer in the event
//     const newDateStrs = newDates.map(d => d.toISOString());
//     Object.keys(event.seatsPerDate).forEach(dateStr => {
//       if (!newDateStrs.includes(dateStr)) {
//         delete event.seatsPerDate[dateStr];
//         delete event.bookedSeats[dateStr];
//       }
//     });

//     // Update event fields
//     event.title = title || event.title;
//     event.description = description || event.description;
//     event.dates = newDates.length ? newDates : event.dates;
//     event.location = location || event.location;
//     event.price = price !== undefined ? Number(price) : event.price;
//     event.ticketsAvailable = newSeats;

//     if (req.file) {
//       event.image = req.file.filename;
//     }

//     event.markModified('seatsPerDate');
//     event.markModified('bookedSeats');
//     event.markModified('dates');

//     await event.save();

//     res.json({
//       ...event.toObject(),
//       dates: event.dates.map(d => d.toISOString()),
//       seatsPerDate: event.seatsPerDate || {},
//       bookedSeats: event.bookedSeats || {},
//     });
//   } catch (err) {
//     console.error("Update event error:", err);
//     res.status(400).json({ message: err.message });
//   }
// };

// export const deleteEvent = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deleted = await Event.findByIdAndDelete(id);
//     if (!deleted) return res.status(404).json({ message: "Event not found" });

//     res.json({ message: "Event deleted successfully" });
//   } catch (err) {
//     console.error("Delete event error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };


// // const recentBookings = new Map();

// // export const bookTickets = async (req, res) => {
// //   const bookingKey = `${req.user._id}-${req.params.id}-${req.body.date}-${req.body.seats.join(",")}`;
// //   const now = Date.now();
  
// //   if (recentBookings.has(bookingKey)) {
// //     const lastTime = recentBookings.get(bookingKey);
// //     if (now - lastTime < 10000) {
// //       console.log("⚠️ DUPLICATE BOOKING IGNORED");
// //       return res.status(200).json({ message: "Booking already processed" });
// //     }
// //   }
  
// //   recentBookings.set(bookingKey, now);
// //   setTimeout(() => recentBookings.delete(bookingKey), 15000);

// //   try {
// //     const { id } = req.params;
// //     const { seats, date, totalPrice } = req.body;

// //     if (!seats || seats.length === 0 || !date) {
// //       return res.status(400).json({ message: "Seats and date are required" });
// //     }

// //     const event = await Event.findById(id);
// //     if (!event) return res.status(404).json({ message: "Event not found" });

// //     // const dateStr = new Date(date).toISOString();
// //     const dateObj = new Date(date);
// // const dateStr = dateObj.toISOString().split("T")[0];

// //     // Initialize if missing
// //     const ticketsAvailable = event.ticketsAvailable || 50;
// //     if (!event.seatsPerDate || typeof event.seatsPerDate !== "object") event.seatsPerDate = {};
// //     if (!event.bookedSeats || typeof event.bookedSeats !== "object") event.bookedSeats = {};

// //     if (event.seatsPerDate[dateStr] === undefined) {
// //       event.seatsPerDate[dateStr] = ticketsAvailable;
// //     }
// //     if (!event.bookedSeats[dateStr]) {
// //       event.bookedSeats[dateStr] = [];
// //     }

// //     // Validate seat availability
// //     if (event.seatsPerDate[dateStr] < seats.length) {
// //       return res.status(400).json({ 
// //         message: `Not enough seats available. Only ${event.seatsPerDate[dateStr]} seats remaining.` 
// //       });
// //     }

// //     // Check for duplicate seat bookings
// //     const alreadyBooked = seats.filter(seat => event.bookedSeats[dateStr].includes(seat));
// //     if (alreadyBooked.length > 0) {
// //       return res.status(400).json({ 
// //         message: `Seats already booked: ${alreadyBooked.join(", ")}` 
// //       });
// //     }

// //     // Book the seats
// //     event.bookedSeats[dateStr].push(...seats);
// //     event.seatsPerDate[dateStr] = Math.max(event.seatsPerDate[dateStr] - seats.length, 0);

// //     event.markModified('seatsPerDate');
// //     event.markModified('bookedSeats');

// //     await event.save();

// //     const booking = await Booking.create({
// //       event: id,
// //       user: req.user._id,
// //       date: new Date(date),
// //       seats: seats,
// //       totalPrice: totalPrice || seats.length * (event.price || 0),
// //     });

// //     res.json({
// //       message: "Booking successful",
// //       booking: booking,
// //       event: {
// //         ...event.toObject(),
// //         dates: event.dates.map(d => d.toISOString()),
// //         seatsPerDate: event.seatsPerDate || {},
// //         bookedSeats: event.bookedSeats || {},
// //       },
// //     });
// //   } catch (err) {
// //     console.error("Booking error:", err);
// //     res.status(400).json({ message: err.message });
// //   }
// // };

// // const recentBookings = new Map();

// // export const bookTickets = async (req, res) => {
// //   const bookingKey = `${req.user._id}-${req.params.id}-${req.body.date}-${req.body.seats.join(",")}`;
// //   const now = Date.now();

// //   if (recentBookings.has(bookingKey)) {
// //     const lastTime = recentBookings.get(bookingKey);
// //     if (now - lastTime < 10000) {
// //       console.log("⚠️ DUPLICATE BOOKING IGNORED");
// //       return res.status(200).json({ message: "Booking already processed" });
// //     }
// //   }

// //   recentBookings.set(bookingKey, now);
// //   setTimeout(() => recentBookings.delete(bookingKey), 15000);

// //   try {
// //     const { id } = req.params;
// //     const { seats, date, totalPrice } = req.body;

// //     if (!seats || seats.length === 0 || !date) {
// //       return res.status(400).json({ message: "Seats and date are required" });
// //     }

// //     const event = await Event.findById(id);
// //     if (!event) return res.status(404).json({ message: "Event not found" });

// //     const dateObj = new Date(date);
// //     const dateStr = dateObj.toISOString().split("T")[0];

// //     // Initialize if missing
// //     const ticketsAvailable = event.ticketsAvailable || 50;
// //     if (!event.seatsPerDate || typeof event.seatsPerDate !== "object") event.seatsPerDate = {};
// //     if (!event.bookedSeats || typeof event.bookedSeats !== "object") event.bookedSeats = {};

// //     if (event.seatsPerDate[dateStr] === undefined) {
// //       event.seatsPerDate[dateStr] = ticketsAvailable;
// //     }
// //     if (!event.bookedSeats[dateStr]) {
// //       event.bookedSeats[dateStr] = [];
// //     }

// //     // ✅ VALIDATION: Check if seat labels exist (A–O rows, 1–10 per row)
// //     const validRows = "ABCDEFGHIJKLMNO".split(""); // A to O (15 rows)
// //     const validSeats = [];
// //     for (const row of validRows) {
// //       for (let i = 1; i <= 10; i++) validSeats.push(`${row}${i}`);
// //     }

// //     const invalidSeats = seats.filter(seat => !validSeats.includes(seat));
// //     if (invalidSeats.length > 0) {
// //       return res.status(400).json({
// //         errors: [
// //           { field: "", message: "Not enough seats available for this date" }
// //         ]
// //       });
// //     }

// //     // Validate seat availability count
// //     if (event.seatsPerDate[dateStr] < seats.length) {
// //       return res.status(400).json({
// //         message: `Not enough seats available. Only ${event.seatsPerDate[dateStr]} seats remaining.`,
// //       });
// //     }

// //     // Check for duplicate seat bookings
// //     const alreadyBooked = seats.filter(seat => event.bookedSeats[dateStr].includes(seat));
// //     if (alreadyBooked.length > 0) {
// //       return res.status(400).json({
// //         message: `Seats already booked: ${alreadyBooked.join(", ")}`,
// //       });
// //     }

// //     // Book the seats
// //     event.bookedSeats[dateStr].push(...seats);
// //     event.seatsPerDate[dateStr] = Math.max(event.seatsPerDate[dateStr] - seats.length, 0);

// //     event.markModified("seatsPerDate");
// //     event.markModified("bookedSeats");

// //     await event.save();

// //     const booking = await Booking.create({
// //       event: id,
// //       user: req.user._id,
// //       date: new Date(date),
// //       seats: seats,
// //       totalPrice: totalPrice || seats.length * (event.price || 0),
// //     });

// //     res.json({
// //       message: "Booking successful",
// //       booking: booking,
// //       event: {
// //         ...event.toObject(),
// //         dates: event.dates.map(d => d.toISOString()),
// //         seatsPerDate: event.seatsPerDate || {},
// //         bookedSeats: event.bookedSeats || {},
// //       },
// //     });
// //   } catch (err) {
// //     console.error("Booking error:", err);
// //     res.status(400).json({ message: err.message });
// //   }
// // };


// const recentBookings = new Map();

// export const bookTickets = async (req, res) => {
//   const bookingKey = `${req.user._id}-${req.params.id}-${req.body.date}-${req.body.seats.join(",")}`;
//   const now = Date.now();

//   if (recentBookings.has(bookingKey)) {
//     const lastTime = recentBookings.get(bookingKey);
//     if (now - lastTime < 10000) {
//       console.log("⚠️ DUPLICATE BOOKING IGNORED");
//       return res.status(200).json({ message: "Booking already processed" });
//     }
//   }

//   recentBookings.set(bookingKey, now);
//   setTimeout(() => recentBookings.delete(bookingKey), 15000);

//   try {
//     const { id } = req.params;
//     const { seats, date, totalPrice } = req.body;

//     if (!seats || seats.length === 0 || !date) {
//       return res.status(400).json({ message: "Seats and date are required" });
//     }

//     const event = await Event.findById(id);
//     if (!event) return res.status(404).json({ message: "Event not found" });

//     const dateObj = new Date(date);
//     const dateStr = dateObj.toISOString().split("T")[0];

//     // Initialize if missing
//     const ticketsAvailable = event.ticketsAvailable || 50;
//     if (!event.seatsPerDate || typeof event.seatsPerDate !== "object") event.seatsPerDate = {};
//     if (!event.bookedSeats || typeof event.bookedSeats !== "object") event.bookedSeats = {};

//     if (event.seatsPerDate[dateStr] === undefined) {
//       event.seatsPerDate[dateStr] = ticketsAvailable;
//     }
//     if (!event.bookedSeats[dateStr]) {
//       event.bookedSeats[dateStr] = [];
//     }

//     // ✅ VALIDATION: Check if seat labels exist (A–O rows, 1–10 per row)
//     const validRows = "ABCDEFGHIJKLMNO".split(""); // A to O (15 rows)
//     const validSeats = [];
//     for (const row of validRows) {
//       for (let i = 1; i <= 10; i++) validSeats.push(`${row}${i}`);
//     }

//     const invalidSeats = seats.filter(seat => !validSeats.includes(seat));
//     if (invalidSeats.length > 0) {
//       return res.status(400).json({
//         errors: [
//           { field: "", message: "Not enough seats available for this date" }
//         ]
//       });
//     }

//     // Validate seat availability count
//     if (event.seatsPerDate[dateStr] < seats.length) {
//       return res.status(400).json({
//         message: `Not enough seats available. Only ${event.seatsPerDate[dateStr]} seats remaining.`,
//       });
//     }

//     // Check for duplicate seat bookings
//     const alreadyBooked = seats.filter(seat => event.bookedSeats[dateStr].includes(seat));
//     if (alreadyBooked.length > 0) {
//       return res.status(400).json({
//         message: `Seats already booked: ${alreadyBooked.join(", ")}`,
//       });
//     }

//     // Book the seats
//     event.bookedSeats[dateStr].push(...seats);
//     event.seatsPerDate[dateStr] = Math.max(event.seatsPerDate[dateStr] - seats.length, 0);

//     // ✅ Update overall ticketsAvailable
//     event.ticketsAvailable = Math.max((event.ticketsAvailable || 50) - seats.length, 0);

//     event.markModified("seatsPerDate");
//     event.markModified("bookedSeats");

//     await event.save();

//     const booking = await Booking.create({
//       event: id,
//       user: req.user._id,
//       date: new Date(date),
//       seats: seats,
//       totalPrice: totalPrice || seats.length * (event.price || 0),
//     });

//     res.json({
//       message: "Booking successful",
//       booking: booking,
//       event: {
//         ...event.toObject(),
//         dates: event.dates.map(d => d.toISOString()),
//         seatsPerDate: event.seatsPerDate || {},
//         bookedSeats: event.bookedSeats || {},
//       },
//     });
//   } catch (err) {
//     console.error("Booking error:", err);
//     res.status(400).json({ message: err.message });
//   }
// };


import Event from "../models/events.js";
import Booking from "../models/booking.js";
import User from "../models/users.js"; // ← ADD THIS IMPORT
import { sendBookingConfirmation } from "../services/emailService.js"; // ← ADD THIS IMPORT

const parseDates = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) return input.map(d => new Date(d));
  return input.split(",").map(d => new Date(d));
};

// Helper function to initialize event seats data
const initializeEventSeats = (event, ticketsAvailable) => {
  if (!event.seatsPerDate || typeof event.seatsPerDate !== "object") {
    event.seatsPerDate = {};
  }
  if (!event.bookedSeats || typeof event.bookedSeats !== "object") {
    event.bookedSeats = {};
  }
  
  if (event.dates && Array.isArray(event.dates)) {
    event.dates.forEach(date => {
      const iso = new Date(date).toISOString();
      if (event.seatsPerDate[iso] === undefined) {
        event.seatsPerDate[iso] = ticketsAvailable;
      }
      if (!event.bookedSeats[iso]) {
        event.bookedSeats[iso] = [];
      }
    });
  }
  
  return event;
};

export const createEvent = async (req, res) => {
  try {
    const { title, description, location, price, ticketsAvailable } = req.body;
    
    let dates = req.body.dates || req.body['dates[]'];
    
    if (!Array.isArray(dates)) {
      dates = dates ? [dates] : [];
    }
    
    const parsedDates = parseDates(dates);
    const availableSeats = Number(ticketsAvailable) || 50;

    const seatsPerDate = {};
    const bookedSeats = {};

    parsedDates.forEach(d => {
      const iso = new Date(d).toISOString();
      seatsPerDate[iso] = availableSeats;
      bookedSeats[iso] = [];
    });

    const event = await Event.create({
      title,
      description,
      dates: parsedDates,
      location,
      price: Number(price) || 0,
      ticketsAvailable: availableSeats,
      image: req.file ? req.file.filename : null,
      seatsPerDate,
      bookedSeats
    });

    res.status(201).json({
      ...event.toObject(),
      dates: event.dates.map(d => new Date(d).toISOString()),
      seatsPerDate: event.seatsPerDate || {},
      bookedSeats: event.bookedSeats || {}
    });
  } catch (err) {
    console.error("Create event error:", err);
    res.status(400).json({ message: err.message });
  }
};

export const getEvents = async (req, res) => {
  try {
    const { location, maxPrice, date } = req.query;
    const filter = {};

    if (location) filter.location = { $regex: location, $options: "i" };
    if (maxPrice) filter.price = { $lte: Number(maxPrice) };
    if (date) {
      const selected = new Date(date);
      selected.setHours(0, 0, 0, 0);
      const nextDay = new Date(selected);
      nextDay.setDate(selected.getDate() + 1);
      filter.dates = { $elemMatch: { $gte: selected, $lt: nextDay } };
    }

    const events = await Event.find(filter);

    const eventsData = events.map(ev => ({
      ...ev.toObject(),
      dates: ev.dates.map(d => d.toISOString()),
      seatsPerDate: ev.seatsPerDate || {},
      bookedSeats: ev.bookedSeats || {},
      ticketsAvailable: ev.ticketsAvailable || 50
    }));

    res.json(eventsData);
  } catch (err) {
    console.error("Get events error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Initialize seats if missing (for old events)
    const ticketsAvailable = event.ticketsAvailable || 50;
    
    if (!event.seatsPerDate || Object.keys(event.seatsPerDate).length === 0) {
      initializeEventSeats(event, ticketsAvailable);
      event.markModified('seatsPerDate');
      event.markModified('bookedSeats');
      await event.save();
    }

    res.json({
      ...event.toObject(),
      dates: event.dates.map(d => d.toISOString()),
      seatsPerDate: event.seatsPerDate || {},
      bookedSeats: event.bookedSeats || {},
      ticketsAvailable: ticketsAvailable
    });
  } catch (err) {
    console.error("Get event by ID error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, location, price, ticketsAvailable } = req.body;
    
    let dates = req.body.dates || req.body['dates[]'];
    if (!Array.isArray(dates)) {
      dates = dates ? [dates] : [];
    }

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const newDates = parseDates(dates);
    const newSeats = Number(ticketsAvailable) || event.ticketsAvailable || 50;

    // Initialize if missing
    if (!event.seatsPerDate || typeof event.seatsPerDate !== "object") event.seatsPerDate = {};
    if (!event.bookedSeats || typeof event.bookedSeats !== "object") event.bookedSeats = {};

    // Update seats for each date
    newDates.forEach(d => {
      const iso = d.toISOString();
      const alreadyBooked = (event.bookedSeats[iso] || []).length;
      event.seatsPerDate[iso] = Math.max(newSeats - alreadyBooked, 0);
      if (!event.bookedSeats[iso]) {
        event.bookedSeats[iso] = [];
      }
    });

    // Remove dates that are no longer in the event
    const newDateStrs = newDates.map(d => d.toISOString());
    Object.keys(event.seatsPerDate).forEach(dateStr => {
      if (!newDateStrs.includes(dateStr)) {
        delete event.seatsPerDate[dateStr];
        delete event.bookedSeats[dateStr];
      }
    });

    // Update event fields
    event.title = title || event.title;
    event.description = description || event.description;
    event.dates = newDates.length ? newDates : event.dates;
    event.location = location || event.location;
    event.price = price !== undefined ? Number(price) : event.price;
    event.ticketsAvailable = newSeats;

    if (req.file) {
      event.image = req.file.filename;
    }

    event.markModified('seatsPerDate');
    event.markModified('bookedSeats');
    event.markModified('dates');

    await event.save();

    res.json({
      ...event.toObject(),
      dates: event.dates.map(d => d.toISOString()),
      seatsPerDate: event.seatsPerDate || {},
      bookedSeats: event.bookedSeats || {},
    });
  } catch (err) {
    console.error("Update event error:", err);
    res.status(400).json({ message: err.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Event.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Event not found" });

    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("Delete event error:", err);
    res.status(500).json({ message: err.message });
  }
};

const recentBookings = new Map();

export const bookTickets = async (req, res) => {
  const bookingKey = `${req.user._id}-${req.params.id}-${req.body.date}-${req.body.seats.join(",")}`;
  const now = Date.now();

  if (recentBookings.has(bookingKey)) {
    const lastTime = recentBookings.get(bookingKey);
    if (now - lastTime < 10000) {
      console.log("⚠️ DUPLICATE BOOKING IGNORED");
      return res.status(200).json({ message: "Booking already processed" });
    }
  }

  recentBookings.set(bookingKey, now);
  setTimeout(() => recentBookings.delete(bookingKey), 15000);

  try {
    const { id } = req.params;
    const { seats, date, totalPrice } = req.body;

    if (!seats || seats.length === 0 || !date) {
      return res.status(400).json({ message: "Seats and date are required" });
    }

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // ← GET USER DETAILS FOR EMAIL
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const dateObj = new Date(date);
    const dateStr = dateObj.toISOString().split("T")[0];

    // Initialize if missing
    const ticketsAvailable = event.ticketsAvailable || 50;
    if (!event.seatsPerDate || typeof event.seatsPerDate !== "object") event.seatsPerDate = {};
    if (!event.bookedSeats || typeof event.bookedSeats !== "object") event.bookedSeats = {};

    if (event.seatsPerDate[dateStr] === undefined) {
      event.seatsPerDate[dateStr] = ticketsAvailable;
    }
    if (!event.bookedSeats[dateStr]) {
      event.bookedSeats[dateStr] = [];
    }

    // ✅ VALIDATION: Check if seat labels exist (A–O rows, 1–10 per row)
    const validRows = "ABCDEFGHIJKLMNO".split(""); // A to O (15 rows)
    const validSeats = [];
    for (const row of validRows) {
      for (let i = 1; i <= 10; i++) validSeats.push(`${row}${i}`);
    }

    const invalidSeats = seats.filter(seat => !validSeats.includes(seat));
    if (invalidSeats.length > 0) {
      return res.status(400).json({
        errors: [
          { field: "", message: "Not enough seats available for this date" }
        ]
      });
    }

    // Validate seat availability count
    if (event.seatsPerDate[dateStr] < seats.length) {
      return res.status(400).json({
        message: `Not enough seats available. Only ${event.seatsPerDate[dateStr]} seats remaining.`,
      });
    }

    // Check for duplicate seat bookings
    const alreadyBooked = seats.filter(seat => event.bookedSeats[dateStr].includes(seat));
    if (alreadyBooked.length > 0) {
      return res.status(400).json({
        message: `Seats already booked: ${alreadyBooked.join(", ")}`,
      });
    }

    // Book the seats
    event.bookedSeats[dateStr].push(...seats);
    event.seatsPerDate[dateStr] = Math.max(event.seatsPerDate[dateStr] - seats.length, 0);

    // ✅ Update overall ticketsAvailable
    event.ticketsAvailable = Math.max((event.ticketsAvailable || 50) - seats.length, 0);

    event.markModified("seatsPerDate");
    event.markModified("bookedSeats");

    await event.save();

    const booking = await Booking.create({
      event: id,
      user: req.user._id,
      date: new Date(date),
      seats: seats,
      totalPrice: totalPrice || seats.length * (event.price || 0),
    });

    // ← ADD EMAIL FUNCTIONALITY HERE (after successful booking)
    // Prepare booking details for email
    const bookingDetails = {
      eventName: event.title,
      eventDate: dateObj,
      eventTime: "To be announced", // Add actual time if you have it in your event model
      eventVenue: event.location,
      ticketCount: seats.length,
      totalAmount: totalPrice || seats.length * (event.price || 0),
      bookingId: booking._id
    };

    // Send booking confirmation email (non-blocking)
    sendBookingConfirmation(user.email, bookingDetails).catch(err => 
      console.error('Failed to send booking confirmation email:', err)
    );

    res.json({
      message: "Booking successful! Confirmation email sent.",
      booking: booking,
      event: {
        ...event.toObject(),
        dates: event.dates.map(d => d.toISOString()),
        seatsPerDate: event.seatsPerDate || {},
        bookedSeats: event.bookedSeats || {},
      },
    });
  } catch (err) {
    console.error("Booking error:", err);
    res.status(400).json({ message: err.message });
  }
};