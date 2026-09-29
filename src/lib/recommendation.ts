import type { MoodState } from '../components/MoodOrb';
import type { CheckInRecord } from './timeline';

export type Intensity = 'Low' | 'Moderate' | 'High';

export interface SessionRecommendation {
  title: string;
  durationMinutes: number;
  intensity: Intensity;
  description: string;
  /** Plain-language justification shown in the "Why this suggestion" panel (Figma Figure 2). */
  why: string;
}

/**
 * MVP recommendation logic (proposal Objective 3): each mood state maps to a
 * short rotation of sessions rather than a single fixed one, so the same
 * check-in state doesn't always return the same session (see Section 8,
 * Recommendations for Further Work). Selection below is still a simple
 * history-based rotation, not a learned/personalised recommender — that
 * remains a deliberate, honest MVP scope choice.
 *
 * Each entry's `why` text is surfaced verbatim in the "Why this suggestion"
 * panel, in line with the proposal's transparency/explainability commitment
 * (Section 8, Ethical, Legal and Professional Considerations).
 */
const RECOMMENDATIONS: Record<MoodState, SessionRecommendation[]> = {
  low: [
    {
      title: 'Gentle Recovery Yoga',
      durationMinutes: 15,
      intensity: 'Low',
      description: 'Slow, restorative stretches and breathwork to ease tension without draining you further.',
      why: 'Your check-in suggested low energy right now, so we picked something restorative and low-impact rather than a high-intensity session — the goal is to keep you moving without adding to how drained you feel.',
    },
    {
      title: 'Slow Flow Stretch',
      durationMinutes: 10,
      intensity: 'Low',
      description: 'A short, gentle stretch sequence for tight muscles and a quiet mind.',
      why: 'Still a low-energy signal, so we kept the intensity low — this time a shorter, more focused stretch session as a lighter alternative to a full yoga flow.',
    },
    {
      title: 'Mindful Walk & Breathe',
      durationMinutes: 20,
      intensity: 'Low',
      description: 'An easy-paced walking session paired with guided breathing cues.',
      why: 'Low energy again, so we swapped in a gentle walking session — some movement and fresh air without any real physical strain.',
    },
  ],
  calm: [
    {
      title: 'Steady Mobility Flow',
      durationMinutes: 25,
      intensity: 'Moderate',
      description: 'A steady, well-paced mobility routine to keep joints loose and energy even.',
      why: 'Your check-in suggested a calm, settled state, so we picked a steady, moderate-paced session that matches that energy rather than something that spikes intensity unnecessarily.',
    },
    {
      title: 'Balanced Core & Breath',
      durationMinutes: 20,
      intensity: 'Moderate',
      description: 'Core-focused work at a controlled pace, with breathing cues throughout.',
      why: 'Still a calm, settled signal, so we kept the pacing moderate — this time a core-focused alternative for some variety.',
    },
    {
      title: 'Pilates Fundamentals',
      durationMinutes: 30,
      intensity: 'Moderate',
      description: 'Controlled, low-impact strength work suited to an even, settled mood.',
      why: 'Calm energy again, so we rotated in Pilates fundamentals — same steady intensity, different focus so sessions don’t feel repetitive.',
    },
  ],
  balanced: [
    {
      title: 'Full-Body Strength Basics',
      durationMinutes: 30,
      intensity: 'Moderate',
      description: 'A well-rounded strength circuit covering upper body, lower body and core.',
      why: 'Your check-in didn’t show a strong signal either way, so we picked a standard, well-rounded session — a safe default when there’s no clear indication you need something gentler or more energising.',
    },
    {
      title: 'Mixed Cardio & Strength',
      durationMinutes: 25,
      intensity: 'Moderate',
      description: 'Alternating cardio bursts and strength moves for a balanced full-body session.',
      why: 'Still a balanced, no-strong-signal check-in, so we rotated in a mixed cardio/strength session for variety while keeping the same moderate intensity.',
    },
  ],
  energised: [
    {
      title: 'High-Intensity Interval Training',
      durationMinutes: 30,
      intensity: 'High',
      description: 'Fast-paced intervals of high-effort work and short recovery, built to match high energy.',
      why: 'Your check-in suggested you’re feeling energised, so we picked a higher-intensity session to match that — this is when you’re most likely to get the most out of pushing harder.',
    },
    {
      title: 'Power Circuit Training',
      durationMinutes: 25,
      intensity: 'High',
      description: 'Explosive strength-and-power moves in a fast circuit format.',
      why: 'Energised again, so we swapped in a power circuit — still high intensity, but a different session so it doesn’t feel like the same workout every time.',
    },
    {
      title: 'Cardio Blast',
      durationMinutes: 20,
      intensity: 'High',
      description: 'A short, all-out cardio session designed to make the most of a high-energy state.',
      why: 'High energy detected again, so we rotated in a shorter cardio blast as an alternative to interval training or power circuits.',
    },
  ],
};

/**
 * Picks a session for the given mood state, preferring one that wasn't the
 * most recent session shown for that same state — so repeat check-ins in the
 * same mood don't always surface the identical recommendation.
 */
export function getRecommendation(
  state: MoodState,
  history: CheckInRecord[] = []
): SessionRecommendation {
  const options = RECOMMENDATIONS[state];
  const lastTitleForState = [...history]
    .reverse()
    .find((record) => record.state === state)?.lastSessionTitle;

  if (!lastTitleForState) return options[0];

  const nextIndex = options.findIndex((opt) => opt.title === lastTitleForState);
  return options[(nextIndex + 1) % options.length] ?? options[0];
}

/** Returns the next alternative session for "See other options", cycling through the rotation. */
export function getAlternativeRecommendation(
  state: MoodState,
  currentTitle: string
): SessionRecommendation {
  const options = RECOMMENDATIONS[state];
  const currentIndex = options.findIndex((opt) => opt.title === currentTitle);
  return options[(currentIndex + 1) % options.length];
}
