import type { WorldRoutePoint } from './worldRoute';

function road(left: number, top: number, nodeSafe = true): WorldRoutePoint {
  return { left, top, surface: 'road', nodeSafe };
}

function landing(left: number, top: number, landingGroup?: string): WorldRoutePoint {
  return { left, top, surface: 'road', nodeSafe: true, landing: true, landingGroup };
}

function bridge(left: number, top: number, nodeSafe = false): WorldRoutePoint {
  return { left, top, surface: 'bridge', nodeSafe };
}

function boardwalk(left: number, top: number, nodeSafe = false): WorldRoutePoint {
  return { left, top, surface: 'boardwalk', nodeSafe };
}

/**
 * Authored bottom-to-top centerlines for the outdoor desert town.
 * Traced against committed map-chunk-a/b/c.jpg. Points are [left%, top%].
 * Chips sit on round dirt `landing` pads, never on bridges, boardwalks, or props.
 */
export const LOCAL_CASINO_ROUTES = {
  a: [
    road(52.4, 93.0, false),
    road(51.8, 88.2),
    landing(51.2, 82.6),
    road(51.4, 77.4),
    road(52.0, 72.0),
    landing(52.2, 66.8),
    road(51.4, 61.4),
    road(50.4, 56.6),
    road(49.6, 52.4, false),
    landing(48.8, 49.0, 'a-terrace'),
    landing(47.8, 47.2, 'a-terrace'),
    landing(48.4, 45.6, 'a-terrace'),
    road(45.2, 43.0, false),
    road(40.6, 40.2, false),
    road(36.2, 36.4, false),
    road(33.4, 31.6),
    road(31.8, 26.2),
    road(31.6, 21.0),
    landing(32.4, 17.2, 'a-crest'),
    landing(34.2, 14.6, 'a-crest'),
    landing(36.8, 13.0, 'a-crest'),
    road(41.6, 11.0),
    road(46.8, 9.2),
    road(51.6, 8.0, false),
  ],
  b: [
    road(50.2, 93.0, false),
    road(50.6, 87.6),
    landing(51.0, 81.8),
    road(51.2, 75.6),
    road(50.8, 69.4),
    landing(50.4, 63.2),
    boardwalk(50.2, 57.4),
    boardwalk(50.0, 52.2),
    boardwalk(50.2, 47.0),
    landing(50.8, 41.2),
    road(51.6, 35.4),
    road(53.8, 29.6),
    landing(54.6, 22.8),
    road(53.6, 16.8),
    road(52.4, 11.2, false),
  ],
  c: [
    road(50.4, 93.0, false),
    road(50.2, 88.2),
    landing(49.6, 83.2),
    road(49.2, 78.2),
    road(49.4, 73.2),
    road(49.8, 68.2),
    road(50.2, 63.2),
    landing(50.4, 58.2),
    bridge(50.6, 53.2),
    bridge(51.2, 48.2),
    bridge(51.8, 43.2),
    landing(52.0, 38.2),
    road(52.0, 33.2),
    road(51.8, 28.2),
    landing(51.8, 23.2),
    road(52.0, 18.2),
    road(52.2, 13.4, false),
  ],
} as const satisfies Record<string, readonly WorldRoutePoint[]>;

export type LocalCasinoMapVariantId = keyof typeof LOCAL_CASINO_ROUTES;
