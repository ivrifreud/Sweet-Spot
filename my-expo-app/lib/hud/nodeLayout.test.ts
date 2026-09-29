import { describe, expect, it } from 'vitest';

import { BENNYS_GARDEN_NODES, mapNodeChipSize } from '../track/tree';
import {
  findOverlappingNodePairs,
  nodeChipSizeIsTarget,
  nodesUnderRailSafeZone,
  rectsOverlap,
} from './nodeLayout';

const PHONE = { width: 390, height: 844 };

describe('rectsOverlap', () => {
  it('detects intersecting boxes with a small gap', () => {
    expect(
      rectsOverlap(
        { left: 0, top: 0, right: 40, bottom: 40 },
        { left: 38, top: 0, right: 80, bottom: 40 }
      )
    ).toBe(true);
  });

  it('allows boxes that clear the gap', () => {
    expect(
      rectsOverlap(
        { left: 0, top: 0, right: 40, bottom: 40 },
        { left: 50, top: 0, right: 90, bottom: 40 }
      )
    ).toBe(false);
  });
});

describe('findOverlappingNodePairs', () => {
  it('reports no overlaps for the garden layout on a phone viewport', () => {
    expect(findOverlappingNodePairs(BENNYS_GARDEN_NODES, PHONE, 1)).toEqual([]);
  });
});

describe('nodesUnderRailSafeZone', () => {
  it('keeps garden nodes clear of the top rail band', () => {
    expect(nodesUnderRailSafeZone(BENNYS_GARDEN_NODES, PHONE, 0, 1)).toEqual([]);
  });
});

describe('nodeChipSizeIsTarget', () => {
  it('keeps a 390-wide phone at 53 and scales other widths', () => {
    expect(mapNodeChipSize(390)).toBe(53);
    expect(mapNodeChipSize(320)).toBeLessThan(53);
    expect(nodeChipSizeIsTarget()).toBe(true);
    expect(nodeChipSizeIsTarget(320)).toBe(false);
  });
});
