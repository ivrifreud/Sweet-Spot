import type { CardCode, HoleCardCodes } from '../../../lib/cards';
import type { HeroPosition, SpotDecision } from '../peek-and-pitch/types';

export type HotSeatSkin = 'garden' | 'casino';
export type HotSeatStreet = 'preflop' | 'flop' | 'turn' | 'river';
export type HotSeatFrequencies = Record<SpotDecision, number>;

/** One body in action order. Identity is position, stack, cards, and action — never a character. */
export type HotSeat = {
  position: HeroPosition;
  stack: number;
  holeCards: HoleCardCodes;
  scriptedAction: SpotDecision;
  raiseSize: number | null;
  frequencies: HotSeatFrequencies;
  legalActions: SpotDecision[];
  explanation: string;
  priorAction: string;
};

export type HotSeatStory = {
  id: string;
  /** Owner poker values still need replacement. */
  placeholder?: boolean;
  skin: HotSeatSkin;
  street: HotSeatStreet;
  blinds: { sb: number; bb: number };
  pot: number;
  communityCards: CardCode[];
  stageTakeaway: string;
  seats: [HotSeat, HotSeat, HotSeat, HotSeat];
};

export type StoryIssue =
  | 'seat-count'
  | 'board-count'
  | 'duplicate-position'
  | 'duplicate-card'
  | 'invalid-card'
  | 'frequency-total'
  | 'frequency-tie'
  | 'frequency-mismatch'
  | 'illegal-script'
  | 'check-facing-bet'
  | 'raise-size'
  | 'empty-copy'
  | 'invalid-story';

export type StoryValidation =
  | { ok: true; story: HotSeatStory }
  | { ok: false; issues: StoryIssue[] };
