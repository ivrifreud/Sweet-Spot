export type CorrectCue = 'correct';

export type IncorrectCue = 'incorrect';

export type IdleCue = 'idleSnore' | 'idleYawn';

export const CORRECT_POOL: readonly CorrectCue[] = ['correct'];

export const INCORRECT_POOL: readonly IncorrectCue[] = ['incorrect'];

export const IDLE_POOL: readonly IdleCue[] = ['idleSnore', 'idleYawn'];

export const GARDEN_NIGHT_POOL = ['garden-night-ambience', 'garden-night-forest'] as const;

export type GardenNightBed = (typeof GARDEN_NIGHT_POOL)[number];

/** Avoid playing the same sting twice in a row when a pool has more than one cue. */
export function pickQueued<T>(
  items: readonly T[],
  last: T | undefined,
  random: () => number = Math.random
): T {
  if (items.length === 0) {
    throw new Error('empty audio pool');
  }
  const choices =
    items.length > 1 && last !== undefined ? items.filter((item) => item !== last) : [...items];
  const index = Math.min(choices.length - 1, Math.max(0, Math.floor(random() * choices.length)));
  return choices[index]!;
}
