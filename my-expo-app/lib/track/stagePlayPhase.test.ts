import { describe, expect, it } from 'vitest';

import {
  canAcceptStageDecision,
  phaseAfterDecision,
  resolveContinueAfterFeedback,
  resolvePostEquityReveal,
  shouldMountTrackMap,
} from './stagePlayPhase';

describe('stage play phase', () => {
  it('rejects duplicate decisions while a hand is resolving', () => {
    expect(canAcceptStageDecision('interactive', false)).toBe(true);
    expect(canAcceptStageDecision('submitting', false)).toBe(false);
    expect(canAcceptStageDecision('revealing', false)).toBe(false);
    expect(canAcceptStageDecision('feedback', false)).toBe(false);
    expect(canAcceptStageDecision('interactive', true)).toBe(false);
  });

  it('routes equity 0/3 and 3/3 clips past the coach overlay', () => {
    expect(
      resolvePostEquityReveal({
        grade: { stagesCorrect: 3 },
        hasPendingFeedback: true,
        stageComplete: false,
        lockedOut: false,
      })
    ).toEqual({ showDecisionOverlay: false, leaveStage: false, advanceSpot: true });
    expect(
      resolvePostEquityReveal({
        grade: { stagesCorrect: 0 },
        hasPendingFeedback: true,
        stageComplete: true,
        lockedOut: false,
      })
    ).toEqual({ showDecisionOverlay: false, leaveStage: true, advanceSpot: false });
    expect(
      resolvePostEquityReveal({
        grade: { stagesCorrect: 2 },
        hasPendingFeedback: true,
        stageComplete: false,
        lockedOut: false,
      })
    ).toEqual({ showDecisionOverlay: true, leaveStage: false, advanceSpot: false });
  });

  it('keeps lockout and completion as the only ways to leave after coach feedback', () => {
    expect(phaseAfterDecision(2)).toBe('revealing');
    expect(phaseAfterDecision(1)).toBe('feedback');
    expect(resolveContinueAfterFeedback({ stageComplete: false, lockedOut: true })).toEqual({
      leaveStage: true,
      advanceSpot: false,
    });
    expect(resolveContinueAfterFeedback({ stageComplete: false, lockedOut: false })).toEqual({
      leaveStage: false,
      advanceSpot: true,
    });
  });

  it('unmounts the track map while a stage is open so the phone is not holding both scenes', () => {
    expect(shouldMountTrackMap(null)).toBe(true);
    expect(shouldMountTrackMap(1)).toBe(false);
    expect(shouldMountTrackMap(2)).toBe(false);
  });
});
