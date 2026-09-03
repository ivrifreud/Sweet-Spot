import { describe, expect, it } from 'vitest';

import {
  getChipLayers,
  getChipPileHeight,
  layoutHeroChipCluster,
  remainingPileChips,
} from './chipPileLayout';

describe('getChipLayers', () => {
  it('stacks each later chip upward and above the previous chip', () => {
    expect(getChipLayers(5, 10)).toEqual([
      { index: 0, translateY: 0, zIndex: 0 },
      { index: 1, translateY: -10, zIndex: 1 },
      { index: 2, translateY: -20, zIndex: 2 },
      { index: 3, translateY: -30, zIndex: 3 },
      { index: 4, translateY: -40, zIndex: 4 },
    ]);
  });

  it('renders no layers for an empty or negative pile', () => {
    expect(getChipLayers(0, 10)).toEqual([]);
    expect(getChipLayers(-3, 10)).toEqual([]);
  });
});

describe('getChipPileHeight', () => {
  it('includes the chip image plus the upward travel of every later chip', () => {
    expect(getChipPileHeight(44, 5, 10)).toBe(84);
  });

  it('returns zero for an empty pile', () => {
    expect(getChipPileHeight(44, 0, 10)).toBe(0);
  });
});

describe('remainingPileChips', () => {
  it('spends from a single column and keeps the last chip', () => {
    expect(remainingPileChips(8, 0)).toBe(8);
    expect(remainingPileChips(8, 1)).toBe(7);
    expect(remainingPileChips(8, 3)).toBe(5);
    expect(remainingPileChips(8, 20)).toBe(1);
  });
});

describe('layoutHeroChipCluster', () => {
  it('clusters four overlapping piles with the play stack in the center', () => {
    const cluster = layoutHeroChipCluster(44, 39, 7, 8);
    expect(cluster.piles).toHaveLength(4);
    expect(cluster.width).toBeGreaterThan(44);
    expect(cluster.playPile?.key).toBe('center');
    expect(cluster.piles.find((pile) => pile.key === 'front')?.zIndex).toBeGreaterThan(
      cluster.piles.find((pile) => pile.key === 'center')?.zIndex ?? 0
    );
    const left = cluster.piles.find((pile) => pile.key === 'backLeft');
    const right = cluster.piles.find((pile) => pile.key === 'backRight');
    const front = cluster.piles.find((pile) => pile.key === 'front');
    const center = cluster.piles.find((pile) => pile.key === 'center');
    expect(left?.x).toBe(0);
    expect(right?.x ?? 0).toBeGreaterThan(left?.x ?? 0);
    expect((front?.x ?? 0) - (left?.x ?? 0)).toBeGreaterThanOrEqual(20);
    expect((center?.x ?? 0) - (front?.x ?? 0)).toBeGreaterThanOrEqual(20);
    expect((right?.x ?? 0) - (center?.x ?? 0)).toBeGreaterThanOrEqual(20);
  });
});
