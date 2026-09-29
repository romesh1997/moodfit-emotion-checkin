import {
  FaceLandmarker,
  FilesetResolver,
  type FaceLandmarkerResult,
} from '@mediapipe/tasks-vision';
import type { MoodState } from '../components/MoodOrb';

let faceLandmarker: FaceLandmarker | null = null;
let initPromise: Promise<FaceLandmarker> | null = null;

/**
 * Lazily creates (and caches) the on-device FaceLandmarker instance.
 * Model + WASM assets are fetched from Google's CDN once, then run
 * entirely on-device — no frames ever leave the browser. This matches
 * the consent/transparency commitment in the proposal's Section 8
 * (Ethical, Legal and Professional Considerations).
 */
export async function getFaceLandmarker(): Promise<FaceLandmarker> {
  if (faceLandmarker) return faceLandmarker;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const filesetResolver = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
    );

    faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        delegate: 'GPU',
      },
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: false,
      runningMode: 'VIDEO',
      numFaces: 1,
    });

    return faceLandmarker;
  })();

  return initPromise;
}

export function detectFrame(
  landmarker: FaceLandmarker,
  video: HTMLVideoElement,
  timestampMs: number
): FaceLandmarkerResult {
  return landmarker.detectForVideo(video, timestampMs);
}

/**
 * MVP heuristic: maps a handful of ARKit-style blendshape scores to one of
 * the four mood states used across the app. This is a placeholder rule set
 * for the dissertation prototype (Section 2, Objective 2 — "minimum viable
 * emotion-detection module"); its accuracy against ground-truth self-report
 * is exactly what the pilot evaluation (Section 4 methodology / SUS study)
 * is designed to test, and the thresholds below are expected to be tuned
 * — or replaced with a trained classifier — once pilot data exists.
 */
export function classifyBlendshapes(result: FaceLandmarkerResult): {
  state: MoodState;
  confidence: number;
} {
  const shapes = result.faceBlendshapes?.[0]?.categories ?? [];
  const score = (name: string) =>
    shapes.find((c) => c.categoryName === name)?.score ?? 0;

  const smile = Math.max(score('mouthSmileLeft'), score('mouthSmileRight'));
  const frown = Math.max(score('mouthFrownLeft'), score('mouthFrownRight'));
  const browDown = Math.max(score('browDownLeft'), score('browDownRight'));
  const jawOpen = score('jawOpen');
  const eyeSquint = Math.max(score('eyeSquintLeft'), score('eyeSquintRight'));
  const browUp = score('browInnerUp');

  const signals: Array<{ state: MoodState; weight: number }> = [
    { state: 'energised', weight: smile * 1.2 + jawOpen * 0.6 + browUp * 0.3 },
    { state: 'low', weight: frown * 1.2 + browDown * 0.7 },
    { state: 'calm', weight: eyeSquint * 0.9 + (1 - jawOpen) * 0.2 },
    { state: 'balanced', weight: 0.25 }, // neutral floor so it wins on ambiguous faces
  ];

  const top = signals.reduce((best, s) => (s.weight > best.weight ? s : best));
  const total = signals.reduce((sum, s) => sum + s.weight, 0) || 1;

  return { state: top.state, confidence: Math.min(1, top.weight / total) };
}
