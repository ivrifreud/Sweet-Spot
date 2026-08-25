import type { FinalizeResult } from './session';
import type { Placement } from './types';

export type LevelReveal = {
  placement: Placement;
  /** Canonical level name from the MVP progression table. */
  levelName: string;
  worldName: string;
  /** The player-voice line the MVP spec uses to characterise this level. */
  tagline: string;
  /** Why calibration landed here, in player-facing language. */
  reasonLine: string;
  startingRating: string;
  /** Where this level sits in the player population. Static until there is a real population to measure. */
  percentileLabel: string;
  ctaLabel: string;
  returning: boolean;
};

type LevelCopy = {
  levelName: string;
  worldName: string;
  tagline: string;
};

const LEVEL_COPY: Record<Placement, LevelCopy> = {
  1: {
    levelName: 'Amateur',
    worldName: "Benny's Garden",
    tagline: "I came to have fun, let's see a flop.",
  },
  2: {
    levelName: 'Beginner',
    worldName: 'A Local Casino',
    tagline: 'I have a feeling the Heart is coming on the River.',
  },
  3: {
    levelName: 'Intermediate',
    worldName: 'A VIP Room',
    tagline: 'How do I extract maximum value from him with my strong hand?',
  },
};

/**
 * Share of the player population in each level, from the bell curve in
 * docs/Player_Progression_&_Elo _System.md. MVP levels cover the bottom 80%;
 * the deferred Levels 4 and 5 hold the remaining 15% and 5%.
 *
 * Replace these fixed shares with measured ones once there is a real population.
 */
const POPULATION_SHARE: Record<Placement, number> = {
  1: 15,
  2: 35,
  3: 30,
};

/** Cumulative share of players sitting below a level. */
export function playersBelowLevel(placement: Placement): number {
  return ([1, 2, 3] as Placement[])
    .filter((level) => level < placement)
    .reduce((total, level) => total + POPULATION_SHARE[level], 0);
}

function percentileLabelFor(placement: Placement): string {
  const below = playersBelowLevel(placement);
  if (below === 0) {
    return `Starting in the bottom ${POPULATION_SHARE[placement]}%`;
  }
  return `Ahead of ${below}% of players`;
}

const REASON_LINES: Record<string, string> = {
  stage1_catastrophic: 'Your pre-flop hand selection is where the money is leaking first.',
  stage2_miss: 'Your pre-flop reads hold up. Position and pot odds are the next climb.',
  stage2_full_pass: 'A clean sweep. You read position and price correctly every time.',
  already_placed: 'Picking up where you left off.',
};

const FALLBACK_REASON_LINE = 'Your starting track is set.';

export function toLevelReveal(result: FinalizeResult): LevelReveal {
  const copy = LEVEL_COPY[result.placement];
  const returning = result.reason === 'already_placed';

  return {
    placement: result.placement,
    levelName: copy.levelName,
    worldName: copy.worldName,
    tagline: copy.tagline,
    reasonLine: REASON_LINES[result.reason] ?? FALLBACK_REASON_LINE,
    startingRating: String(result.startingElo),
    percentileLabel: percentileLabelFor(result.placement),
    ctaLabel: returning ? 'CONTINUE' : 'START TRAINING',
    returning,
  };
}
