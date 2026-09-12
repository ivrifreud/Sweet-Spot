import type { WorldRoutePoint, WorldRouteSurface } from './worldRoute';

export type GardenRouteSurface = Extract<WorldRouteSurface, 'road' | 'bridge'>;

export type GardenRoutePoint = WorldRoutePoint;

function road(left: number, top: number, nodeSafe = true): GardenRoutePoint {
  return { left, top, surface: 'road', nodeSafe };
}

function landing(left: number, top: number): GardenRoutePoint {
  return { left, top, surface: 'road', nodeSafe: true, landing: true };
}

function bridge(left: number, top: number, nodeSafe = false): GardenRoutePoint {
  return { left, top, surface: 'bridge', nodeSafe };
}

/**
 * Authored bottom-to-top centerlines. Points are [left%, top%] along the
 * dirt road. Bridges are walkable but never host chips. `landing` marks round
 * road pads the path finder prefers for checkpoints.
 */
export const BENNYS_GARDEN_ROUTES = {
  a: [
    road(54.8, 92.4, false),
    landing(53.6, 87.6),
    road(51.2, 83.2),
    road(47.4, 79.2),
    road(43.2, 75.4),
    landing(40.6, 71.2),
    road(41.4, 66.8),
    landing(46.2, 62.8),
    road(52.4, 59.2, false),
    road(59.0, 55.8, false),
    road(65.2, 53.0, false),
    bridge(70.4, 50.6),
    bridge(73.8, 48.0),
    bridge(71.6, 45.4),
    road(67.8, 42.2, false),
    road(68.6, 38.8, false),
    landing(68.0, 35.2),
    road(65.8, 31.6, false),
    landing(61.2, 28.4),
    road(58.0, 26.8),
    landing(55.4, 25.4),
    road(52.0, 23.8),
    road(48.4, 21.6),
    road(45.2, 18.8),
    landing(42.4, 14.8),
    road(44.0, 12.6),
    road(46.6, 11.4, false),
  ],
  b: [
    road(52.4, 92.2, false),
    landing(52.0, 87.4),
    road(49.6, 82.8),
    road(45.2, 78.6),
    road(40.2, 74.6),
    landing(38.4, 70.2),
    road(42.6, 66.0),
    landing(48.2, 61.8),
    road(50.4, 57.4),
    road(47.4, 54.8, false),
    road(43.6, 52.6, false),
    bridge(41.4, 50.4),
    bridge(41.0, 48.2),
    road(43.2, 45.6, false),
    landing(47.0, 42.4),
    road(48.8, 40.8),
    road(46.4, 36.6),
    road(42.2, 32.8),
    landing(40.6, 28.6),
    road(44.2, 24.6),
    road(48.0, 20.8),
    road(44.6, 16.8),
    road(43.2, 12.6, false),
  ],
  c: [
    road(52.6, 92.0, false),
    landing(53.4, 87.2),
    road(52.2, 83.0),
    landing(49.4, 79.6),
    road(43.8, 78.8),
    road(36.4, 77.6),
    road(32.4, 76.4),
    road(28.4, 75.2),
    landing(25.6, 70.4),
    road(28.8, 66.2),
    road(36.0, 63.2),
    road(43.4, 60.4),
    road(47.8, 57.2),
    road(47.2, 54.6, false),
    bridge(43.6, 51.4),
    bridge(42.8, 48.4),
    road(45.2, 45.2, false),
    landing(46.8, 44.4),
    road(49.4, 40.2),
    road(48.6, 35.8),
    road(45.2, 31.4),
    road(41.4, 27.0),
    landing(39.6, 22.4),
    road(42.4, 18.0),
    road(45.8, 14.0),
    road(47.2, 11.0, false),
  ],
} as const satisfies Record<string, readonly GardenRoutePoint[]>;

export type GardenMapVariantId = keyof typeof BENNYS_GARDEN_ROUTES;
