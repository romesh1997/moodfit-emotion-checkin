import './MoodOrb.css';

export type MoodState = 'low' | 'calm' | 'balanced' | 'energised';

const STATE_LABELS: Record<MoodState, string> = {
  low: 'Low energy',
  calm: 'Calm',
  balanced: 'Balanced',
  energised: 'Energised',
};

interface MoodOrbProps {
  state?: MoodState;
  size?: number;
  pulsing?: boolean;
}

/**
 * The recurring "mood orb" visual metaphor from the MoodFit Figma prototype:
 * a soft radial gradient that blends calm teal toward energising coral,
 * shifting per detected mood state.
 */
export default function MoodOrb({ state = 'balanced', size = 160, pulsing = false }: MoodOrbProps) {
  return (
    <div className="mood-orb-wrap" style={{ width: size, height: size }}>
      <div
        className={`mood-orb mood-orb--${state} ${pulsing ? 'mood-orb--pulsing' : ''}`}
        style={{ width: size, height: size }}
        role="img"
        aria-label={`Mood orb showing ${STATE_LABELS[state]} state`}
      />
    </div>
  );
}

export { STATE_LABELS };
