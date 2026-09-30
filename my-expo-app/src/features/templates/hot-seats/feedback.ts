import { burnChip } from '../../../../lib/track/chips';
import { recordSpotAttempt } from '../../../../lib/track/tree';
import { buildDecisionFeedbackCopy, labelForAction } from '../../decision-feedback/copy';
import type { DecisionFeedbackCopy } from '../../decision-feedback/types';
import type { SpotDecision } from '../peek-and-pitch/types';

import { positionName } from './arrivalCopy';
import type { HotSeatPlay } from './storyEngine';

export type ExplanationRow = {
  seatIndex: number;
  position: string;
  cards: string;
  stackLabel: string;
  correctAction: string;
  chosenAction: string | null;
  explanation: string;
  missed: boolean;
};

export function explanationRows(state: HotSeatPlay): ExplanationRow[] {
  return state.story.seats.map((seat, seatIndex) => {
    const chosen = state.decisions[seatIndex] ?? null;
    return {
      seatIndex,
      position: positionName(seat.position),
      cards: seat.holeCards.join(' '),
      stackLabel: `${seat.stack}bb`,
      correctAction: labelForAction(seat.scriptedAction),
      chosenAction: chosen ? labelForAction(chosen) : null,
      explanation: seat.explanation,
      missed: state.failedSeatIndex === seatIndex,
    };
  });
}

export function buildHotSeatFeedback(
  state: HotSeatPlay,
  continueLabel = 'Deal me the next hand'
): { copy: DecisionFeedbackCopy; rows: ExplanationRow[] } {
  const seatIndex = state.failedSeatIndex ?? state.seatIndex;
  const seat = state.story.seats[seatIndex]!;
  const chosen = state.decisions[seatIndex] ?? seat.scriptedAction;
  return {
    copy: buildDecisionFeedbackCopy({
      correct: state.outcome === 'win',
      chosen,
      correctAnswer: seat.scriptedAction,
      lesson: state.story.stageTakeaway,
      continueLabel,
    }),
    rows: explanationRows(state),
  };
}

export function settleHotSeatResult(input: {
  outcome: 'win' | 'loss';
  chips: number;
  spotsCompleted: number;
}): {
  burned: boolean;
  remainingChips: number;
  spotsCompleted: number;
  stageComplete: boolean;
} {
  const progress = recordSpotAttempt(input.spotsCompleted);
  const burned = input.outcome === 'loss';
  return {
    burned,
    remainingChips: burned ? burnChip(input.chips) : input.chips,
    spotsCompleted: progress.spotsCompleted,
    stageComplete: progress.stageComplete,
  };
}

export function actedTag(action: SpotDecision | null): string | null {
  if (!action) return null;
  return labelForAction(action);
}
