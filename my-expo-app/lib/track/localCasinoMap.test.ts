import { describe, expect, it } from 'vitest';

import { LOCAL_CASINO_ROUTES } from './localCasinoRoads';
import { createLocalCasinoChunkLayouts } from './localCasinoMap';
import { pickRouteNodes, routeSegmentPixels, routeStepLengths, walkWorldTrail } from './worldMapGeometry';

function maxJump(variant: keyof typeof LOCAL_CASINO_ROUTES): number {
  return Math.max(...routeStepLengths(LOCAL_CASINO_ROUTES[variant]));
}

describe('authored Local Casino routes', () => {
  it.each(['a', 'b', 'c'] as const)(
    'starts at the bottom entrance and finishes at the top exit on map %s',
    (variant) => {
      const route = LOCAL_CASINO_ROUTES[variant];
      expect(route[0]!.top).toBeGreaterThan(85);
      expect(route[route.length - 1]!.top).toBeLessThan(20);
    }
  );

  it('keeps every authored step under an 8-point jump', () => {
    expect(maxJump('a')).toBeLessThan(8);
    expect(maxJump('b')).toBeLessThan(8);
    expect(maxJump('c')).toBeLessThan(8);
  });

  it('keeps map A on the town road instead of cutting through the left lot', () => {
    const mid = LOCAL_CASINO_ROUTES.a.filter((point) => point.top >= 62 && point.top <= 74);
    expect(mid.length).toBeGreaterThan(0);
    expect(mid.every((point) => point.left > 42)).toBe(true);
  });

  it('includes both bridge and boardwalk surfaces on the town climb', () => {
    const points = (['a', 'b', 'c'] as const).flatMap((id) => [...LOCAL_CASINO_ROUTES[id]]);
    expect(points.some((point) => point.surface === 'bridge')).toBe(true);
    expect(points.some((point) => point.surface === 'boardwalk')).toBe(true);
  });
});

describe('createLocalCasinoChunkLayouts', () => {
  it('uses a fixed A→B→C climb with twelve sequential stages', () => {
    const layouts = createLocalCasinoChunkLayouts(12);
    expect(layouts.map((layout) => layout.variantId)).toEqual(['a', 'b', 'c']);
    const numbers = layouts.flatMap((layout) => layout.nodes.map((node) => node.number));
    expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(layouts[0]!.nodes.map((node) => node.id)).toEqual([
      'local-casino-stage-1',
      'local-casino-stage-2',
      'local-casino-stage-3',
      'local-casino-stage-4',
    ]);
  });

  it('freezes the four chips on each Local Casino chunk at the signed-off seats', () => {
    const layouts = createLocalCasinoChunkLayouts(12);
    const seats = (chunkIndex: number) =>
      layouts[chunkIndex]!.nodes.map((node) => [
        Number.parseFloat(node.left),
        Number.parseFloat(node.top),
      ]);
    expect(seats(0)).toEqual([
      [51.2, 82.6],
      [52.2, 66.8],
      [55.2, 40],
      [21.2, 18.6],
    ]);
    expect(seats(1)).toEqual([
      [45, 81.8],
      [41.4, 63.2],
      [53.8, 41.2],
      [54.6, 22.8],
    ]);
    expect(seats(2)).toEqual([
      [53.6, 83.2],
      [52.4, 57.2],
      [47, 43.2],
      [45.8, 25.2],
    ]);
    const rngA = pickRouteNodes(LOCAL_CASINO_ROUTES.a, 4, () => 0);
    const rngB = pickRouteNodes(LOCAL_CASINO_ROUTES.a, 4, () => 0.99);
    expect(rngA.map((node) => node.routeIndex)).toEqual(rngB.map((node) => node.routeIndex));
  });

  it('exits Local Casino A to the right after the last chip', () => {
    const chunk = createLocalCasinoChunkLayouts(12)[0]!;
    const last = chunk.nodes[3]!;
    const after = LOCAL_CASINO_ROUTES.a.slice(last.routeIndex!);
    for (let i = 1; i < after.length; i += 1) {
      expect(after[i]!.left).toBeGreaterThan(after[i - 1]!.left);
    }
  });

  it('does not climb the Local Casino A stair treads between hitching and the crest', () => {
    const onSteps = LOCAL_CASINO_ROUTES.a.filter(
      (point) => point.top >= 28 && point.top <= 38 && point.left >= 43 && point.left <= 50
    );
    expect(onSteps).toHaveLength(0);
  });

  it('places four ordered unique safe nodes on each chunk route', () => {
    const layouts = createLocalCasinoChunkLayouts(12);
    for (const layout of layouts) {
      expect(layout.nodes).toHaveLength(4);
      const indexes = layout.nodes.map((node) => node.routeIndex);
      expect(new Set(indexes).size).toBe(4);
      for (let i = 1; i < indexes.length; i += 1) {
        expect(indexes[i]!).toBeGreaterThan(indexes[i - 1]!);
      }
      for (const node of layout.nodes) {
        expect(node.routeIndex).toBeDefined();
        expect(layout.route[node.routeIndex!]!.nodeSafe).toBe(true);
        expect(layout.route[node.routeIndex!]!.surface).toBe('road');
        expect(layout.route[node.routeIndex!]!.landing).toBe(true);
      }
    }
  });

  it('keeps dotted path and avatar walk on the same authored trail', () => {
    const map = { width: 100, height: 200 };
    const layouts = createLocalCasinoChunkLayouts(12);
    const nodes = layouts.flatMap((layout) => layout.nodes);
    const chunks = layouts.map((layout) => ({
      index: layout.nodes[0]!.chunkIndex,
      route: layout.route,
    }));
    const dotted = routeSegmentPixels(
      nodes.find((node) => node.number === 1)!,
      nodes.find((node) => node.number === 2)!,
      map,
      chunks
    );
    expect(walkWorldTrail(1, 2, map, nodes, chunks)).toEqual(dotted);
    const climb = walkWorldTrail(4, 5, map, nodes, chunks);
    expect(climb).toEqual(
      routeSegmentPixels(
        nodes.find((node) => node.number === 4)!,
        nodes.find((node) => node.number === 5)!,
        map,
        chunks
      )
    );
  });
});
