// import dotenv from 'dotenv';
// import express from 'express';
// import cors from 'cors';
// import connectDB from './config/db.js';
// import userRoutes from './routes/userRoutes.js';
// import eventRoutes from './routes/eventRoutes.js';
// import path from 'path';
// import { json } from 'stream/consumers';

// dotenv.config();

// const app = express();
// connectDB();

// // Middlewares
// app.use(cors());
// app.use(express.json());

// // Test route
// app.get('/', (req, res) => res.send('Ticket Booking Backend Running'));
// app.use('/api/users',userRoutes);
// app.use('/api/events', (req, res, next) => {
//   console.log("Event route hit:", req.method, req.url);
//   next();
// }, eventRoutes);
// app.use("/uploads", express.static(path,json(process.cwd(),"uploads")));


// // Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// import dotenv from 'dotenv';
// import express from 'express';
// import cors from 'cors';
// import connectDB from './config/db.js';
// import userRoutes from './routes/userRoutes.js';
// import eventRoutes from './routes/eventRoutes.js';
// import path from 'path';
// import bookingRoutes from './routes/bookingRoutes.js'

// dotenv.config();  

// const app = express();
// connectDB();

// // Middlewares
// app.use(cors());
// app.use(express.json());

// // Test route
// app.get('/', (req, res) => res.send('Ticket Booking Backend Running'));

// // Routes
// app.use('/api/users', userRoutes);
// app.use('/api/events', (req, res, next) => {
//   console.log("Event route hit:", req.method, req.url);
//   next();
// }, eventRoutes);
// app.use("/api/bookings", bookingRoutes);



// app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (req, res) => res.send("Ticket Booking Backend Running"));

app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
