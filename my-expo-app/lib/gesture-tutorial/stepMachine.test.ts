import { describe, expect, it } from 'vitest';

import { PEEK_AND_PITCH_TUTORIAL } from './peekAndPitchSteps';
import {
  advanceStep,
  allowedActionsForStep,
  currentStep,
  isComplete,
  matchesCurrentStep,
  stepFromAction,
} from './stepMachine';

const STEPS = PEEK_AND_PITCH_TUTORIAL.steps;

describe('advanceStep', () => {
  it('moves to the next index and clamps at the end', () => {
    expect(advanceStep(0, 5)).toBe(1);
    expect(advanceStep(4, 5)).toBe(5);
    expect(advanceStep(5, 5)).toBe(5);
  });
});

describe('isComplete', () => {
  it('is complete once the index reaches the step count', () => {
    expect(isComplete(0, 5)).toBe(false);
    expect(isComplete(5, 5)).toBe(true);
    expect(isComplete(0, 0)).toBe(true);
  });
});

describe('currentStep / matchesCurrentStep', () => {
  it('returns the Peek and Pitch step for the current index', () => {
    expect(currentStep(STEPS, 0)?.action).toBe('peek');
    expect(matchesCurrentStep(STEPS, 1, 'fold')).toBe(true);
    expect(matchesCurrentStep(STEPS, 1, 'peek')).toBe(false);
    expect(currentStep(STEPS, 9)).toBeUndefined();
  });
});

describe('stepFromAction / allowedActionsForStep', () => {
  it('finds a step by action and locks the current action', () => {
    expect(stepFromAction(STEPS, 'raise')?.id).toBe('raise');
    expect(allowedActionsForStep(STEPS, 3)).toEqual(['call']);
    expect(allowedActionsForStep(STEPS, 20)).toBeUndefined();
  });
});
