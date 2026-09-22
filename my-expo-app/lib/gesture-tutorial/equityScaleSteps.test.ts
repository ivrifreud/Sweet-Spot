import { describe, expect, it } from 'vitest';

import { EQUITY_SCALE_TUTORIAL, EQUITY_SCALE_TUTORIAL_ID } from './equityScaleSteps';
import { allowedActionsForStep, matchesCurrentStep } from './stepMachine';

describe('EQUITY_SCALE_TUTORIAL', () => {
  it('teaches outs, lock in, equity, then call or fold', () => {
    expect(EQUITY_SCALE_TUTORIAL.templateId).toBe(EQUITY_SCALE_TUTORIAL_ID);
    expect(EQUITY_SCALE_TUTORIAL.steps.map((step) => step.id)).toEqual([
      'turn-outs',
      'lock-in',
      'turn-equity',
      'decide',
    ]);
    expect(EQUITY_SCALE_TUTORIAL.steps.map((step) => step.action)).toEqual([
      'turnDial',
      'lockIn',
      'turnDial',
      'call',
    ]);
  });

  it('uses sentence-case copy and scale targets', () => {
    const targets = EQUITY_SCALE_TUTORIAL.steps.map((step) => step.target);
    expect(targets).toEqual(['dial', 'lockIn', 'dial', 'foldButton']);
    for (const step of EQUITY_SCALE_TUTORIAL.steps) {
      expect(step.copy.endsWith('.')).toBe(true);
      expect(step.copy[0]).toBe(step.copy[0]?.toUpperCase());
    }
  });

  it('accepts either Fold or Call on the last level', () => {
    expect(allowedActionsForStep(EQUITY_SCALE_TUTORIAL.steps, 3)).toEqual(['fold', 'call']);
    expect(matchesCurrentStep(EQUITY_SCALE_TUTORIAL.steps, 3, 'fold')).toBe(true);
    expect(matchesCurrentStep(EQUITY_SCALE_TUTORIAL.steps, 3, 'call')).toBe(true);
    expect(matchesCurrentStep(EQUITY_SCALE_TUTORIAL.steps, 3, 'lockIn')).toBe(false);
  });
});
