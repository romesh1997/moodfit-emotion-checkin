import { useState } from 'react';
import { loadBookings, cancelBooking, type Booking } from '../lib/bookings';
import { getClassById } from '../lib/classes';
import './MyBookings.css';

interface MyBookingsProps {
  onBackToClasses: () => void;
}

export default function MyBookings({ onBackToClasses }: MyBookingsProps) {
  const [bookings, setBookings] = useState<Booking[]>(() => loadBookings());

  function handleCancel(classId: string) {
    setBookings(cancelBooking(classId));
  }

  const entries = bookings
    .map((booking) => ({ booking, gymClass: getClassById(booking.classId) }))
    .filter((entry): entry is { booking: Booking; gymClass: NonNullable<ReturnType<typeof getClassById>> } => Boolean(entry.gymClass));

  return (
    <div className="classes-card">
      <div className="classes-header">
        <h2 className="classes-title">My Bookings</h2>
        <p className="classes-subtitle">Everything you've booked this week.</p>
      </div>

      {entries.length === 0 ? (
        <div className="bookings-empty">
          <p className="bookings-empty-text">No classes booked yet.</p>
          <button className="checkin-secondary-btn" onClick={onBackToClasses}>
            Browse classes
          </button>
        </div>
      ) : (
        <div className="classes-grid">
          {entries.map(({ booking, gymClass }) => (
            <div key={booking.classId} className="class-card">
              <div className="class-card-header">
                <span className="class-tag">{gymClass.category}</span>
                <span className="class-tag class-tag--intensity">{gymClass.intensity}</span>
              </div>

              <h3 className="class-title">{gymClass.title}</h3>
              <p className="class-meta">
                {gymClass.day} · {gymClass.time} · {gymClass.durationMinutes} min
              </p>
              <p className="class-meta">
                {gymClass.instructor} · {gymClass.location}
              </p>

              <div className="class-card-footer">
                <span className="class-spots">Booked</span>
                <button className="class-cancel-btn" onClick={() => handleCancel(gymClass.id)}>
                  Cancel booking
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
