# MoodFit

**An emotion-aware fitness web app prototype that checks how you feel and recommends a workout to match.**

MoodFit was built as the software artefact for a BSc (Hons) Computing dissertation (module QHO656, Solent University). The user checks in with a facial-expression scan or a short text entry. The app classifies their mood and recommends a workout session suited to it, with a plain-language explanation of why that session was chosen.

---

## Features

- **Emotion check-in (face):** uses the webcam and Google MediaPipe Face Landmarker to read facial blendshapes and map them to one of four mood states: *Low energy*, *Calm*, *Balanced* or *Energised*. All processing happens **on the device**, and no images or video are uploaded or stored.
- **Emotion check-in (text):** a text fallback for users who don't want to use the camera. The mood is classified from the words they write.
- **Adaptive recommendation:** suggests one workout session (duration and intensity) for the detected mood. A **"Why this suggestion"** panel explains the reasoning. Sessions rotate based on check-in history so the same mood doesn't always get the same session.
- **Guided workout session:** a countdown timer for the recommended session. Completed sessions are saved.
- **Mood timeline:** a weekly view of past check-ins, a check-in streak counter and a plain-language weekly insight.
- **Classes:** browse a weekly studio class timetable, book and cancel classes, and view your bookings.
- **Membership:** compare Basic, Pro and Elite plans on monthly or annual billing, with a **demo checkout** (no real payment is taken and no card details are sent or stored).

## Tech stack

| Area | Technology |
|---|---|
| Frontend | React 19 + TypeScript |
| Build tool | Vite |
| Face analysis | `@mediapipe/tasks-vision` (Face Landmarker, runs in the browser) |
| Data storage | Browser `localStorage` (no backend or database) |
| Linting | oxlint |

## Getting started

### Requirements

- [Node.js](https://nodejs.org/) 22.6 or later (includes npm)
- A modern browser (Chrome, Edge or Firefox)
- A webcam, only if you want to use the face check-in

### Install and run

```bash
git clone https://github.com/romesh1997/moodfit-emotion-checkin.git
cd moodfit-emotion-checkin
npm install
npm run dev
```

Open the local address shown in the terminal (usually http://localhost:5173) and allow camera access when asked.

### Other commands

| Command | What it does |
|---|---|
| `npm run build` | Type-checks and builds a production version into `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm test` | Runs the 24 unit tests in `tests/moodfit.test.mjs` |
| `npm run lint` | Runs the linter |

## Project structure

```
src/
├── App.tsx                        # Screen navigation and shared state
├── components/
│   ├── EmotionCheckIn.tsx         # Face / text check-in screen
│   ├── MoodOrb.tsx                # Animated mood indicator (4 states)
│   ├── AdaptiveRecommendation.tsx # Recommended session + "Why this suggestion"
│   ├── WorkoutSession.tsx         # Timed workout session
│   ├── Timeline.tsx               # Weekly mood view, streak, insight
│   ├── Classes.tsx                # Class timetable and booking
│   ├── BookingConfirmation.tsx
│   ├── MyBookings.tsx
│   ├── Membership.tsx             # Plans and pricing
│   └── CheckoutModal.tsx          # Demo checkout form
└── lib/
    ├── faceEmotion.ts             # MediaPipe setup + blendshape → mood mapping
    ├── textEmotion.ts             # Text → mood classifier
    ├── recommendation.ts          # Mood → session recommendation logic
    ├── timeline.ts                # Check-in history, streaks, insights
    ├── sessions.ts                # Completed workout sessions
    ├── classes.ts                 # Class timetable data
    ├── bookings.ts                # Class bookings
    └── membership.ts              # Membership plans
tests/
└── moodfit.test.mjs               # Unit tests (text, face, recommendations, streak/insight)
```

## Testing

`npm test` runs 24 unit tests covering the text classifier (T1–T9), face classifier (F1–F5), recommendations (R1–R5) and streak/insight logic (S1–S5). **20 pass and 4 fail on purpose.** The failing tests (T7, T8, T9, S5) document known defects rather than hiding them:

- **T7, T8:** negation is not handled ("not good" is read as positive).
- **T9:** partial-word matching ("book" matches "ok").
- **S5:** the low-mood weekly insight states a fixed "6 minutes longer" figure that the app never measures.

## Privacy

- Camera frames are processed locally in the browser by MediaPipe and are **never uploaded or saved**.
- Check-ins, bookings, sessions and membership choices are stored only in your browser's `localStorage`. Clearing your browser data removes them.
- The checkout is a demonstration only. Card details are not sent anywhere or stored.
- The MediaPipe model and runtime files are downloaded from Google's CDN when the face check-in starts.

## Limitations

This is a prototype, and some parts are intentionally simplified:

- **Face → mood mapping** uses hand-tuned rules on MediaPipe blendshapes, not a trained emotion classifier, and it has not been validated against users' self-reported mood.
- **Text check-in** uses keyword matching, not a machine-learning sentiment model.
- **Recommendations** come from a fixed rotation of 2–3 sessions per mood state. The app doesn't learn from user feedback.
- **Data** is stored per browser with no user accounts, so it doesn't sync between devices.
- **Classes and membership** use sample data, and payments are simulated.

## Future work

- Train or fine-tune an emotion classifier and evaluate its accuracy against self-reported mood.
- Replace keyword matching with a sentiment or NLP model for text check-ins.
- Use session feedback (for example, "how did that feel?") to personalise future recommendations.
- Add user accounts and a backend so data syncs between devices.

## Author

**Romesh**, BSc (Hons) Computing, Solent University
Dissertation project, module QHO656
