import type { GymClass } from '../lib/classes';
import './BookingConfirmation.css';

interface BookingConfirmationProps {
  gymClass: GymClass;
  onBackToClasses: () => void;
  onViewBookings: () => void;
}

export default function BookingConfirmation({ gymClass, onBackToClasses, onViewBookings }: BookingConfirmationProps) {
  return (
    <div className="session-card">
      <div className="session-complete-icon">✓</div>
      <h2 className="session-complete-title">You're booked!</h2>
      <p className="session-complete-text">You're all set for {gymClass.title}.</p>

      <div className="booking-receipt">
        <div className="booking-receipt-row">
          <span className="booking-receipt-label">Class</span>
          <span className="booking-receipt-value">{gymClass.title}</span>
        </div>
        <div className="booking-receipt-row">
          <span className="booking-receipt-label">When</span>
          <span className="booking-receipt-value">{gymClass.day} · {gymClass.time}</span>
        </div>
        <div className="booking-receipt-row">
          <span className="booking-receipt-label">Instructor</span>
          <span className="booking-receipt-value">{gymClass.instructor}</span>
        </div>
        <div className="booking-receipt-row">
          <span className="booking-receipt-label">Location</span>
          <span className="booking-receipt-value">{gymClass.location}</span>
        </div>
      </div>

      <div className="rec-tags">
        <span className="rec-tag rec-tag--intensity">{gymClass.intensity} intensity</span>
        <span className="rec-tag rec-tag--duration">{gymClass.durationMinutes} min</span>
      </div>

      <div className="rec-actions">
        <button className="checkin-primary-btn" onClick={onViewBookings}>
          View my bookings
        </button>
        <button className="checkin-secondary-btn" onClick={onBackToClasses}>
          Back to classes
        </button>
      </div>
    </div>
  );
}
