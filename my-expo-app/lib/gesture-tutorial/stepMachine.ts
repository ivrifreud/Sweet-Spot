import type { GestureTutorialAction, GestureTutorialStep } from './types';

export function advanceStep(index: number, count: number): number {
  if (count <= 0) {
    return 0;
  }
  return Math.min(Math.max(0, index) + 1, count);
}

export function isComplete(index: number, count: number): boolean {
  return count <= 0 || index >= count;
}

export function currentStep<T extends GestureTutorialStep>(
  steps: readonly T[],
  index: number
): T | undefined {
  if (index < 0 || index >= steps.length) {
    return undefined;
  }
  return steps[index];
}

export function matchesCurrentStep(
  steps: readonly GestureTutorialStep[],
  index: number,
  action: GestureTutorialAction
): boolean {
  return currentStep(steps, index)?.action === action;
}

export function stepFromAction(
  steps: readonly GestureTutorialStep[],
  action: GestureTutorialAction
): GestureTutorialStep | undefined {
  return steps.find((step) => step.action === action);
}

export function allowedActionsForStep(
  steps: readonly GestureTutorialStep[],
  index: number
): GestureTutorialAction[] | undefined {
  const step = currentStep(steps, index);
  return step ? [step.action] : undefined;
}
