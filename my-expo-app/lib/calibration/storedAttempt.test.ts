import { describe, expect, it } from 'vitest';

import { resolveCalibrationSubmit } from './storedAttempt';

describe('resolveCalibrationSubmit', () => {
  it('keeps the stored answer when the spot was already submitted', () => {
    expect(
      resolveCalibrationSubmit({
        answersSoFar: [{ spotId: 's1', chosen: 'fold' }],
        spotId: 's1',
        attempted: 'raise',
        storedChosen: 'fold',
      })
    ).toEqual({
      answers: [{ spotId: 's1', chosen: 'fold' }],
      persistAttempt: false,
    });
  });

  it('records a new attempt when the spot has no stored answer', () => {
    expect(
      resolveCalibrationSubmit({
        answersSoFar: [{ spotId: 's0', chosen: 'call' }],
        spotId: 's1',
        attempted: 'raise',
        storedChosen: null,
      })
    ).toEqual({
      answers: [
        { spotId: 's0', chosen: 'call' },
        { spotId: 's1', chosen: 'raise' },
      ],
      persistAttempt: true,
    });
  });
});
