import type { WorldRoutePoint } from './worldRoute';

function road(left: number, top: number, nodeSafe = true): WorldRoutePoint {
  return { left, top, surface: 'road', nodeSafe };
}

function bridge(left: number, top: number, nodeSafe = true): WorldRoutePoint {
  return { left, top, surface: 'bridge', nodeSafe };
}

function boardwalk(left: number, top: number, nodeSafe = true): WorldRoutePoint {
  return { left, top, surface: 'boardwalk', nodeSafe };
}

/**
 * Authored bottom-to-top centerlines for the outdoor desert town.
 * Points are [left%, top%] along dusty road, boardwalk, and bridge.
 * nodeSafe is false at gates, façades, and prop collisions.
 */
export const LOCAL_CASINO_ROUTES = {
  a: [
    road(52.0, 91.4, false),
    road(51.2, 86.0),
    road(47.4, 81.2),
    road(41.8, 77.6, false),
    road(38.6, 73.0),
    road(40.8, 67.6),
    road(46.4, 62.8),
    road(53.2, 58.4),
    road(58.6, 53.6),
    road(56.4, 48.2),
    road(50.8, 43.4),
    road(46.2, 38.0),
    road(47.8, 32.4),
    road(51.6, 26.8),
    road(54.0, 21.2),
    road(53.2, 15.6, false),
  ],
  b: [
    road(51.4, 90.8, false),
    road(50.6, 85.4),
    road(46.8, 80.6),
    road(42.4, 76.0),
    road(40.8, 70.8),
    road(44.6, 65.6),
    road(50.2, 61.2),
    boardwalk(55.8, 57.0, false),
    boardwalk(61.4, 53.2),
    boardwalk(64.8, 48.8, false),
    boardwalk(60.2, 44.6),
    road(54.6, 40.8),
    road(48.8, 36.4),
    road(46.2, 31.0),
    road(48.6, 25.4),
    road(51.8, 20.0),
    road(52.4, 14.8, false),
  ],
  c: [
    road(51.8, 91.0, false),
    road(50.4, 85.6),
    road(46.2, 81.0),
    road(43.6, 75.8),
    road(46.8, 70.4),
    road(52.4, 65.8),
    bridge(57.6, 61.2, false),
    bridge(61.2, 56.4),
    bridge(58.4, 51.6, false),
    road(53.2, 47.0),
    road(49.4, 41.8),
    road(48.6, 36.2),
    road(51.2, 30.6),
    road(54.6, 25.2),
    road(56.2, 19.6),
    road(55.0, 14.2, false),
  ],
} as const satisfies Record<string, readonly WorldRoutePoint[]>;

export type LocalCasinoMapVariantId = keyof typeof LOCAL_CASINO_ROUTES;
