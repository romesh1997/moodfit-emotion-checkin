import { useState } from 'react';
import type { Billing, Plan } from '../lib/membership';
import { saveMembership } from '../lib/membership';
import './CheckoutModal.css';

interface CheckoutModalProps {
  plan: Plan;
  billing: Billing;
  price: number;
  onClose: () => void;
  onSubscribed: () => void;
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export default function CheckoutModal({ plan, billing, price, onClose, onSubscribed }: CheckoutModalProps) {
  const [name, setName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [status, setStatus] = useState<'form' | 'processing' | 'success'>('form');

  const cardDigits = cardNumber.replace(/\D/g, '');
  const isValid = name.trim().length > 1 && cardDigits.length === 16 && expiry.length === 5 && cvc.length >= 3;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setStatus('processing');
    setTimeout(() => {
      saveMembership(plan, billing);
      setStatus('success');
    }, 900);
  }

  return (
    <div className="checkout-overlay" role="dialog" aria-modal="true">
      <div className="checkout-modal">
        {status !== 'success' && (
          <button className="checkout-close" onClick={onClose} aria-label="Close checkout">
            ×
          </button>
        )}

        {status === 'success' ? (
          <div className="checkout-success">
            <div className="checkout-success-icon">✓</div>
            <h3 className="checkout-success-title">You're subscribed to {plan.name}</h3>
            <p className="checkout-success-text">
              £{price}/{billing === 'monthly' ? 'mo' : 'yr'} — this is a demo checkout, no real payment was made.
            </p>
            <button className="checkin-primary-btn" onClick={onSubscribed}>
              Done
            </button>
          </div>
        ) : (
          <>
            <h3 className="checkout-title">Checkout</h3>
            <p className="checkout-summary">
              {plan.name} plan · £{price}/{billing === 'monthly' ? 'mo' : 'yr'}
            </p>

            <form className="checkout-form" onSubmit={handleSubmit}>
              <label className="checkout-label">
                Name on card
                <input
                  className="checkout-input"
                  type="text"
                  placeholder="Jamie Lee"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>

              <label className="checkout-label">
                Card number
                <input
                  className="checkout-input"
                  type="text"
                  inputMode="numeric"
                  placeholder="4242 4242 4242 4242"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                />
              </label>

              <div className="checkout-row">
                <label className="checkout-label">
                  Expiry
                  <input
                    className="checkout-input"
                    type="text"
                    inputMode="numeric"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  />
                </label>
                <label className="checkout-label">
                  CVC
                  <input
                    className="checkout-input"
                    type="text"
                    inputMode="numeric"
                    placeholder="123"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  />
                </label>
              </div>

              <button className="checkin-primary-btn" type="submit" disabled={!isValid || status === 'processing'}>
                {status === 'processing' ? 'Processing…' : `Confirm payment · £${price}`}
              </button>
              <p className="checkout-disclaimer">Demo checkout only — no card data is sent anywhere.</p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
