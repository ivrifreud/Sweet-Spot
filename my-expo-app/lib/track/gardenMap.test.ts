import { describe, expect, it } from 'vitest';

import { BENNYS_GARDEN_ROUTES } from './bennysGardenRoads';
import {
  createGardenChunkLayouts,
  isOnRoute,
  pickGardenVariant,
  pickRouteNodes,
  routeSegmentPixels,
  routeStepLengths,
  walkGardenTrail,
} from './gardenMap';

function maxJump(variant: keyof typeof BENNYS_GARDEN_ROUTES): number {
  return Math.max(...routeStepLengths(BENNYS_GARDEN_ROUTES[variant]));
}

describe('authored garden routes', () => {
  it.each(['a', 'b', 'c'] as const)(
    'starts at the bottom entrance and finishes at the top exit on map %s',
    (variant) => {
      const route = BENNYS_GARDEN_ROUTES[variant];
      expect(route[0]!.top).toBeGreaterThan(85);
      expect(route[route.length - 1]!.top).toBeLessThan(20);
      expect(route.some((point) => point.surface === 'bridge')).toBe(true);
    }
  );

  it('has no discontinuous jumps onto grass or props', () => {
    expect(maxJump('a')).toBeLessThan(12);
    expect(maxJump('b')).toBeLessThan(12);
    expect(maxJump('c')).toBeLessThan(12);
  });
});

describe('pickRouteNodes', () => {
  it('places four ordered nodes on safe route anchors', () => {
    const rng = () => 0.4;
    for (const variant of ['a', 'b', 'c'] as const) {
      const route = BENNYS_GARDEN_ROUTES[variant];
      const nodes = pickRouteNodes(route, 4, rng);
      expect(nodes).toHaveLength(4);
      for (let i = 1; i < nodes.length; i += 1) {
        expect(nodes[i]!.routeIndex).toBeGreaterThan(nodes[i - 1]!.routeIndex);
      }
      for (const node of nodes) {
        const point = route[node.routeIndex]!;
        expect(point.nodeSafe).toBe(true);
        expect(isOnRoute(Number.parseFloat(node.left), Number.parseFloat(node.top), route)).toBe(
          true
        );
      }
    }
  });

  it('does not treat a grass corner as the route', () => {
    expect(isOnRoute(8, 50, BENNYS_GARDEN_ROUTES.b)).toBe(false);
  });
});

describe('createGardenChunkLayouts', () => {
  it('cycles maps without repeating the previous chunk', () => {
    const rng = () => 0;
    const layouts = createGardenChunkLayouts(12, rng);
    expect(layouts.map((layout) => layout.variantId)).toEqual(['a', 'b', 'a']);
    expect(layouts).toHaveLength(3);
    expect(layouts[0]?.nodes).toHaveLength(4);
    expect(layouts[0]?.nodes.map((node) => node.number)).toEqual([1, 2, 3, 4]);
    expect(layouts[2]?.nodes.map((node) => node.number)).toEqual([9, 10, 11, 12]);
    expect(layouts[0]?.route).toBe(BENNYS_GARDEN_ROUTES.a);
  });

  it('picks a different opening map when the roll changes', () => {
    expect(pickGardenVariant(null, () => 0)).toBe('a');
    expect(pickGardenVariant(null, () => 0.99)).toBe('c');
    expect(pickGardenVariant('b', () => 0)).not.toBe('b');
  });
});

describe('shared route geometry', () => {
  const map = { width: 100, height: 200 };
  const layouts = createGardenChunkLayouts(12, () => 0);
  const nodes = layouts.flatMap((layout) => layout.nodes);
  const chunks = layouts.map((layout) => ({
    index: layout.nodes[0]!.chunkIndex,
    route: layout.route,
  }));

  it('uses the same subpath for the dotted trail and Benny between two stages', () => {
    const from = nodes.find((node) => node.number === 1)!;
    const to = nodes.find((node) => node.number === 2)!;
    const dotted = routeSegmentPixels(from, to, map, chunks);
    const walk = walkGardenTrail(1, 2, map, nodes, chunks);
    expect(walk).toEqual(dotted);
    expect(walk.length).toBeGreaterThan(1);
  });

  it('crosses a chunk boundary along both authored exits instead of cutting grass', () => {
    const trail = walkGardenTrail(4, 5, map, nodes, chunks);
    const from = nodes.find((node) => node.number === 4)!;
    const to = nodes.find((node) => node.number === 5)!;
    const dotted = routeSegmentPixels(from, to, map, chunks);
    expect(trail).toEqual(dotted);
    expect(trail[0]?.y).toBeGreaterThan(trail[trail.length - 1]!.y);
    const fromChunk = chunks.find((chunk) => chunk.index === 0)!;
    const toChunk = chunks.find((chunk) => chunk.index === 1)!;
    expect(
      trail.some(
        (point) =>
          Math.abs(
            point.x - (fromChunk.route[fromChunk.route.length - 1]!.left / 100) * map.width
          ) < 0.6
      )
    ).toBe(true);
    expect(
      trail.some((point) => Math.abs(point.x - (toChunk.route[0]!.left / 100) * map.width) < 0.6)
    ).toBe(true);
  });
});
