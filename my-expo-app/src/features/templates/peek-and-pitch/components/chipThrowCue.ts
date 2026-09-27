/** Chip has peeled off the stack. Shared with ChipToss flight math. */
export const CHIP_LIFT_END = 0.16;
/** Chip has reached the felt. */
export const CHIP_FLIGHT_END = 0.72;
export const CHIP_REDUCED_MAX_MS = 280;

export function chipFlightClock(delayMs: number, durationMs: number, reducedMotion: boolean) {
  return {
    delayMs: reducedMotion ? 0 : delayMs,
    durationMs: reducedMotion ? Math.min(durationMs, CHIP_REDUCED_MAX_MS) : durationMs,
  };
}

/** Milliseconds from flight create until the first chip leaves toward the pot. */
export function chipThrowCueAtMs(delayMs: number, durationMs: number, reducedMotion: boolean) {
  const clock = chipFlightClock(delayMs, durationMs, reducedMotion);
  return clock.delayMs + clock.durationMs * CHIP_LIFT_END;
}
