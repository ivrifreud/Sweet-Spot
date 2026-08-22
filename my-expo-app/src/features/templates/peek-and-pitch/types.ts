import type { HoleCardCodes } from '@/lib/cards';

/** Visual skin of the table. One entry per World (see docs/The_Six_Pillars_&_The_Four_Worlds.md). */
export type TableSkin = 'casino' | 'garden';

export type HeroPosition = 'UTG' | 'MP' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';

/**
 * Everything the template needs to render one pre-flop spot.
 * `heroCards` is what the player will see when they peek — set it to pin a specific
 * holding, or leave it `null` to deal a random hand.
 */
export type PeekAndPitchSpot = {
  id: string;
  skin: TableSkin;
  heroCards: HoleCardCodes | null;
  position: HeroPosition;
  /** Floating banner copy describing the action the hero is facing. */
  actionLine: string;
  potLabel: string;
  heroStackLabel: string;
};

export type SpotDecision = 'fold' | 'raise';

export type TemplatePhase = 'dealing' | 'live' | 'resolved';
