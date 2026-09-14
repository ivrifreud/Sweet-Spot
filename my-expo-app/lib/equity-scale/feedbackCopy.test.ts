import { describe, expect, it } from 'vitest';

import { DEFAULT_EQUITY_SPOT } from '../../src/features/templates/equity-scale/config';
import { buildEquityFeedbackCopy } from '../../src/features/templates/equity-scale/feedbackCopy';
import { gradeEquitySubmission } from '../../src/features/templates/equity-scale/equityMath';

describe('equity scale feedback copy', () => {
  it('celebrates a 3/3 with the +EV rule and the locked numbers', () => {
    const grade = gradeEquitySubmission(DEFAULT_EQUITY_SPOT, {
      selectedOuts: 9,
      selectedEquity: 20,
      decision: 'call',
    });
    const copy = buildEquityFeedbackCopy({
      spot: DEFAULT_EQUITY_SPOT,
      grade,
      continueLabel: 'Deal me the next hand',
    });
    expect(copy.title).toBe('SWEET SPOT!');
    expect(copy.kicker).toContain('3/3');
    expect(copy.explanation).toContain('Ah5h');
    expect(copy.explanation).toMatch(/Kh|king/i);
    expect(copy.explanation).toContain('9 outs');
    expect(copy.explanation).toContain('20%');
    expect(copy.explanation).toMatch(/\+EV/);
    expect(copy.explanation).toMatch(/Pot Odds/i);
  });

  it('explains a missed fold using the -EV rule without calling it a fail', () => {
    const foldSpot = {
      ...DEFAULT_EQUITY_SPOT,
      potBeforeCall: 18,
      priceToCall: 10,
      correctDecision: 'fold' as const,
    };
    const grade = gradeEquitySubmission(foldSpot, {
      selectedOuts: 2,
      selectedEquity: 40,
      decision: 'call',
    });
    const copy = buildEquityFeedbackCopy({
      spot: foldSpot,
      grade,
      continueLabel: 'Deal me the next hand',
    });
    expect(copy.outcome).toBe('incorrect');
    expect(copy.kicker.toLowerCase()).not.toContain('fail');
    expect(copy.explanation).toMatch(/-EV/);
    expect(copy.explanation).toMatch(/fold/i);
  });
});
