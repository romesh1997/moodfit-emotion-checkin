import { useState } from 'react';
import { CLASSES, type GymClass } from '../lib/classes';
import { loadBookings, saveBooking, isBooked, type Booking } from '../lib/bookings';
import './Classes.css';

interface ClassesProps {
  onBooked?: (gymClass: GymClass) => void;
  onViewBookings?: () => void;
}

export default function Classes({ onBooked, onViewBookings }: ClassesProps) {
  const [bookings, setBookings] = useState<Booking[]>(() => loadBookings());

  function handleBook(gymClass: GymClass) {
    setBookings(saveBooking(gymClass.id));
    onBooked?.(gymClass);
  }

  const bookedCount = bookings.length;

  return (
    <div className="classes-card">
      <div className="classes-header">
        <h2 className="classes-title">Classes</h2>
        <p className="classes-subtitle">Book a studio session that fits your week.</p>
      </div>

      {bookedCount > 0 && (
        <button className="classes-booked-strip" onClick={onViewBookings}>
          You have {bookedCount} {bookedCount === 1 ? 'class' : 'classes'} booked this week — view bookings →
        </button>
      )}

      <div className="classes-grid">
        {CLASSES.map((gymClass) => {
          const booked = isBooked(gymClass.id, bookings);
          const spotsLeft = Math.max(gymClass.spotsTotal - (booked ? 1 : 0), 0);

          return (
            <div key={gymClass.id} className="class-card">
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
                <span className="class-spots">{spotsLeft} spots left</span>
                <button
                  className={booked ? 'class-book-btn class-book-btn--booked' : 'class-book-btn'}
                  disabled={booked}
                  onClick={() => handleBook(gymClass)}
                >
                  {booked ? 'Booked ✓' : 'Book class'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
