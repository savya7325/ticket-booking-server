# Evenza API: Ticket Booking Server

REST API behind **[Evenza](https://evenza-tickets.vercel.app)**, an event ticket booking app. Handles auth with user / admin roles, events with per-date seat capacity, bookings, the contact form and email notifications.

**🔗 Live app: [evenza-tickets.vercel.app](https://evenza-tickets.vercel.app)** · **Frontend repo: [event-ticket-frontend](https://github.com/savya7325/event-ticket-frontend)**

Demo logins (user and admin) are listed in the [frontend README](https://github.com/savya7325/event-ticket-frontend#try-it).

## Tech stack

Node.js · Express 5 · MongoDB Atlas with Mongoose · JWT · bcrypt · Multer · Nodemailer (Gmail) · deployed on Render

## Highlights

- **Roles:** JWT auth; `role: 1` admin, `role: 2` user. Admin routes are protected server-side, and the role is always read from the database, not trusted from the token.
- **Seating:** each event has a fixed `capacity`; seats are tracked per show date, seat labels are validated against the real seat layout, double bookings are rejected, and cancelling frees the seats for that date only.
- **Emails:** booking confirmations, welcome emails, and contact-form messages delivered to the admin (Reply-To set to the sender) with an automatic reply to the visitor.
- **Contact form protection:** honeypot field and a per-IP rate limit (5 messages per 10 minutes).

## API overview

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | `/api/users/register` | Public | Create an account |
| POST | `/api/users/login` | Public | Log in, returns a JWT |
| GET / PUT | `/api/users/profile` | User | Get / update profile |
| PUT / DELETE | `/api/users/profile/avatar` | User | Upload / remove profile photo |
| GET | `/api/events` | Public | List events (filters: `location`, `maxPrice`, `date`) |
| GET | `/api/events/:id` | Public | Event details |
| POST | `/api/events` | Admin | Create event (multipart, `image`) |
| PUT / DELETE | `/api/events/:id` | Admin | Update / delete event |
| POST | `/api/events/:id/book` | User | Book seats for a show date |
| GET | `/api/bookings/mybookings` | User | Your bookings |
| GET | `/api/bookings` | Admin | All bookings |
| DELETE | `/api/bookings/:id` | Admin | Cancel a booking and free its seats |
| GET | `/api/admin/stats` | Admin | Data for the admin dashboard |
| POST | `/api/contact` | Public | Send a contact-form message |
| GET | `/api/contact` | Admin | List contact messages |

## Run it locally

```bash
git clone https://github.com/savya7325/ticket-booking-server.git
cd ticket-booking-server
npm install
```

Create a `.env` file (never commit it):

```bash
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=a-long-random-string
ADMIN_SECRET=another-long-random-string
PORT=5000
BASE_URL=http://localhost:5000

# Gmail account used to send emails (needs an App Password)
EMAIL_USER=you@gmail.com
EMAIL_APP_PASSWORD=your-16-letter-app-password
EMAIL_FROM="Evenza <you@gmail.com>"

# Optional: where contact-form messages go
CONTACT_INBOX=you@gmail.com
```

Then start it:

```bash
npm run dev   # with auto-reload (nodemon)
# or
npm start
```

## Scripts

| Command | What it does |
|---|---|
| `node scripts/migrateCapacity.js [--apply]` | One-off: give older events a fixed capacity and per-date seat maps |
| `node scripts/migrateRoles.js` | One-off: convert legacy `"admin"` / `"user"` roles to `1` / `2` |
| `node scripts/resetDemoData.js --save` | Snapshot the current events as the clean demo set |
| `node scripts/resetDemoData.js [--apply]` | Restore the demo: snapshot events, remove demo bookings and extra events, reset demo accounts |

## Notes

- Render's free plan sleeps after ~15 minutes idle; the first request then takes up to ~50 seconds.
- Uploaded files live on the server's disk, which isn't persistent on Render's free plan.
