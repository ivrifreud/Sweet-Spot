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

function sampleRoute(
  route: readonly { left: number; top: number }[],
  spacing = 0.6
): { left: number; top: number }[] {
  const samples: { left: number; top: number }[] = [];
  for (let i = 0; i < route.length - 1; i += 1) {
    const from = route[i]!;
    const to = route[i + 1]!;
    const distance = Math.hypot(to.left - from.left, to.top - from.top);
    const steps = Math.max(1, Math.ceil(distance / spacing));
    for (let step = 0; step < steps; step += 1) {
      const t = step / steps;
      samples.push({
        left: from.left + (to.left - from.left) * t,
        top: from.top + (to.top - from.top) * t,
      });
    }
  }
  const last = route[route.length - 1]!;
  samples.push({ left: last.left, top: last.top });
  return samples;
}

function inEllipse(
  point: { left: number; top: number },
  cx: number,
  cy: number,
  rx: number,
  ry: number
): boolean {
  const dx = (point.left - cx) / rx;
  const dy = (point.top - cy) / ry;
  return dx * dx + dy * dy <= 1;
}

describe('authored garden routes', () => {
  it.each(['a', 'b', 'c'] as const)(
    'starts near the bottom entrance and finishes at the top exit on map %s',
    (variant) => {
      const route = BENNYS_GARDEN_ROUTES[variant];
      expect(route[0]!.top).toBeGreaterThan(78);
      expect(route[route.length - 1]!.top).toBeLessThan(20);
      expect(route.some((point) => point.surface === 'bridge')).toBe(true);
    }
  );

  it('has no discontinuous jumps onto grass or props', () => {
    expect(maxJump('a')).toBeLessThan(8);
    expect(maxJump('b')).toBeLessThan(8);
    expect(maxJump('c')).toBeLessThan(8);
  });

  it('keeps map A on the dirt road around the apple tree and over the painted bridge', () => {
    const samples = sampleRoute(BENNYS_GARDEN_ROUTES.a);
    expect(samples.some((point) => inEllipse(point, 36, 37, 17, 13))).toBe(false);
    const afterBridge = samples.filter((point) => point.top > 32 && point.top < 42);
    expect(afterBridge.length).toBeGreaterThan(0);
    expect(afterBridge.every((point) => point.left > 58)).toBe(true);
  });

  it('keeps map B on the card-suit road over the left plank, not the side bridge', () => {
    const samples = sampleRoute(BENNYS_GARDEN_ROUTES.b);
    const river = samples.filter((point) => point.top >= 46 && point.top <= 52);
    expect(river.length).toBeGreaterThan(0);
    expect(river.every((point) => point.left >= 39 && point.left <= 45)).toBe(true);
    expect(
      samples.some((point) => point.left > 47 && point.left < 64 && point.top > 45 && point.top < 54)
    ).toBe(false);
    expect(
      BENNYS_GARDEN_ROUTES.b.some((point) => point.nodeSafe && point.top >= 46 && point.top <= 52)
    ).toBe(false);
  });

  it('keeps map C on the west dirt loop then over the left plank', () => {
    const samples = sampleRoute(BENNYS_GARDEN_ROUTES.c);
    const westLoop = samples.filter((point) => point.top >= 68 && point.top <= 78);
    expect(westLoop.some((point) => point.left < 36)).toBe(true);
    const river = samples.filter((point) => point.top >= 46 && point.top <= 52);
    expect(river.length).toBeGreaterThan(0);
    expect(river.every((point) => point.left >= 38 && point.left <= 52)).toBe(true);
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
        expect(point.surface).toBe('road');
        expect(point.landing).toBe(true);
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
  it('freezes the four chips on each Garden map at the signed-off seats', () => {
    const layouts = createGardenChunkLayouts(12);
    const seats = (chunkIndex: number) =>
      layouts[chunkIndex]!.nodes.map((node) => [
        Number.parseFloat(node.left),
        Number.parseFloat(node.top),
      ]);
    expect(seats(0)).toEqual([
      [55.6, 83.6],
      [34.2, 66.8],
      [91.2, 32.4],
      [40.4, 18.8],
    ]);
    expect(seats(1)).toEqual([
      [55, 84.4],
      [40.4, 66.8],
      [42, 39.4],
      [42.6, 19.6],
    ]);
    expect(seats(2)).toEqual([
      [56.4, 83.2],
      [40.4, 74],
      [40.8, 60.4],
      [40.6, 40.4],
    ]);
    const first = pickRouteNodes(BENNYS_GARDEN_ROUTES.a, 4, () => 0);
    const last = pickRouteNodes(BENNYS_GARDEN_ROUTES.a, 4, () => 0.99);
    expect(first.map((node) => node.routeIndex)).toEqual(last.map((node) => node.routeIndex));
  });

  it('uses a fixed A→B→C climb so saving a file does not shuffle maps', () => {
    const rng = () => 0.99;
    const layouts = createGardenChunkLayouts(12, rng);
    expect(layouts.map((layout) => layout.variantId)).toEqual(['a', 'b', 'c']);
    expect(layouts).toHaveLength(3);
    expect(layouts[0]?.nodes).toHaveLength(4);
    expect(layouts[0]?.nodes.map((node) => node.number)).toEqual([1, 2, 3, 4]);
    expect(layouts[2]?.nodes.map((node) => node.number)).toEqual([9, 10, 11, 12]);
    expect(layouts[0]?.route).toBe(BENNYS_GARDEN_ROUTES.a);
    expect(createGardenChunkLayouts(12, () => 0).map((layout) => layout.variantId)).toEqual([
      'a',
      'b',
      'c',
    ]);
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
