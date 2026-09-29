# MoodFit — Emotion Check-In + Adaptive Recommendation Prototype

Two working MVP pieces from the proposal (Section 2, Objectives 2 & 3):
a facial-expression check-in (MediaPipe Face Landmarker, on-device) with a
text check-in as fallback/cross-check, feeding into a single adaptive
session recommendation with a "Why this suggestion" transparency panel —
matching the Figma Figure 1 / Figure 2 flow.

## Run it

```bash
npm install
npm run dev
```

Open the printed localhost URL. Complete a check-in (Face or Text) and it
hands straight off to the recommendation screen. "Check in again" resets
back to a fresh check-in.

## What's here

- `src/components/MoodOrb.tsx` — the teal→coral gradient orb, 4 mood states
- `src/components/EmotionCheckIn.tsx` — Face/Text segmented control, camera
  loop; calls `onComplete` the moment a reading is confirmed
- `src/components/AdaptiveRecommendation.tsx` — detected-state header,
  single session card (duration + intensity tags), expandable "Why this
  suggestion" panel
- `src/lib/faceEmotion.ts` — MediaPipe FaceLandmarker setup + blendshape→mood
  heuristic (`classifyBlendshapes`)
- `src/lib/textEmotion.ts` — lexicon-based text→mood classifier (`classifyText`)
- `src/lib/recommendation.ts` — mood state → session recommendation
  rotation (`getRecommendation`, `getAlternativeRecommendation`),
  including the justification text shown in the "Why this suggestion"
  panel
- `src/components/Timeline.tsx` — weekly mood view, streak counter, and
  plain-language weekly insight
- `src/lib/timeline.ts` — `localStorage`-backed check-in history
  (`saveCheckIn`, `loadCheckInHistory`) plus streak/insight calculation
- `src/App.tsx` — owns the check-in → recommendation → timeline
  navigation and history state

## Known placeholders (flag these honestly in the report)

- **Blendshape→mood mapping is a hand-tuned heuristic**, not a trained
  classifier. It's a reasonable MVP starting point, but its accuracy against
  real self-reported mood is untested — that's exactly what the pilot
  study (SUS + pre/post mood ratings) in the Methodology section is for.
  Expect to retune the weights in `classifyBlendshapes` once you have
  pilot data, or note it as a limitation/further-work item if you don't
  get to.
- **Text classifier is keyword-matching**, not NLP. Fine for a fallback
  check-in in an MVP; a proper sentiment model is a legitimate
  "recommendations for further work" item.
- **Recommendation logic is a short static rotation per mood state**
  (2-3 sessions each, cycling based on check-in history so the same mood
  doesn't always return the identical session), not a learned or
  personalised recommender. This is a deliberate MVP scope choice (see
  Objective 3) — worth naming explicitly as a limitation in Section 6/8
  rather than letting a marker assume it's more adaptive than it is. A
  natural "further work" extension: incorporate real session feedback
  (not just rotation) to bias which session gets picked.
- **Check-in history persists to `localStorage`** (`src/lib/timeline.ts`)
  and feeds both the Timeline screen (`src/components/Timeline.tsx`,
  Figma Figure 3 — weekly view, streak, plain-language insight) and the
  recommendation rotation above. It's per-browser only, not synced to an
  account or backend.

## Stack note

Built as a React + Vite web app (not React Native/Flutter) so the camera
check-in runs directly in a browser with no native build step — quickest
path to a demoable prototype. The proposal left frontend framework as
"provisional... to be confirmed once early prototyping starts" (Section 3),
so this is that confirmation; worth a one-line mention in the report's
Methodology or Design & Implementation section on why web-over-native was
chosen (cross-platform via browser, camera API access, faster iteration —
trade-off is losing native performance/offline app-store distribution).

