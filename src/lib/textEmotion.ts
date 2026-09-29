import type { MoodState } from '../components/MoodOrb';

/**
 * MVP lexicon-based classifier for the text check-in fallback described in
 * Section 2, Objective 2 of the proposal ("a text-based check-in as a
 * fallback and cross-check"). Keyword matching is a deliberately simple
 * starting point for the prototype; a proper NLP/sentiment model is a
 * candidate improvement to discuss in Section 8 (Recommendations for
 * Further Work) if time allows.
 */
const LEXICON: Record<MoodState, string[]> = {
  low: [
    'tired', 'exhausted', 'drained', 'sad', 'down', 'stressed',
    'anxious', 'overwhelmed', 'flat', 'low', 'burnt out', 'burned out',
    'long day', 'rough day', 'busy day', 'hard day', 'tough day',
  ],
  calm: [
    'calm', 'relaxed', 'chill', 'peaceful', 'steady', 'content', 'settled',
  ],
  balanced: [
    'okay', 'ok', 'fine', 'normal', 'alright', 'neutral', 'so-so', 'meh',
  ],
  energised: [
    'excited', 'pumped', 'energised', 'energized', 'great', 'motivated',
    'happy', 'good', 'ready', 'strong',
  ],
};

export function classifyText(input: string): { state: MoodState; confidence: number } {
  const text = input.toLowerCase();
  const scores: Record<MoodState, number> = { low: 0, calm: 0, balanced: 0, energised: 0 };

  (Object.keys(LEXICON) as MoodState[]).forEach((state) => {
    LEXICON[state].forEach((word) => {
      if (text.includes(word)) scores[state] += 1;
    });
  });

  const entries = Object.entries(scores) as Array<[MoodState, number]>;
  const total = entries.reduce((sum, [, v]) => sum + v, 0);

  if (total === 0) {
    return { state: 'balanced', confidence: 0.2 }; // no keyword match -> low-confidence neutral
  }

  const [topState, topScore] = entries.reduce((best, e) => (e[1] > best[1] ? e : best));
  return { state: topState, confidence: Math.min(1, topScore / total) };
}
