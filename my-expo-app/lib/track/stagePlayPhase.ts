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
  // The 3/3 and 0/3 lesson sits on the clip with the stamps. Finishing that
  // screen moves on, instead of opening a second card over the video.
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

export function shouldMountTrackMap(playingStage: number | null): boolean {
  return playingStage == null;
}
