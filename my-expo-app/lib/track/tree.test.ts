import { describe, expect, it } from 'vitest';

import {
  BENNYS_GARDEN_NODES,
  canEnterStage,
  canStandOn,
  chunkIndexForStage,
  currentStageNumber,
  shouldAutoWalkOnFocus,
  fitMap,
  flattenMapChunks,
  levelMarkers,
  lockReason,
  mapPercentToUnit,
  mapNodeAnchorOffset,
  MAP_NODE_CHIP_HEIGHT,
  nodePixels,
  progressChunkIndex,
  stageProgressPercent,
  stageStatus,
  type MapChunk,
} from './tree';

const TWO_CHUNKS = [
  { id: 'chunk-1', index: 0, nodes: BENNYS_GARDEN_NODES },
  {
    id: 'chunk-2',
    index: 1,
    nodes: [
      {
        id: 'stage-5',
        number: 5,
        title: 'Garden gate',
        chunkIndex: 1,
        left: '56%',
        top: '78%',
      },
    ],
  },
] as const satisfies readonly MapChunk[];

describe('overworld unlocks', () => {
  it('opens only Stage 1 for a new placement', () => {
    expect(BENNYS_GARDEN_NODES).toHaveLength(4);
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
    expect(lockReason(1, 0, 0, '7h 12m')).toBe('Chips are spent. Refills in 7h 12m.');
  });

  it('keeps later nodes locked until the previous stage is done', () => {
    expect(lockReason(3, 1, 3)).toMatch(/Stage 2/i);
    expect(canEnterStage(2, 1, 3)).toBe(true);
  });

  it('stamps completed / current / locked onto the placeholder nodes', () => {
    const markers = levelMarkers(1);
    expect(markers.map((marker) => marker.status)).toEqual([
      'completed',
      'current',
      'locked',
      'locked',
    ]);
    expect(markers[0]?.spotsCompleted).toBe(7);
    expect(markers[0]?.progressFraction).toBe(1);
    expect(markers[1]?.spotsCompleted).toBe(0);
    expect(markers[2]?.spotsCompleted).toBe(0);
  });

  it('attaches in-progress spot counts to the current node', () => {
    const markers = levelMarkers(1, undefined, { 2: 3 });
    expect(markers[1]?.status).toBe('current');
    expect(markers[1]?.spotsCompleted).toBe(3);
    expect(markers[1]?.progressFraction).toBeCloseTo(3 / 7);
    expect(stageProgressPercent(3)).toBe(43);
    expect(mapNodeAnchorOffset().x).toBe(38);
    expect(mapNodeAnchorOffset().y).toBeCloseTo(MAP_NODE_CHIP_HEIGHT / 2);
  });
});

describe('map coordinates', () => {
  it('keeps an exact 9:16 ratio inside a phone-like portrait area', () => {
    const map = fitMap(390, 660);
    expect(map.width).toBeCloseTo(660 * (9 / 16));
    expect(map.height).toBe(660);
    expect(map.width / map.height).toBeCloseTo(9 / 16);
  });

  it('letterboxes when the area is wider than the map', () => {
    const map = fitMap(900, 800);
    expect(map.height).toBe(800);
    expect(map.width).toBeCloseTo(800 * (9 / 16));
  });

  it('scales percentage-based node positions into pixels', () => {
    const node = BENNYS_GARDEN_NODES[0]!;
    const point = nodePixels(node, { width: 100, height: 200 });
    expect(point.x).toBeCloseTo(44);
    expect(point.y).toBeCloseTo(156);
  });

  it('places later chunks above the first chunk in world space', () => {
    const first = nodePixels(BENNYS_GARDEN_NODES[0]!, { width: 100, height: 200 }, 2);
    const fifth = nodePixels(TWO_CHUNKS[1].nodes[0], { width: 100, height: 200 }, 2);
    expect(first.y).toBeCloseTo(356);
    expect(fifth.y).toBeCloseTo(156);
  });

  it('rejects invalid world-template percentages', () => {
    expect(mapPercentToUnit('45%')).toBeCloseTo(0.45);
    expect(() => mapPercentToUnit('120%')).toThrow(RangeError);
  });
});

describe('map chunks', () => {
  it('flattens expandable chunks in progression order', () => {
    expect(flattenMapChunks(TWO_CHUNKS).map((node) => node.number)).toEqual([1, 2, 3, 4, 5]);
  });

  it('moves the camera target to the next chunk after stage four', () => {
    expect(chunkIndexForStage(4, TWO_CHUNKS)).toBe(0);
    expect(progressChunkIndex(3, TWO_CHUNKS)).toBe(0);
    expect(progressChunkIndex(4, TWO_CHUNKS)).toBe(1);
  });
});

describe('shouldAutoWalkOnFocus', () => {
  it('walks from a just-cleared node to the newly unlocked checkpoint', () => {
    expect(shouldAutoWalkOnFocus(1, 1, 12)).toBe(2);
    expect(shouldAutoWalkOnFocus(4, 4, 12)).toBe(5);
  });

  it('stays put on first load and after the last node', () => {
    expect(shouldAutoWalkOnFocus(1, 0, 12)).toBeNull();
    expect(shouldAutoWalkOnFocus(12, 12, 12)).toBeNull();
    expect(shouldAutoWalkOnFocus(2, 1, 12)).toBeNull();
  });
});
