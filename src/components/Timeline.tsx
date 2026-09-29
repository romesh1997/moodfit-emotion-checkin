import { useMemo } from 'react';
import type { MoodState } from './MoodOrb';
import { generateWeeklyInsight, calculateStreak, type CheckInRecord } from '../lib/timeline';
import './Timeline.css';

interface TimelineProps {
  checkIns: CheckInRecord[];
  onCheckInAgain: () => void;
}

export default function Timeline({ checkIns, onCheckInAgain }: TimelineProps) {
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const { weekData, insight, streak } = useMemo(() => {
    const week = generateWeekData(checkIns);
    const insight = generateWeeklyInsight(checkIns);
    const streak = calculateStreak(checkIns);
    return { weekData: week, insight, streak };
  }, [checkIns]);

  return (
    <div className="timeline-card">
      <h2 className="timeline-title">Your Week</h2>
      
      <div className="timeline-grid">
        <div className="timeline-visualization">
          {weekDays.map((day, idx) => (
            <div key={day} className="timeline-day">
              <div className="timeline-orbs">
                {weekData[idx]?.mood && (
                  <div className={`timeline-dot timeline-dot--${weekData[idx].mood}`} />
                )}
              </div>
              {weekData[idx]?.activityBars > 0 && (
                <div className="timeline-bars">
                  {Array.from({ length: weekData[idx].activityBars }).map((_, i) => (
                    <div
                      key={i}
                      className={`timeline-bar timeline-bar--${weekData[idx].mood || 'neutral'}`}
                    />
                  ))}
                </div>
              )}
              <p className="timeline-day-label">{day}</p>
            </div>
          ))}
        </div>

        <div className="timeline-legend">
          <span className="timeline-legend-item">
            <span className="timeline-legend-dot timeline-legend-dot--low" /> Low energy
          </span>
          <span className="timeline-legend-item">
            <span className="timeline-legend-dot timeline-legend-dot--calm" /> Calm
          </span>
          <span className="timeline-legend-item">
            <span className="timeline-legend-dot timeline-legend-dot--balanced" /> Balanced
          </span>
          <span className="timeline-legend-item">
            <span className="timeline-legend-dot timeline-legend-dot--energised" /> Energised
          </span>
        </div>
      </div>

      {insight && (
        <div className="timeline-insight-card">
          <p className="timeline-insight-label">THIS WEEK'S INSIGHT</p>
          <p className="timeline-insight-text">{insight}</p>
        </div>
      )}

      {streak > 0 && (
        <div className="timeline-streak-card">
          <span className="timeline-streak-icon">🔥</span>
          <div className="timeline-streak-content">
            <p className="timeline-streak-label">{streak}-day check-in streak</p>
            <p className="timeline-streak-desc">Checking in daily helps MoodFit learn your patterns</p>
          </div>
        </div>
      )}

      <button className="checkin-secondary-btn" onClick={onCheckInAgain}>
        New check-in
      </button>
    </div>
  );
}

function generateWeekData(checkIns: CheckInRecord[]) {
  const today = new Date();
  const weekData: Array<{ mood?: MoodState; activityBars: number }> = Array(7).fill(null).map(() => ({
    activityBars: 0,
  }));

  checkIns.forEach((record) => {
    const recordDate = new Date(record.timestamp);
    const dayDiff = Math.floor((today.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Only show last 7 days (0-6 days ago)
    if (dayDiff >= 0 && dayDiff < 7) {
      const dayIndex = 6 - dayDiff;
      weekData[dayIndex] = {
        mood: record.state,
        activityBars: (weekData[dayIndex]?.activityBars || 0) + 1,
      };
    }
  });

  return weekData;
}
