import type { GestureTutorialHand } from './types';
import type { TutorialPoint } from './tutorialGeometry';

export type GestureVisualMotion =
  | { kind: 'swipe'; direction: 'up' | 'down' }
  | { kind: 'tap'; tapCount: 1 | 2 };

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
  }
}

/** Left or right along the screen horizon — the finger does not pitch up or down. */
export function horizonHeadingForSwipe(from: TutorialPoint, to: TutorialPoint): number {
  return to.x < from.x ? Math.PI : 0;
}
