import { useState } from 'react';
import { PLANS, loadMembership, clearMembership, type Billing, type Plan } from '../lib/membership';
import CheckoutModal from './CheckoutModal';
import './Membership.css';

export default function Membership() {
  const [billing, setBilling] = useState<Billing>('monthly');
  const [membership, setMembership] = useState(() => loadMembership());
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null);

  function priceFor(plan: Plan) {
    return billing === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
  }

  function handleCancel() {
    clearMembership();
    setMembership(null);
  }

  function handleSubscribed() {
    setMembership(loadMembership());
    setCheckoutPlan(null);
  }

  return (
    <div className="membership-card">
      <div className="membership-header">
        <h2 className="membership-title">Membership</h2>
        <p className="membership-subtitle">Pick a plan that matches how often you train.</p>
      </div>

      {membership && (
        <div className="membership-current">
          <div>
            <p className="membership-current-label">Current plan</p>
            <p className="membership-current-name">
              {membership.planName} · £{membership.price}/{membership.billing === 'monthly' ? 'mo' : 'yr'}
            </p>
          </div>
          <button className="checkin-secondary-btn" onClick={handleCancel}>
            Cancel membership
          </button>
        </div>
      )}

      <div className="billing-toggle">
        <button
          className={billing === 'monthly' ? 'segment segment--active' : 'segment'}
          onClick={() => setBilling('monthly')}
        >
          Monthly
        </button>
        <button
          className={billing === 'annual' ? 'segment segment--active' : 'segment'}
          onClick={() => setBilling('annual')}
        >
          Annual (save 20%)
        </button>
      </div>

      <div className="plans-grid">
        {PLANS.map((plan) => {
          const isCurrent = membership?.planId === plan.id;
          return (
            <div key={plan.id} className={plan.highlight ? 'plan-card plan-card--highlight' : 'plan-card'}>
              {plan.highlight && <span className="plan-ribbon">Most popular</span>}
              <h3 className="plan-name">{plan.name}</h3>
              <p className="plan-price">
                £{priceFor(plan)}
                <span className="plan-price-period">/{billing === 'monthly' ? 'mo' : 'yr'}</span>
              </p>
              <p className="plan-tagline">{plan.tagline}</p>
              <ul className="plan-features">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <button
                className={plan.highlight ? 'plan-choose-btn plan-choose-btn--highlight' : 'plan-choose-btn'}
                disabled={isCurrent}
                onClick={() => setCheckoutPlan(plan)}
              >
                {isCurrent ? 'Current plan' : 'Choose plan'}
              </button>
            </div>
          );
        })}
      </div>

      {checkoutPlan && (
        <CheckoutModal
          plan={checkoutPlan}
          billing={billing}
          price={priceFor(checkoutPlan)}
          onClose={() => setCheckoutPlan(null)}
          onSubscribed={handleSubscribed}
        />
      )}
    </div>
  );
}
