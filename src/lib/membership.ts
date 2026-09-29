export type Billing = 'monthly' | 'annual';

export interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  tagline: string;
  features: string[];
  highlight?: boolean;
}

export interface ActiveMembership {
  planId: string;
  planName: string;
  price: number;
  billing: Billing;
  subscribedAt: string; // ISO date string
}

export const PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    monthlyPrice: 15,
    annualPrice: 144,
    tagline: 'Get moving with essential access.',
    features: ['App-guided check-ins', '2 studio classes / month', 'Community support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 35,
    annualPrice: 336,
    tagline: 'Unlimited classes for regular training.',
    features: ['Everything in Basic', 'Unlimited studio classes', 'Priority booking', 'Weekly progress insights'],
    highlight: true,
  },
  {
    id: 'elite',
    name: 'Elite',
    monthlyPrice: 59,
    annualPrice: 564,
    tagline: 'Full access with dedicated coaching.',
    features: ['Everything in Pro', '1:1 monthly coaching session', 'Personalised programming', 'Guest passes'],
  },
];

/** Load the active membership (if any) from localStorage. */
export function loadMembership(): ActiveMembership | null {
  try {
    const stored = localStorage.getItem('moodfit_membership');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/** Save the active membership to localStorage. */
export function saveMembership(plan: Plan, billing: Billing): ActiveMembership {
  const membership: ActiveMembership = {
    planId: plan.id,
    planName: plan.name,
    price: billing === 'monthly' ? plan.monthlyPrice : plan.annualPrice,
    billing,
    subscribedAt: new Date().toISOString(),
  };
  localStorage.setItem('moodfit_membership', JSON.stringify(membership));
  return membership;
}

/** Clear the active membership from localStorage. */
export function clearMembership(): void {
  localStorage.removeItem('moodfit_membership');
}
