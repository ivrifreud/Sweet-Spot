import type { SpotDecision } from '../peek-and-pitch/types';
import type { HotSeatStreet } from './types';

const LADDER = [2, 3, 4, 6, 8, 10];

export type RaiseSizePair = {
  sizes: [number, number];
  correct: number | null;
};

export function raiseSizePair(input: {
  storyId: string;
  seatIndex: number;
  scriptedAction: SpotDecision;
  raiseSize: number | null;
  street: HotSeatStreet;
}): RaiseSizePair {
  const roll = hash(`${input.storyId}:${input.seatIndex}`);
  if (input.scriptedAction === 'raise' && input.raiseSize != null && input.raiseSize > 0) {
    const correct = input.raiseSize;
    const decoy = pickDecoy(correct, roll);
    const sizes: [number, number] = roll % 2 === 0 ? [correct, decoy] : [decoy, correct];
    return { sizes, correct };
  }
  const pool: number[] = input.street === 'preflop' ? [2, 3, 4, 6] : [4, 6, 8, 10];
  const first = pool[roll % pool.length]!;
  const other = pool[(pool.indexOf(first) + 1 + (roll % 3)) % pool.length]!;
  const sizes: [number, number] = roll % 2 === 0 ? [first, other] : [other, first];
  return { sizes, correct: null };
}

function pickDecoy(correct: number, roll: number): number {
  const lo = correct * 0.5;
  const hi = correct * 1.6;
  const nearby = LADDER.filter((size) => size !== correct && size >= lo && size <= hi);
  const pool = nearby.length > 0 ? nearby : LADDER.filter((size) => size !== correct);
  return pool[roll % pool.length]!;
}

function hash(text: string): number {
  let n = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    n ^= text.charCodeAt(i);
    n = Math.imul(n, 16777619);
  }
  return n >>> 0;
}
