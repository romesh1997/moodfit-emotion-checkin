export interface Booking {
  classId: string;
  timestamp: string; // ISO date string
}

/** Load booked classes from localStorage. */
export function loadBookings(): Booking[] {
  try {
    const stored = localStorage.getItem('moodfit_bookings');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/** Save a class booking to localStorage. */
export function saveBooking(classId: string): Booking[] {
  const bookings = loadBookings();
  bookings.push({ classId, timestamp: new Date().toISOString() });
  localStorage.setItem('moodfit_bookings', JSON.stringify(bookings));
  return bookings;
}

export function isBooked(classId: string, bookings: Booking[]): boolean {
  return bookings.some((b) => b.classId === classId);
}

/** Cancel a class booking, removing it from localStorage. */
export function cancelBooking(classId: string): Booking[] {
  const remaining = loadBookings().filter((b) => b.classId !== classId);
  localStorage.setItem('moodfit_bookings', JSON.stringify(remaining));
  return remaining;
}
