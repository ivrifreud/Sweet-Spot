import { describe, expect, it } from 'vitest';

import { LOCAL_CASINO_ROUTES } from './localCasinoRoads';
import { createLocalCasinoChunkLayouts } from './localCasinoMap';
import { landingClusters, pickRouteNodes, routeSegmentPixels, routeStepLengths, walkWorldTrail } from './worldMapGeometry';

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

  it('always places a checkpoint in the Local Casino A stair-terrace circle, not on the steps', () => {
    const chunk = createLocalCasinoChunkLayouts(12)[0]!;
    expect(chunk.variantId).toBe('a');
    const hitching = chunk.nodes[2]!;
    const point = chunk.route[hitching.routeIndex!]!;
    expect(point.landingGroup).toBe('a-terrace');
    const dx = (point.left - 48.2) / 4.2;
    const dy = (point.top - 47.2) / 3.6;
    expect(dx * dx + dy * dy).toBeLessThanOrEqual(1);
    expect(point.top < 51 || point.top > 58 || point.left < 46 || point.left > 54).toBe(true);
  });

  it('uses four landing clusters in order, picking inside each circle', () => {
    const route = LOCAL_CASINO_ROUTES.a;
    const clusters = landingClusters(route);
    expect(clusters).toHaveLength(4);
    expect(clusters[2]).toHaveLength(3);
    expect(clusters[3]).toHaveLength(3);
    const first = pickRouteNodes(route, 4, () => 0);
    const last = pickRouteNodes(route, 4, () => 0.99);
    expect(clusters[2]).toContain(first[2]!.routeIndex);
    expect(clusters[2]).toContain(last[2]!.routeIndex);
    expect(clusters[3]).toContain(first[3]!.routeIndex);
    expect(clusters[3]).toContain(last[3]!.routeIndex);
  });

  it('always places the last Local Casino A node in the crest circle, then exits right', () => {
    const chunk = createLocalCasinoChunkLayouts(12)[0]!;
    const last = chunk.nodes[3]!;
    const point = chunk.route[last.routeIndex!]!;
    expect(point.landingGroup).toBe('a-crest');
    const dx = (point.left - 34.4) / 5.2;
    const dy = (point.top - 14.8) / 4.2;
    expect(dx * dx + dy * dy).toBeLessThanOrEqual(1);
    const after = LOCAL_CASINO_ROUTES.a.slice(last.routeIndex!);
    for (let i = 1; i < after.length; i += 1) {
      expect(after[i]!.left).toBeGreaterThan(after[i - 1]!.left);
    }
  });

  it('loops Local Casino A left of the upper stairs instead of climbing the steps', () => {
    const upperStairs = LOCAL_CASINO_ROUTES.a.filter(
      (point) => point.top >= 32 && point.top <= 41
    );
    expect(upperStairs.length).toBeGreaterThan(0);
    expect(upperStairs.every((point) => point.left <= 42)).toBe(true);
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
