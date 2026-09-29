import { useState } from 'react';
import MoodOrb, { STATE_LABELS, type MoodState } from './MoodOrb';
import { getAlternativeRecommendation, type SessionRecommendation } from '../lib/recommendation';
import './AdaptiveRecommendation.css';

interface AdaptiveRecommendationProps {
  state: MoodState;
  confidence?: number;
  recommendation: SessionRecommendation;
  onCheckInAgain: () => void;
  onViewTimeline?: () => void;
  onStartWorkout: (recommendation: SessionRecommendation) => void;
}

export default function AdaptiveRecommendation({
  state,
  confidence = 0.7,
  recommendation,
  onCheckInAgain,
  onViewTimeline,
  onStartWorkout,
}: AdaptiveRecommendationProps) {
  const [showWhy, setShowWhy] = useState(false);
  const [rec, setRec] = useState<SessionRecommendation>(recommendation);

  function handleSeeOtherOptions() {
    setRec((current) => getAlternativeRecommendation(state, current.title));
  }

  return (
    <div className="recommendation-card">
      <div className="rec-header">
        <h2 className="rec-greeting">Let's go with something short and engaging.</h2>
      </div>

      <div className="rec-state-row">
        <MoodOrb state={state} size={56} />
        <div className="rec-state-info">
          <p className="rec-state-label-small">DETECTED MOOD · {Math.round(confidence * 100)}% CONFIDENCE</p>
          <p className="rec-state-label-large">{STATE_LABELS[state]}</p>
        </div>
      </div>

      <div className="rec-session-card">
        <div className="rec-session-header">
          <h3 className="rec-session-title">{rec.title}</h3>
        </div>
        <div className="rec-tags">
          <span className="rec-tag rec-tag--intensity">{rec.intensity} intensity</span>
          <span className="rec-tag rec-tag--duration">{rec.durationMinutes} min</span>
        </div>
        <p className="rec-session-desc">{rec.description}</p>
        <button className="rec-start-btn" onClick={() => onStartWorkout(rec)}>Start Workout</button>
      </div>

      <button className="rec-why-toggle" onClick={() => setShowWhy((v) => !v)}>
        {showWhy ? 'Hide' : 'Why this suggestion?'}
      </button>

      {showWhy && (
        <div className="rec-why-panel">
          <p className="rec-why-label">WHY THIS SUGGESTION</p>
          <p className="rec-why-text">{rec.why}</p>
        </div>
      )}

      <button className="rec-alternatives" onClick={handleSeeOtherOptions}>
        Not feeling this? See other options
      </button>

      <div className="rec-actions">
        <button className="checkin-secondary-btn" onClick={onCheckInAgain}>
          Check in again
        </button>
        {onViewTimeline && (
          <button className="checkin-secondary-btn" onClick={onViewTimeline}>
            View timeline
          </button>
        )}
      </div>
    </div>
  );
}
