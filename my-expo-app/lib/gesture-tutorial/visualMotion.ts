import type { GestureTutorialHand } from './types';
import { POINTING_GLOVE_TIP_X, POINTING_GLOVE_W, type TutorialPoint } from './tutorialGeometry';

export type GestureVisualMotion =
  | { kind: 'swipe'; direction: 'up' | 'down' }
  | { kind: 'tap'; tapCount: 1 | 2 }
  | { kind: 'rotate' }
  | { kind: 'tapPair' };

export function visualMotionForHand(hand: GestureTutorialHand): GestureVisualMotion {
  switch (hand) {
    case 'peekDown':
      return { kind: 'swipe', direction: 'down' };
    case 'foldUp':
    case 'raiseUp':
      return { kind: 'swipe', direction: 'up' };
    case 'doubleTap':
      return { kind: 'tap', tapCount: 2 };
    case 'tapStack':
      return { kind: 'tap', tapCount: 1 };
    case 'turnDial':
      return { kind: 'rotate' };
    case 'tapPair':
      return { kind: 'tapPair' };
  }
}

/** Mirrored for the right hand: it points left unless the swipe travels left. */
export function horizonHeadingForSwipe(from: TutorialPoint, to: TutorialPoint): number {
  return to.x < from.x ? 0 : Math.PI;
}

/** Right-hand dial coach stays flat, finger pointing left. */
export function horizonHeadingForDial(): number {
  return Math.PI;
}

/** Flat, finger pointing left. Null means the step may still use the edge lift. */
export function glovePoseDeg(hand: GestureTutorialHand): number | null {
  if (hand === 'peekDown' || hand === 'foldUp' || hand === 'tapStack' || hand === 'tapPair') {
    return 0;
  }
  return null;
}

/**
 * Swing the cuff up when a left-pointing glove would leave the right edge.
 * The dial rim stays flat; only targets jammed against the edge lift.
 */
export function rightHandEdgeLift(tipX: number, viewportWidth: number): number {
  'worklet';
  const right = tipX - POINTING_GLOVE_TIP_X + POINTING_GLOVE_W;
  const overflow = right - (viewportWidth - 8);
  return overflow > 72 ? -90 : 0;
}

/** 0 on the first button, 1 on the second. Jumps; does not slide. */
export function pairTapProgress(phase: number): number {
  'worklet';
  return phase < 0.5 ? 0 : 1;
}
