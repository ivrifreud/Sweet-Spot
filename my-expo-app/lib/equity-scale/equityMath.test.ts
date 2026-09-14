import { describe, expect, it } from 'vitest';

import { DEFAULT_EQUITY_SPOT } from '../../src/features/templates/equity-scale/config';
import {
  callEv,
  equityDecision,
  gradeEquitySubmission,
  hitChance,
  requiredEquity,
  trueEquityPercent,
  validateEquitySpot,
} from '../../src/features/templates/equity-scale/equityMath';

describe('Equity Scale math', () => {
  it('computes the price as a share of the final pot', () => {
    expect(requiredEquity(20, 4)).toBeCloseTo(1 / 6);
  });

  it('uses 46 unseen cards on the turn', () => {
    expect(hitChance(9, 'turn')).toBeCloseTo(9 / 46);
  });

  it('uses the two-card complement on the flop', () => {
    expect(hitChance(9, 'flop')).toBeCloseTo(1 - (38 / 47) * (37 / 46));
  });

  it('chooses call at non-negative EV and fold below it', () => {
    expect(equityDecision({ outs: 9, street: 'turn', potBeforeCall: 20, priceToCall: 4 })).toBe(
      'call'
    );
    expect(equityDecision({ outs: 4, street: 'turn', potBeforeCall: 20, priceToCall: 4 })).toBe(
      'fold'
    );
    expect(callEv({ outs: 9, street: 'turn', potBeforeCall: 20, priceToCall: 4 })).toBeGreaterThan(
      0
    );
  });

  it('rejects an authored answer that conflicts with its math', () => {
    expect(() => validateEquitySpot(DEFAULT_EQUITY_SPOT)).not.toThrow();
    expect(() => validateEquitySpot({ ...DEFAULT_EQUITY_SPOT, correctDecision: 'fold' })).toThrow(
      /conflicts/
    );
  });

  it('rounds true equity from the authored outs', () => {
    expect(trueEquityPercent(DEFAULT_EQUITY_SPOT)).toBe(20);
  });

  it('awards a full weighted score only when all three stages match', () => {
    const grade = gradeEquitySubmission(DEFAULT_EQUITY_SPOT, {
      selectedOuts: 9,
      selectedEquity: 20,
      decision: 'call',
    });
    expect(grade.outsCorrect).toBe(true);
    expect(grade.equityCorrect).toBe(true);
    expect(grade.decisionCorrect).toBe(true);
    expect(grade.stagesCorrect).toBe(3);
    expect(grade.score).toBe(1);
  });

  it('requires an exact outs count', () => {
    const grade = gradeEquitySubmission(DEFAULT_EQUITY_SPOT, {
      selectedOuts: 8,
      selectedEquity: 20,
      decision: 'call',
    });
    expect(grade.outsCorrect).toBe(false);
    expect(grade.stagesCorrect).toBe(2);
    expect(grade.score).toBe(0.75);
  });

  it('accepts equity within two percentage points and rejects a miss outside that', () => {
    const close = gradeEquitySubmission(DEFAULT_EQUITY_SPOT, {
      selectedOuts: 9,
      selectedEquity: 22,
      decision: 'call',
    });
    const far = gradeEquitySubmission(DEFAULT_EQUITY_SPOT, {
      selectedOuts: 9,
      selectedEquity: 23,
      decision: 'call',
    });
    expect(close.equityCorrect).toBe(true);
    expect(far.equityCorrect).toBe(false);
    expect(far.score).toBe(0.75);
  });

  it('weights a lone correct decision at half the score and burns no math credit', () => {
    const grade = gradeEquitySubmission(DEFAULT_EQUITY_SPOT, {
      selectedOuts: 4,
      selectedEquity: 8,
      decision: 'call',
    });
    expect(grade.decisionCorrect).toBe(true);
    expect(grade.outsCorrect).toBe(false);
    expect(grade.equityCorrect).toBe(false);
    expect(grade.stagesCorrect).toBe(1);
    expect(grade.score).toBe(0.5);
  });
});
