import { describe, expect, it } from 'vitest';

import { BENNYS_GARDEN_ROUTES } from './bennysGardenRoads';
import { createGardenChunkLayouts } from './gardenMap';
import {
  isOnRoute,
  pickRouteNodes,
  routeSegmentPixels,
  routeStepLengths,
  walkWorldTrail,
} from './worldMapGeometry';

function maxJump(variant: keyof typeof BENNYS_GARDEN_ROUTES): number {
  return Math.max(...routeStepLengths(BENNYS_GARDEN_ROUTES[variant]));
}

describe('worldMapGeometry', () => {
  it('measures Benny route steps without leaving the authored polyline', () => {
    expect(maxJump('a')).toBeLessThan(8);
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
