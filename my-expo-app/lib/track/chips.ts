export const MAX_CHIPS = 3;

export function clampChips(count: number): number {
  if (!Number.isFinite(count)) return MAX_CHIPS;
  return Math.max(0, Math.min(MAX_CHIPS, Math.trunc(count)));
}

/** Burn one life from the right-hand slot. */
export function burnChip(remaining: number): number {
  return clampChips(remaining - 1);
}

/** Fill empty slots when a rebuy or regen lands. */
export function fillChips(remaining: number, add = MAX_CHIPS): number {
  return clampChips(remaining + add);
}

/**
 * Left-to-right slots. Index 0 is the leftmost chip.
 * A remaining count of 2 yields filled, filled, empty.
 */
export function chipFilled(index: number, remaining: number): boolean {
  return index >= 0 && index < clampChips(remaining);
}

export function chipSlots(remaining: number): boolean[] {
  return Array.from({ length: MAX_CHIPS }, (_, index) => chipFilled(index, remaining));
}
