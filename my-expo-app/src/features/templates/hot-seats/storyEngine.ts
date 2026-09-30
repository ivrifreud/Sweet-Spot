import type { SpotDecision } from '../peek-and-pitch/types';

import type { HotSeatStory } from './types';
import { validateStory } from './validateStory';

export type HotSeatPhase = 'arriving' | 'card' | 'deciding' | 'swapping' | 'explaining';
export type HotSeatOutcome = 'win' | 'loss';

export type HotSeatPlay = {
  story: HotSeatStory;
  phase: HotSeatPhase;
  seatIndex: number;
  decisions: Array<SpotDecision | null>;
  outcome: HotSeatOutcome | null;
  failedSeatIndex: number | null;
};

export function begin(story: HotSeatStory): HotSeatPlay {
  const result = validateStory(story);
  if (!result.ok) {
    throw new Error(`Hot Seats story failed validation: ${result.issues.join(', ')}`);
  }
  return {
    story: result.story,
    phase: 'arriving',
    seatIndex: 0,
    decisions: [null, null, null, null],
    outcome: null,
    failedSeatIndex: null,
  };
}

export function cameraReady(state: HotSeatPlay): HotSeatPlay {
  if (state.phase !== 'arriving') return state;
  return { ...state, phase: 'card' };
}

export function cardCleared(state: HotSeatPlay): HotSeatPlay {
  if (state.phase !== 'card') return state;
  return { ...state, phase: 'deciding' };
}

export function decide(state: HotSeatPlay, action: SpotDecision): HotSeatPlay {
  if (state.phase !== 'deciding') return state;
  const seat = state.story.seats[state.seatIndex];
  if (!seat || !seat.legalActions.includes(action)) return state;

  const decisions = [...state.decisions] as HotSeatPlay['decisions'];
  decisions[state.seatIndex] = action;
  if (action !== seat.scriptedAction) {
    return {
      ...state,
      phase: 'explaining',
      decisions,
      outcome: 'loss',
      failedSeatIndex: state.seatIndex,
    };
  }
  if (state.seatIndex < 3) {
    return { ...state, phase: 'swapping', decisions };
  }
  return { ...state, phase: 'explaining', decisions, outcome: 'win' };
}

export function cameraLanded(state: HotSeatPlay): HotSeatPlay {
  if (state.phase !== 'swapping') return state;
  return { ...state, phase: 'arriving', seatIndex: state.seatIndex + 1 };
}

export function gesturesUnlocked(state: HotSeatPlay): boolean {
  return state.phase === 'deciding';
}
