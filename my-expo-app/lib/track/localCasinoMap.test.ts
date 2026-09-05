import { describe, expect, it } from 'vitest';

import { LOCAL_CASINO_ROUTES } from './localCasinoRoads';
import { createLocalCasinoChunkLayouts } from './localCasinoMap';
import { routeSegmentPixels, routeStepLengths, walkWorldTrail } from './worldMapGeometry';

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

  it('keeps every authored step under a 12-point jump', () => {
    expect(maxJump('a')).toBeLessThan(12);
    expect(maxJump('b')).toBeLessThan(12);
    expect(maxJump('c')).toBeLessThan(12);
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
