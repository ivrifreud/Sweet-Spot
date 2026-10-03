/** Phone column for a 3/3 or 0/3 result: clip, three stamps, and the lesson. */

export const SCALE_RESULT_CONTENT_MAX = 400;
export const SCALE_RESULT_SIDE = 16;
export const SCALE_RESULT_STAMP_GAP = 8;

/** Room under the status area so the clip clears the exit button. */
const TOP_CHROME = 56;
const BOTTOM_CHROME = 8;
const CONTINUE_HEIGHT = 72;
const KICKER_HEIGHT = 44;
const CARD_PADDING = 28;
const GROUP_GAP = 12;
const EXPLANATION_MIN = 96;
const EXPLANATION_MAX = 200;
const VIDEO_MIN = 80;

export type ScaleResultLesson = {
  kicker: string;
  explanation: string;
  continueLabel: string;
};

export type ScaleResultFrame = {
  contentWidth: number;
  videoWidth: number;
  videoHeight: number;
  stampSize: number;
  explanationMaxHeight: number;
};

/**
 * Sizes the win/lose clip, the three stamps, and the lesson so they stay
 * together inside a phone, including the safe areas.
 */
export function equityClipResultFrame(input: {
  width: number;
  height: number;
  topInset: number;
  bottomInset: number;
}): ScaleResultFrame {
  const contentWidth = Math.min(Math.max(input.width, 280), SCALE_RESULT_CONTENT_MAX);
  const inner = contentWidth - SCALE_RESULT_SIDE * 2;
  const stampSize = Math.max(
    64,
    Math.min(96, Math.floor((inner - SCALE_RESULT_STAMP_GAP * 2) / 3))
  );
  const top = input.topInset + TOP_CHROME;
  const bottom = Math.max(input.bottomInset, 12) + BOTTOM_CHROME;
  const reserved =
    top +
    bottom +
    stampSize +
    CONTINUE_HEIGHT +
    KICKER_HEIGHT +
    CARD_PADDING +
    EXPLANATION_MIN +
    GROUP_GAP * 3;
  const videoCap = Math.min(300, inner);
  const videoRoom = Math.max(VIDEO_MIN, input.height - reserved);
  const videoWidth = Math.min(videoCap, Math.round(videoRoom * (16 / 9)));
  const videoHeight = Math.round(videoWidth * (9 / 16));
  const explanationMaxHeight = Math.max(
    EXPLANATION_MIN,
    Math.min(EXPLANATION_MAX, input.height - (reserved - EXPLANATION_MIN) - videoHeight)
  );
  return { contentWidth, videoWidth, videoHeight, stampSize, explanationMaxHeight };
}
