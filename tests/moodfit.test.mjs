// MoodFit unit tests (Appendix D, Table D1).
// Run with: npm test   (Node.js 22.6 or later)
//
// IDs match the report: T = text classifier, F = face classifier,
// R = recommendations, S = streak and weekly insight.
// T7, T8, T9 and S5 are expected to FAIL: they document known defects
// (negation, partial-word matching and an unmeasured statistic) that are
// discussed in the report rather than hidden.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { classifyText } from '../src/lib/textEmotion.ts';
import { classifyBlendshapes } from '../src/lib/faceEmotion.ts';
import {
  getRecommendation,
  getAlternativeRecommendation,
} from '../src/lib/recommendation.ts';
import { calculateStreak, generateWeeklyInsight } from '../src/lib/timeline.ts';

// ---------- helpers ----------

/** Builds a fake MediaPipe result from blendshape scores. */
function face(scores) {
  return {
    faceBlendshapes: [
      {
        categories: Object.entries(scores).map(([categoryName, score]) => ({
          categoryName,
          score,
        })),
      },
    ],
  };
}

/** A check-in record `daysAgo` days before now (hour offset keeps same-day records apart). */
function checkIn(daysAgo, state = 'balanced', hourOffset = 0, lastSessionTitle) {
  const d = new Date();
  d.setHours(12 + hourOffset, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return { timestamp: d.toISOString(), state, source: 'text', confidence: 1, lastSessionTitle };
}

// ---------- T: text classifier ----------

describe('Text classifier', () => {
  test('T1 "pretty tired, long day" -> low', () => {
    assert.equal(classifyText('pretty tired, long day').state, 'low');
  });

  test('T2 "Feeling great and motivated" -> energised', () => {
    assert.equal(classifyText('Feeling great and motivated').state, 'energised');
  });

  test('T3 "calm and relaxed today" -> calm', () => {
    assert.equal(classifyText('calm and relaxed today').state, 'calm');
  });

  test('T4 "I\'m okay" -> balanced', () => {
    assert.equal(classifyText("I'm okay").state, 'balanced');
  });

  test('T5 text with no keywords -> balanced, confidence 0.2', () => {
    const result = classifyText('the weather is cloudy');
    assert.equal(result.state, 'balanced');
    assert.equal(result.confidence, 0.2);
  });

  test('T6 capitals "EXHAUSTED" -> low', () => {
    assert.equal(classifyText('EXHAUSTED').state, 'low');
  });

  test('T7 negation "not good" -> low (known defect)', () => {
    assert.equal(classifyText('not good').state, 'low');
  });

  test('T8 negation "not tired at all, feeling pumped" -> energised (known defect)', () => {
    assert.equal(classifyText('not tired at all, feeling pumped').state, 'energised');
  });

  test('T9 partial word "want to book a class" -> no match, confidence 0.2 (known defect)', () => {
    assert.equal(classifyText('want to book a class').confidence, 0.2);
  });
});

// ---------- F: face classifier ----------

describe('Face classifier', () => {
  test('F1 neutral face (all scores 0) -> balanced', () => {
    assert.equal(
      classifyBlendshapes(face({ mouthSmileLeft: 0, mouthFrownLeft: 0, eyeSquintLeft: 0, jawOpen: 0 })).state,
      'balanced'
    );
  });

  test('F2 strong smile -> energised', () => {
    assert.equal(
      classifyBlendshapes(face({ mouthSmileLeft: 0.9, mouthSmileRight: 0.9 })).state,
      'energised'
    );
  });

  test('F3 frown and lowered brows -> low', () => {
    assert.equal(
      classifyBlendshapes(face({ mouthFrownLeft: 0.7, mouthFrownRight: 0.7, browDownLeft: 0.6 })).state,
      'low'
    );
  });

  test('F4 eye squint -> calm', () => {
    assert.equal(
      classifyBlendshapes(face({ eyeSquintLeft: 0.8, eyeSquintRight: 0.8 })).state,
      'calm'
    );
  });

  test('F5 no face detected -> balanced', () => {
    assert.equal(classifyBlendshapes({ faceBlendshapes: [] }).state, 'balanced');
  });
});

// ---------- R: recommendations ----------

describe('Recommendations', () => {
  test('R1 each mood maps to its intended intensity', () => {
    assert.equal(getRecommendation('low').intensity, 'Low');
    assert.equal(getRecommendation('calm').intensity, 'Moderate');
    assert.equal(getRecommendation('balanced').intensity, 'Moderate');
    assert.equal(getRecommendation('energised').intensity, 'High');
  });

  test('R2 every recommendation has a "why" explanation', () => {
    for (const mood of ['low', 'calm', 'balanced', 'energised']) {
      let rec = getRecommendation(mood);
      const first = rec.title;
      do {
        assert.ok(rec.why && rec.why.trim().length > 0, `${rec.title} has no why text`);
        rec = getAlternativeRecommendation(mood, rec.title);
      } while (rec.title !== first);
    }
  });

  test('R3 repeat low check-in gives a different low-intensity session', () => {
    const first = getRecommendation('low');
    const history = [checkIn(0, 'low', 0, first.title)];
    const second = getRecommendation('low', history);
    assert.notEqual(second.title, first.title);
    assert.equal(second.intensity, 'Low');
    assert.equal(second.title, 'Slow Flow Stretch');
  });

  test('R4 mood change low -> energised gives high intensity', () => {
    const history = [checkIn(0, 'low', 0, getRecommendation('low').title)];
    assert.equal(getRecommendation('energised', history).intensity, 'High');
  });

  test('R5 "See other options" cycles back to the first session', () => {
    const first = getRecommendation('low');
    let rec = getAlternativeRecommendation('low', first.title);
    assert.notEqual(rec.title, first.title);
    rec = getAlternativeRecommendation('low', rec.title);
    rec = getAlternativeRecommendation('low', rec.title);
    assert.equal(rec.title, first.title);
  });
});

// ---------- S: streak and weekly insight ----------

describe('Streak and insight', () => {
  test('S1 streak over three consecutive days -> 3', () => {
    assert.equal(calculateStreak([checkIn(0), checkIn(1), checkIn(2)]), 3);
  });

  test('S2 streak with a one-day gap -> 1', () => {
    assert.equal(calculateStreak([checkIn(0), checkIn(2)]), 1);
  });

  test('S3 two check-ins on the same day are counted once -> 2', () => {
    assert.equal(calculateStreak([checkIn(0, 'balanced', 0), checkIn(0, 'balanced', 2), checkIn(1)]), 2);
  });

  test('S4 no check-ins -> no insight shown', () => {
    assert.equal(generateWeeklyInsight([]), null);
  });

  test('S5 low-mood insight contains no unmeasured statistic (known defect)', () => {
    const insight = generateWeeklyInsight([checkIn(0, 'low'), checkIn(1, 'low')]);
    assert.ok(insight, 'expected an insight for a low-mood week');
    assert.doesNotMatch(insight, /\d+\s*minutes?/i, `insight states a fixed figure: "${insight}"`);
  });
});
