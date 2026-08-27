import { describe, expect, it } from 'vitest';

import {
  MAP_NODES,
  canEnterStage,
  canStandOn,
  currentStageNumber,
  fitMap,
  lockReason,
  nodePixels,
  stageStatus,
} from './tree';

describe('overworld unlocks', () => {
  it('opens only Stage 1 for a new placement', () => {
    expect(MAP_NODES).toHaveLength(4);
    expect(stageStatus(1, 0)).toBe('current');
    expect(stageStatus(2, 0)).toBe('locked');
    expect(canEnterStage(1, 0, 3)).toBe(true);
    expect(canEnterStage(2, 0, 3)).toBe(false);
    expect(canStandOn(2, 0)).toBe(false);
  });

  it('lets the walker stand on cleared nodes and the active one', () => {
    expect(canStandOn(1, 1)).toBe(true);
    expect(canStandOn(2, 1)).toBe(true);
    expect(canStandOn(3, 1)).toBe(false);
    expect(currentStageNumber(1)).toBe(2);
  });

  it('blocks play when chips are spent', () => {
    expect(canEnterStage(1, 0, 0)).toBe(false);
    expect(lockReason(1, 0, 0)).toMatch(/12 hours/i);
  });

  it('keeps later nodes locked until the previous stage is done', () => {
    expect(lockReason(3, 1, 3)).toMatch(/Stage 2/i);
    expect(canEnterStage(2, 1, 3)).toBe(true);
  });
});

describe('map coordinates', () => {
  it('fills a phone-like portrait area instead of shrinking it', () => {
    const map = fitMap(390, 660);
    expect(map.width).toBe(390);
    expect(map.height).toBe(660);
  });

  it('letterboxes when the area is wider than the map', () => {
    const map = fitMap(900, 800);
    expect(map.height).toBe(800);
    expect(map.width).toBeCloseTo(800 * (9 / 16));
  });

  it('scales node fractions into pixels', () => {
    const node = MAP_NODES[0]!;
    const point = nodePixels(node, { width: 100, height: 200 });
    expect(point.x).toBeCloseTo(node.x * 100);
    expect(point.y).toBeCloseTo(node.y * 200);
  });
});
