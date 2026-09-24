import { describe, expect, it } from 'vitest';

import { buildProfileStats, lessonsCompletedFromProgress } from './profileStats';

describe('lessonsCompletedFromProgress', () => {
  it('counts full stages as 7 lessons each', () => {
    expect(lessonsCompletedFromProgress(2, {})).toBe(14);
  });

  it('adds in-progress spots on the current stage only', () => {
    expect(lessonsCompletedFromProgress(2, { 3: 4, 4: 2 })).toBe(14 + 4 + 2);
  });

  it('ignores spot counts for already-completed stages', () => {
    expect(lessonsCompletedFromProgress(2, { 1: 7, 2: 3, 3: 1 })).toBe(14 + 1);
  });

  it('clamps spot counts to the stage length', () => {
    expect(lessonsCompletedFromProgress(0, { 1: 99 })).toBe(7);
  });
});

describe('buildProfileStats', () => {
  it('returns a player-facing profile summary without Elo', () => {
    expect(
      buildProfileStats({
        displayName: ' Moogi ',
        levelLabel: 'Level 1',
        worldLabel: "Benny's Garden",
        completedCount: 1,
        spotsByStage: { 2: 3 },
        streakDays: 4,
        streakBestDays: 9,
      })
    ).toEqual({
      displayName: 'Moogi',
      levelLabel: 'Level 1',
      worldLabel: "Benny's Garden",
      stagesCompleted: 1,
      lessonsCompleted: 10,
      streakDays: 4,
      streakBestDays: 9,
    });
  });
});
