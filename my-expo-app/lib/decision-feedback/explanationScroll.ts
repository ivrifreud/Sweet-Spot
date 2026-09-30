/** Coach explanation stays this tall; anything longer scrolls inside the card. */
export const EXPLANATION_BOX_MAX_HEIGHT = 72;

/**
 * Card chrome is not a touch target. Touches fall through to tap-to-continue
 * unless they land on an overflowing explanation.
 */
export const FEEDBACK_PASS_THROUGH = 'box-none' as const;

export function explanationOverflows(
  contentHeight: number,
  boxHeight: number = EXPLANATION_BOX_MAX_HEIGHT,
): boolean {
  return contentHeight > boxHeight;
}

export function explanationPointerEvents(overflows: boolean): 'auto' | 'box-none' {
  return overflows ? 'auto' : FEEDBACK_PASS_THROUGH;
}

/** A drag inside a long lesson must not dismiss the feedback. */
export function continueAfterExplanationTouch(input: {
  overflows: boolean;
  dragged: boolean;
}): boolean {
  return !(input.overflows && input.dragged);
}
