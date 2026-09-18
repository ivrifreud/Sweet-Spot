import { describe, expect, it } from 'vitest';

import { PEEK_AND_PITCH_TUTORIAL, PEEK_AND_PITCH_TUTORIAL_ID } from './peekAndPitchSteps';

describe('PEEK_AND_PITCH_TUTORIAL', () => {
  it('teaches peek, fold, check, call, then raise', () => {
    expect(PEEK_AND_PITCH_TUTORIAL.templateId).toBe(PEEK_AND_PITCH_TUTORIAL_ID);
    expect(PEEK_AND_PITCH_TUTORIAL.steps.map((step) => step.action)).toEqual([
      'peek',
      'fold',
      'check',
      'call',
      'raise',
    ]);
  });

  it('uses sentence-case copy and a target for each step', () => {
    for (const step of PEEK_AND_PITCH_TUTORIAL.steps) {
      expect(step.copy.endsWith('.')).toBe(true);
      expect(step.copy).toBe(step.copy);
      expect(step.copy[0]).toBe(step.copy[0]?.toUpperCase());
      expect(['felt', 'cards', 'stack']).toContain(step.target);
    }
  });
});
