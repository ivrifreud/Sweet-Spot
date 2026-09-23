import { resultClipKind } from '../equity-scale/resultPresentation';

export type StagePlayPhase = 'interactive' | 'submitting' | 'revealing' | 'feedback' | 'resetting';

export function canAcceptStageDecision(phase: StagePlayPhase, busy: boolean): boolean {
  return phase === 'interactive' && !busy;
}

export function phaseAfterDecision(templateId: number): StagePlayPhase {
  return templateId === 2 ? 'revealing' : 'feedback';
}

export function resolvePostEquityReveal(input: {
  grade: { stagesCorrect: number } | null;
  hasPendingFeedback: boolean;
  stageComplete: boolean;
  lockedOut: boolean;
}): {
  showDecisionOverlay: boolean;
  leaveStage: boolean;
  advanceSpot: boolean;
} {
  if (!input.hasPendingFeedback) {
    return { showDecisionOverlay: false, leaveStage: false, advanceSpot: false };
  }
  if (resultClipKind(input.grade)) {
    return {
      showDecisionOverlay: false,
      leaveStage: input.stageComplete || input.lockedOut,
      advanceSpot: !(input.stageComplete || input.lockedOut),
    };
  }
  return { showDecisionOverlay: true, leaveStage: false, advanceSpot: false };
}

export function resolveContinueAfterFeedback(input: {
  stageComplete: boolean;
  lockedOut: boolean;
}): { leaveStage: boolean; advanceSpot: boolean } {
  if (input.stageComplete || input.lockedOut) {
    return { leaveStage: true, advanceSpot: false };
  }
  return { leaveStage: false, advanceSpot: true };
}
