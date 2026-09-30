export const WHOOSH_ANTICIPATION_MS = 80;
export const WHOOSH_TRAVEL_MS = 440;
export const WHOOSH_SETTLE_MS = 200;
export const WHOOSH_MS = WHOOSH_ANTICIPATION_MS + WHOOSH_TRAVEL_MS + WHOOSH_SETTLE_MS;
export const WHOOSH_CROSSFADE_MS = 360;
export const REDUCED_FADE_MS = 180;
export const FIRST_SEAT_SETTLE_MS = 200;

export const ARRIVAL_POP_MS = 140;
export const ARRIVAL_SETTLE_MS = 100;
export const ARRIVAL_HOLD_MS = 2400;
export const ARRIVAL_DISMISS_MS = 160;
export const ARRIVAL_REDUCED_IN_MS = 200;
export const ARRIVAL_CARD_WIDTH = 342;
export const ARRIVAL_CARD_HEIGHT = 148;
export const ARRIVAL_CARD_TOP_GAP = 72;

export const SLOT_POINTS = [
  { x: 0, y: 188 },
  { x: -124, y: 28 },
  { x: 0, y: -92 },
  { x: 124, y: 28 },
] as const;

export type MotionPlan = {
  kind: 'whoosh' | 'fade' | 'settle';
  durationMs: number;
  whoosh: boolean;
  anticipationMs: number;
  travelMs: number;
  settleMs: number;
  crossfadeAtMs: number;
};

export function motionPlan(reducedMotion: boolean, firstSeat: boolean): MotionPlan {
  if (reducedMotion) {
    return {
      kind: 'fade',
      durationMs: REDUCED_FADE_MS,
      whoosh: false,
      anticipationMs: 0,
      travelMs: 0,
      settleMs: 0,
      crossfadeAtMs: REDUCED_FADE_MS,
    };
  }
  if (firstSeat) {
    return {
      kind: 'settle',
      durationMs: FIRST_SEAT_SETTLE_MS,
      whoosh: false,
      anticipationMs: 0,
      travelMs: 0,
      settleMs: FIRST_SEAT_SETTLE_MS,
      crossfadeAtMs: FIRST_SEAT_SETTLE_MS,
    };
  }
  return {
    kind: 'whoosh',
    durationMs: WHOOSH_MS,
    whoosh: true,
    anticipationMs: WHOOSH_ANTICIPATION_MS,
    travelMs: WHOOSH_TRAVEL_MS,
    settleMs: WHOOSH_SETTLE_MS,
    crossfadeAtMs: WHOOSH_CROSSFADE_MS,
  };
}

/** 0 bottom, 1 screen-left (next), 2 far, 3 screen-right (previous). */
export function slotForSeat(seatIndex: number, activeIndex: number): number {
  'worklet';
  return (seatIndex - activeIndex + 4) % 4;
}

/** Clockwise travel moves the screen-left seat onto the bottom anchor. */
export function railPoint(slot: number, progress: number): { x: number; y: number } {
  'worklet';
  const amount = Math.min(1, Math.max(0, progress));
  const from = ((slot % 4) + 4) % 4;
  const to = (from + 3) % 4;
  const start = SLOT_POINTS[from]!;
  const end = SLOT_POINTS[to]!;
  return {
    x: start.x + (end.x - start.x) * amount,
    y: start.y + (end.y - start.y) * amount,
  };
}
