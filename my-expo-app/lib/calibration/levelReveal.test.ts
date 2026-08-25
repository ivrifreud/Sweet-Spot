import { describe, expect, it } from 'vitest';

import { playersBelowLevel, toLevelReveal } from './levelReveal';
import { startingEloForLevel } from './routing';
import type { Placement } from './types';

function revealFor(placement: Placement, reason: string) {
  return toLevelReveal({
    placement,
    startingElo: startingEloForLevel(placement),
    reason,
  });
}

describe('toLevelReveal', () => {
  it('maps Level 1 to the Amateur level in Benny\u2019s Garden', () => {
    const reveal = revealFor(1, 'stage1_catastrophic');
    expect(reveal.levelName).toBe('Amateur');
    expect(reveal.worldName).toBe("Benny's Garden");
    expect(reveal.tagline).toBe("I came to have fun, let's see a flop.");
    expect(reveal.startingRating).toBe('300');
    expect(reveal.percentileLabel).toBe('Starting in the bottom 15%');
  });

  it('maps Level 2 to the Beginner level in a Local Casino', () => {
    const reveal = revealFor(2, 'stage2_miss');
    expect(reveal.levelName).toBe('Beginner');
    expect(reveal.worldName).toBe('A Local Casino');
    expect(reveal.startingRating).toBe('850');
    expect(reveal.percentileLabel).toBe('Ahead of 15% of players');
  });

  it('maps Level 3 to the Intermediate level in a VIP Room', () => {
    const reveal = revealFor(3, 'stage2_full_pass');
    expect(reveal.levelName).toBe('Intermediate');
    expect(reveal.worldName).toBe('A VIP Room');
    expect(reveal.startingRating).toBe('1300');
    expect(reveal.percentileLabel).toBe('Ahead of 50% of players');
  });

  it('never surfaces a question-template name to the player', () => {
    const copy = ([1, 2, 3] as Placement[])
      .map((placement) => Object.values(revealFor(placement, 'stage2_miss')).join(' '))
      .join(' ');
    expect(copy).not.toMatch(/peek and pitch|sniper slider|detective board|swipe/i);
  });
});

describe('playersBelowLevel', () => {
  it('accumulates the population bands from the bell curve', () => {
    expect(playersBelowLevel(1)).toBe(0);
    expect(playersBelowLevel(2)).toBe(15);
    expect(playersBelowLevel(3)).toBe(50);
  });

  it('never places a higher level below a lower one', () => {
    const shares = ([1, 2, 3] as Placement[]).map(playersBelowLevel);
    const ascending = [...shares].sort((a, b) => a - b);
    expect(shares).toEqual(ascending);
  });
});

describe('reason copy', () => {
  it('replaces each routing code with a player-facing line', () => {
    const codes = ['stage1_catastrophic', 'stage2_miss', 'stage2_full_pass'];
    for (const code of codes) {
      const reveal = revealFor(2, code);
      expect(reveal.reasonLine).not.toBe(code);
      expect(reveal.reasonLine.length).toBeGreaterThan(0);
      expect(reveal.returning).toBe(false);
    }
  });

  it('greets a returning player and softens the call to action', () => {
    const reveal = revealFor(1, 'already_placed');
    expect(reveal.returning).toBe(true);
    expect(reveal.reasonLine).toBe('Picking up where you left off.');
    expect(reveal.ctaLabel).toBe('CONTINUE');
  });

  it('falls back safely for an unrecognised reason', () => {
    const reveal = revealFor(3, 'something_new_from_the_rpc');
    expect(reveal.reasonLine).toBe('Your starting track is set.');
    expect(reveal.ctaLabel).toBe('START TRAINING');
  });
});
