import type { MoodState } from '../components/MoodOrb';
import type { Intensity } from './recommendation';

export interface CompletedSession {
  title: string;
  intensity: Intensity;
  durationMinutes: number;
  moodState: MoodState;
  completedAt: string; // ISO date string
}

/** Save a completed workout session to localStorage. */
export function saveCompletedSession(session: CompletedSession): void {
  try {
    const stored = localStorage.getItem('moodfit_sessions');
    const sessions: CompletedSession[] = stored ? JSON.parse(stored) : [];
    sessions.push(session);
    localStorage.setItem('moodfit_sessions', JSON.stringify(sessions));
  } catch {
    // localStorage unavailable — nothing to do, completion still shows in the UI.
  }
}
