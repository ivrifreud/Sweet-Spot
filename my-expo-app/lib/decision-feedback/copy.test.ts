import { describe, expect, it } from 'vitest';

import {
  buildDecisionFeedbackCopy,
  labelForAction,
} from '../../src/features/decision-feedback/copy';

describe('decision feedback copy', () => {
  it('labels poker actions in title case', () => {
    expect(labelForAction('fold')).toBe('Fold');
    expect(labelForAction('raise')).toBe('Raise');
  });

  it('celebrates a correct decision without repeating a trailing action word', () => {
    const copy = buildDecisionFeedbackCopy({
      correct: true,
      chosen: 'fold',
      correctAnswer: 'fold',
      lesson: 'UTG, 100bb. Folded to you. You hold 72o. Fold.',
    });

    expect(copy.outcome).toBe('correct');
    expect(copy.title).toBe('SWEET SPOT!');
    expect(copy.kicker).toContain('Fold');
    expect(copy.explanation).toMatch(/^Fold was right\./);
    expect(copy.explanation).toContain('72o');
    expect(copy.explanation).not.toMatch(/Fold\.\s*That's why/);
  });

  it('explains a miss without shaming the player', () => {
    const copy = buildDecisionFeedbackCopy({
      correct: false,
      chosen: 'call',
      correctAnswer: 'fold',
      lesson: 'Missed flush draw on a brick river. You are not getting the price. Fold.',
    });

    expect(copy.outcome).toBe('incorrect');
    expect(copy.title).toBe('STILL IN IT');
    expect(copy.kicker.toLowerCase()).not.toContain('fail');
    expect(copy.kicker.toLowerCase()).not.toContain('wrong');
    expect(copy.explanation).toMatch(/^Fold was right\./);
    expect(copy.explanation).toContain('not getting the price');
    expect(copy.explanation).toContain('Call');
    expect(copy.explanation).toContain('Fold');
    expect(copy.continueLabel).toBe('Deal me the next');
  });
});
