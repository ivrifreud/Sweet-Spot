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
 * Traced against committed map-chunk-a/b/c.jpg. Points are [left%, top%].
 * nodeSafe is false at gates, façades, stairs rails, and prop collisions.
 */
export const LOCAL_CASINO_ROUTES = {
  a: [
    road(50.0, 93.6, false),
    road(50.2, 88.4),
    road(47.4, 83.6),
    road(41.8, 79.0),
    road(35.6, 74.4),
    road(30.8, 69.2, false),
    road(30.4, 63.8),
    road(34.6, 58.6),
    road(42.2, 53.8),
    road(51.6, 49.2),
    road(61.0, 44.6),
    road(69.2, 39.6, false),
    road(67.4, 34.0),
    road(60.8, 28.4),
    road(53.2, 22.8),
    road(47.6, 17.2),
    road(45.0, 11.4, false),
  ],
  b: [
    road(50.4, 92.8, false),
    road(51.6, 87.6),
    road(54.8, 82.4),
    road(59.2, 77.2),
    road(61.4, 72.0, false),
    road(56.8, 67.0),
    road(51.4, 62.4),
    boardwalk(50.2, 57.6, false),
    boardwalk(50.0, 52.8),
    boardwalk(50.0, 48.0, false),
    road(50.2, 43.2),
    road(50.6, 38.0),
    road(54.4, 32.8),
    road(58.2, 27.6),
    road(56.4, 22.4),
    road(55.2, 17.2),
    road(54.8, 12.0, false),
  ],
  c: [
    road(50.2, 93.2, false),
    road(50.0, 88.0),
    road(49.2, 82.8),
    road(48.4, 77.6),
    road(48.6, 72.4),
    road(49.4, 67.2),
    road(50.0, 62.0),
    road(50.2, 56.8),
    bridge(50.4, 51.6, false),
    bridge(51.2, 46.4),
    bridge(52.0, 41.2, false),
    road(52.2, 36.0),
    road(52.2, 30.8),
    road(52.0, 25.6),
    road(52.0, 20.4),
    road(52.2, 15.2),
    road(52.4, 10.8, false),
  ],
} as const satisfies Record<string, readonly WorldRoutePoint[]>;

export type LocalCasinoMapVariantId = keyof typeof LOCAL_CASINO_ROUTES;
