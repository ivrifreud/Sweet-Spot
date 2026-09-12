import { describe, expect, it } from 'vitest';

import { BENNYS_GARDEN_ROUTES } from './bennysGardenRoads';
import { createGardenChunkLayouts } from './gardenMap';
import {
  isOnRoute,
  pickRouteNodes,
  routeSegmentPixels,
  walkWorldTrail,
} from './worldMapGeometry';

describe('worldMapGeometry', () => {
  it('places garden chips without requiring a perfectly dense polyline', () => {
    expect(() => pickRouteNodes(BENNYS_GARDEN_ROUTES.a, 4, () => 0.5)).not.toThrow();
    expect(isOnRoute(8, 50, BENNYS_GARDEN_ROUTES.b)).toBe(false);
  });

  it('picks a landing over a nearby ordinary road point in the same band', () => {
    const route = [
      { left: 50, top: 95, surface: 'road' as const, nodeSafe: false },
      { left: 50, top: 82, surface: 'road' as const, nodeSafe: true },
      { left: 50, top: 78, surface: 'road' as const, nodeSafe: true, landing: true },
      { left: 50, top: 60, surface: 'road' as const, nodeSafe: true, landing: true },
      { left: 50, top: 42, surface: 'bridge' as const, nodeSafe: true },
      { left: 50, top: 28, surface: 'road' as const, nodeSafe: true, landing: true },
      { left: 50, top: 12, surface: 'road' as const, nodeSafe: true, landing: true },
      { left: 50, top: 6, surface: 'road' as const, nodeSafe: false },
    ];
    const nodes = pickRouteNodes(route, 4, () => 0);
    expect(nodes.map((node) => node.routeIndex)).toEqual([2, 3, 5, 6]);
    expect(route[4]!.surface).toBe('bridge');
  });

  it('places four chips from extra landings even when one step is a huge gap', () => {
    const route = [
      { left: 50, top: 95, surface: 'road' as const, nodeSafe: false },
      { left: 50, top: 88, surface: 'road' as const, nodeSafe: true, landing: true },
      { left: 12, top: 12, surface: 'road' as const, nodeSafe: true, landing: true },
      { left: 14, top: 10, surface: 'road' as const, nodeSafe: true, landing: true },
      { left: 16, top: 8, surface: 'road' as const, nodeSafe: true, landing: true },
      { left: 18, top: 6, surface: 'road' as const, nodeSafe: true, landing: true },
      { left: 50, top: 4, surface: 'road' as const, nodeSafe: false },
    ];
    const nodes = pickRouteNodes(route, 4, () => 0.5);
    expect(nodes).toHaveLength(4);
    expect(nodes.map((node) => node.routeIndex)).toEqual([1, 2, 4, 5]);
    for (const node of nodes) {
      expect(route[node.routeIndex]!.landing).toBe(true);
    }
  });

  it('picks four ordered safe nodes on a generic world route', () => {
    const route = BENNYS_GARDEN_ROUTES.a;
    const nodes = pickRouteNodes(route, 4, () => 0.4);
    expect(nodes).toHaveLength(4);
    for (let i = 1; i < nodes.length; i += 1) {
      expect(nodes[i]!.routeIndex).toBeGreaterThan(nodes[i - 1]!.routeIndex);
    }
    for (const node of nodes) {
      expect(route[node.routeIndex]!.nodeSafe).toBe(true);
      expect(route[node.routeIndex]!.surface).toBe('road');
      expect(route[node.routeIndex]!.landing).toBe(true);
    }
  });

  it('walks the same dotted subpath as Benny between two stages', () => {
    const map = { width: 100, height: 200 };
    const layouts = createGardenChunkLayouts(12, () => 0);
    const nodes = layouts.flatMap((layout) => layout.nodes);
    const chunks = layouts.map((layout) => ({
      index: layout.nodes[0]!.chunkIndex,
      route: layout.route,
    }));
    const from = nodes.find((node) => node.number === 1)!;
    const to = nodes.find((node) => node.number === 2)!;
    const dotted = routeSegmentPixels(from, to, map, chunks);
    expect(walkWorldTrail(1, 2, map, nodes, chunks)).toEqual(dotted);
  });

  it('crosses a chunk boundary along authored exits', () => {
    const map = { width: 100, height: 200 };
    const layouts = createGardenChunkLayouts(12, () => 0);
    const nodes = layouts.flatMap((layout) => layout.nodes);
    const chunks = layouts.map((layout) => ({
      index: layout.nodes[0]!.chunkIndex,
      route: layout.route,
    }));
    const trail = walkWorldTrail(4, 5, map, nodes, chunks);
    const from = nodes.find((node) => node.number === 4)!;
    const to = nodes.find((node) => node.number === 5)!;
    expect(trail).toEqual(routeSegmentPixels(from, to, map, chunks));
    expect(trail[0]?.y).toBeGreaterThan(trail[trail.length - 1]!.y);
  });
});
