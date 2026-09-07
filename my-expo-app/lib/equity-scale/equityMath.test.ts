import { describe, expect, it } from 'vitest';

import { DEFAULT_EQUITY_SPOT } from '../../src/features/templates/equity-scale/config';
import {
  callEv,
  equityDecision,
  hitChance,
  requiredEquity,
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
});
