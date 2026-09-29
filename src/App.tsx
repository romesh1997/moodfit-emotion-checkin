import { useState, useEffect } from 'react';
import EmotionCheckIn from './components/EmotionCheckIn';
import AdaptiveRecommendation from './components/AdaptiveRecommendation';
import Timeline from './components/Timeline';
import Classes from './components/Classes';
import Membership from './components/Membership';
import WorkoutSession from './components/WorkoutSession';
import BookingConfirmation from './components/BookingConfirmation';
import MyBookings from './components/MyBookings';
import type { MoodState } from './components/MoodOrb';
import { saveCheckIn, loadCheckInHistory, type CheckInRecord } from './lib/timeline';
import { getRecommendation, type SessionRecommendation } from './lib/recommendation';
import type { GymClass } from './lib/classes';
import './App.css';

type AppScreen =
  | 'check-in'
  | 'recommendation'
  | 'workout-session'
  | 'timeline'
  | 'classes'
  | 'booking-confirmation'
  | 'my-bookings'
  | 'membership';

/** Which bottom tab should highlight for screens that aren't a tab's primary screen. */
const TAB_FOR_SCREEN: Partial<Record<AppScreen, AppScreen>> = {
  recommendation: 'check-in',
  'workout-session': 'check-in',
  'booking-confirmation': 'classes',
  'my-bookings': 'classes',
};

interface DetectedCheckIn {
  state: MoodState;
  source: 'face' | 'text';
  confidence: number;
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('check-in');
  const [checkInKey, setCheckInKey] = useState(0);
  const [detectedState, setDetectedState] = useState<DetectedCheckIn | null>(null);
  const [checkInHistory, setCheckInHistory] = useState<CheckInRecord[]>([]);
  const [recommendation, setRecommendation] = useState<SessionRecommendation | null>(null);
  const [activeSessionRec, setActiveSessionRec] = useState<SessionRecommendation | null>(null);
  const [bookedClass, setBookedClass] = useState<GymClass | null>(null);

  // Load check-in history on mount
  useEffect(() => {
    const history = loadCheckInHistory();
    setCheckInHistory(history);
  }, []);

  function handleCheckInComplete(result: DetectedCheckIn) {
    // Pick a recommendation before saving, so rotation compares against prior history only.
    const rec = getRecommendation(result.state, checkInHistory);

    const record: CheckInRecord = {
      timestamp: new Date().toISOString(),
      state: result.state,
      source: result.source,
      confidence: result.confidence,
      lastSessionTitle: rec.title,
    };
    const updated = saveCheckIn(record);
    setCheckInHistory(updated);

    setRecommendation(rec);
    setDetectedState(result);
    setCurrentScreen('recommendation');
  }

  function handleCheckInAgain() {
    setDetectedState(null);
    setRecommendation(null);
    setCurrentScreen('check-in');
    setCheckInKey((k) => k + 1);
  }

  function handleViewTimeline() {
    setCurrentScreen('timeline');
  }

  function handleStartWorkout(rec: SessionRecommendation) {
    setActiveSessionRec(rec);
    setCurrentScreen('workout-session');
  }

  function handleClassBooked(gymClass: GymClass) {
    setBookedClass(gymClass);
    setCurrentScreen('booking-confirmation');
  }

  function handleViewBookings() {
    setCurrentScreen('my-bookings');
  }

  function handleBackToClasses() {
    setCurrentScreen('classes');
  }

  const tabs: Array<{ screen: AppScreen; label: string; icon: string; onClick: () => void }> = [
    { screen: 'check-in', label: 'Check-in', icon: '◎', onClick: () => setCurrentScreen('check-in') },
    { screen: 'classes', label: 'Classes', icon: '▤', onClick: () => setCurrentScreen('classes') },
    { screen: 'membership', label: 'Membership', icon: '★', onClick: () => setCurrentScreen('membership') },
    { screen: 'timeline', label: 'Timeline', icon: '◷', onClick: handleViewTimeline },
  ];

  const activeTabScreen = TAB_FOR_SCREEN[currentScreen] ?? currentScreen;

  return (
    <div className="app-shell">
      <div className="app-header">
        <div className="app-brand">
          <span className="app-brand-mark" aria-hidden="true" />
          MoodFit
        </div>
      </div>

      <div className="app-content">
        {currentScreen === 'check-in' && (
          <EmotionCheckIn
            key={checkInKey}
            userName="Romesh"
            onComplete={handleCheckInComplete}
          />
        )}

        {currentScreen === 'recommendation' && detectedState && recommendation && (
          <AdaptiveRecommendation
            state={detectedState.state}
            confidence={detectedState.confidence}
            recommendation={recommendation}
            onCheckInAgain={handleCheckInAgain}
            onViewTimeline={handleViewTimeline}
            onStartWorkout={handleStartWorkout}
          />
        )}

        {currentScreen === 'workout-session' && detectedState && activeSessionRec && (
          <WorkoutSession
            recommendation={activeSessionRec}
            state={detectedState.state}
            onCheckInAgain={handleCheckInAgain}
            onViewTimeline={handleViewTimeline}
          />
        )}

        {currentScreen === 'timeline' && (
          <Timeline
            checkIns={checkInHistory}
            onCheckInAgain={handleCheckInAgain}
          />
        )}

        {currentScreen === 'classes' && (
          <Classes onBooked={handleClassBooked} onViewBookings={handleViewBookings} />
        )}

        {currentScreen === 'booking-confirmation' && bookedClass && (
          <BookingConfirmation
            gymClass={bookedClass}
            onBackToClasses={handleBackToClasses}
            onViewBookings={handleViewBookings}
          />
        )}

        {currentScreen === 'my-bookings' && <MyBookings onBackToClasses={handleBackToClasses} />}

        {currentScreen === 'membership' && <Membership />}
      </div>

      <div className="app-tabbar">
        {tabs.map((tab) => (
          <button
            key={tab.screen}
            className={`app-tab-btn ${activeTabScreen === tab.screen ? 'active' : ''}`}
            onClick={tab.onClick}
          >
            <span className="app-tab-icon" aria-hidden="true">{tab.icon}</span>
            <span className="app-tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
