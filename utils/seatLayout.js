import { dateKey } from "./dateKey.js";

// Seat rows are lettered A–Z with up to 10 seats each, so a show holds at most 260 seats.
export const MAX_CAPACITY = 260;

// Fixed seats per show. Older events only had ticketsAvailable (which used to shrink on every booking),
// so it's only a fallback until scripts/migrateCapacity.js has filled in `capacity`.
export const capacityOf = (event) => Number(event?.capacity) || Number(event?.ticketsAvailable) || 50;

// Same layout the seat map draws (EventCard.tsx): rows A, B, C… and seats 1..perRow.
export const seatLabels = (capacity) => {
  const perRow = Math.min(10, Math.ceil(Math.sqrt(capacity * 1.2)));
  const labels = [];
  for (let r = 0; labels.length < capacity; r++) {
    const row = String.fromCharCode(65 + r);
    for (let s = 1; s <= perRow && labels.length < capacity; s++) labels.push(`${row}${s}`);
  }
  return labels;
};

export const bookedOn = (event, date) => {
  const list = event?.bookedSeats?.[dateKey(date)];
  return Array.isArray(list) ? list : [];
};

export const seatsLeftOn = (event, date) => Math.max(capacityOf(event) - bookedOn(event, date).length, 0);

// Makes seatsPerDate / bookedSeats match the event's dates, keyed "YYYY-MM-DD", and
// recomputes seats left from capacity. Keeps bookings for dates that are still listed.
export const syncSeatMaps = (event) => {
  const capacity = capacityOf(event);
  const oldBooked = event.bookedSeats && typeof event.bookedSeats === "object" ? event.bookedSeats : {};
  const bookedSeats = {};
  const seatsPerDate = {};
  for (const d of event.dates || []) {
    const key = dateKey(d);
    // merge any legacy full-ISO key into the short key
    const merged = [...new Set([...(oldBooked[key] || []), ...(oldBooked[new Date(d).toISOString()] || [])])];
    bookedSeats[key] = merged;
    seatsPerDate[key] = Math.max(capacity - merged.length, 0);
  }
  event.bookedSeats = bookedSeats;
  event.seatsPerDate = seatsPerDate;
  if (typeof event.markModified === "function") {
    event.markModified("bookedSeats");
    event.markModified("seatsPerDate");
  }
  return event;
};
