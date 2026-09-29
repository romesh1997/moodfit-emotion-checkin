import { useEffect, useRef, useState } from 'react';
import type { MoodState } from './MoodOrb';
import type { SessionRecommendation } from '../lib/recommendation';
import { saveCompletedSession } from '../lib/sessions';
import './WorkoutSession.css';

interface WorkoutSessionProps {
  recommendation: SessionRecommendation;
  state: MoodState;
  onCheckInAgain: () => void;
  onViewTimeline?: () => void;
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function WorkoutSession({ recommendation, state, onCheckInAgain, onViewTimeline }: WorkoutSessionProps) {
  const totalSeconds = recommendation.durationMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [status, setStatus] = useState<'active' | 'complete'>('active');
  const savedRef = useRef(false);

  useEffect(() => {
    if (status !== 'active') return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setStatus('complete');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (status === 'complete' && !savedRef.current) {
      savedRef.current = true;
      saveCompletedSession({
        title: recommendation.title,
        intensity: recommendation.intensity,
        durationMinutes: recommendation.durationMinutes,
        moodState: state,
        completedAt: new Date().toISOString(),
      });
    }
  }, [status, recommendation, state]);

  function handleCompleteNow() {
    setStatus('complete');
  }

  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  if (status === 'complete') {
    return (
      <div className="session-card">
        <div className="session-complete-icon">✓</div>
        <h2 className="session-complete-title">Nice work! You completed {recommendation.title}.</h2>
        <p className="session-complete-text">
          {recommendation.durationMinutes} min · {recommendation.intensity} intensity
        </p>
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

  return (
    <div className="session-card">
      <p className="session-eyebrow">Session in progress</p>
      <h2 className="session-title">{recommendation.title}</h2>
      <div className="rec-tags">
        <span className="rec-tag rec-tag--intensity">{recommendation.intensity} intensity</span>
        <span className="rec-tag rec-tag--duration">{recommendation.durationMinutes} min</span>
      </div>

      <div className="session-timer">{formatTime(secondsLeft)}</div>

      <div className="session-progress-track">
        <div className="session-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <button className="checkin-primary-btn" onClick={handleCompleteNow}>
        Complete workout
      </button>
    </div>
  );
}
