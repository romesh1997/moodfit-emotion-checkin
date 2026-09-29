import { useEffect, useRef, useState } from 'react';
import MoodOrb, { type MoodState } from './MoodOrb';
import { getFaceLandmarker, detectFrame, classifyBlendshapes } from '../lib/faceEmotion';
import { classifyText } from '../lib/textEmotion';
import './EmotionCheckIn.css';

type CheckInMode = 'face' | 'text';

interface EmotionCheckInProps {
  userName?: string;
  onComplete?: (result: { state: MoodState; source: CheckInMode; confidence: number }) => void;
}

export default function EmotionCheckIn({ userName = 'there', onComplete }: EmotionCheckInProps) {
  const [mode, setMode] = useState<CheckInMode>('face');
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [liveState, setLiveState] = useState<MoodState>('balanced');
  const [textInput, setTextInput] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start / stop the camera + detection loop when the Face tab is active.
  useEffect(() => {
    if (mode !== 'face') {
      stopCamera();
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraReady(true);
          setCameraError(null);
        }

        const landmarker = await getFaceLandmarker();
        const loop = () => {
          if (!videoRef.current || cancelled) return;
          const now = performance.now();
          const detection = detectFrame(landmarker, videoRef.current, now);
          if (detection.faceBlendshapes?.length) {
            const { state } = classifyBlendshapes(detection);
            setLiveState(state);
          }
          rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
      } catch (err) {
        setCameraError(
          'Camera unavailable or permission denied — switch to the Text check-in below.'
        );
      }
    })();

    return () => {
      cancelled = true;
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  function stopCamera() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraReady(false);
  }

  function confirmFaceCheckIn() {
    onComplete?.({ state: liveState, source: 'face', confidence: 0.7 });
  }

  function submitTextCheckIn() {
    if (!textInput.trim()) return;
    const { state, confidence } = classifyText(textInput);
    onComplete?.({ state, source: 'text', confidence });
  }

  return (
    <div className="checkin-card">
      <h2 className="checkin-greeting">Hi {userName}, how are you feeling?</h2>

      <MoodOrb state={liveState} pulsing={mode === 'face'} />

      <div className="checkin-segmented" role="tablist" aria-label="Check-in method">
        <button
          role="tab"
          aria-selected={mode === 'face'}
          className={mode === 'face' ? 'segment segment--active' : 'segment'}
          onClick={() => setMode('face')}
        >
          Face
        </button>
        <button
          role="tab"
          aria-selected={mode === 'text'}
          className={mode === 'text' ? 'segment segment--active' : 'segment'}
          onClick={() => setMode('text')}
        >
          Text
        </button>
      </div>

      {mode === 'face' ? (
        <div className="camera-card">
          <video ref={videoRef} className="camera-preview" muted playsInline />
          {!cameraReady && !cameraError && (
            <p className="camera-hint">Starting camera…</p>
          )}
          {cameraError && <p className="camera-error">{cameraError}</p>}
          <p className="camera-tech-note">
            Powered by MediaPipe Face Landmarker — runs on-device, nothing is uploaded.
          </p>
          <button
            className="checkin-primary-btn"
            disabled={!cameraReady}
            onClick={confirmFaceCheckIn}
          >
            Use this reading
          </button>
        </div>
      ) : (
        <div className="text-card">
          <textarea
            className="text-input"
            placeholder="How's your energy right now? e.g. 'pretty tired, long day'"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            rows={3}
          />
          <button
            className="checkin-primary-btn"
            disabled={!textInput.trim()}
            onClick={submitTextCheckIn}
          >
            Submit check-in
          </button>
        </div>
      )}
    </div>
  );
}
