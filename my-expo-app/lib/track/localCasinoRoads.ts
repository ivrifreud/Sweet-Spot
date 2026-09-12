import type { WorldRoutePoint } from './worldRoute';

function road(left: number, top: number, nodeSafe = true): WorldRoutePoint {
  return { left, top, surface: 'road', nodeSafe };
}

/** Permanent chip seat. Do not move these when retuning the road between them. */
function landing(left: number, top: number): WorldRoutePoint {
  return { left, top, surface: 'road', nodeSafe: true, landing: true };
}

function bridge(left: number, top: number, nodeSafe = false): WorldRoutePoint {
  return { left, top, surface: 'bridge', nodeSafe };
}

function boardwalk(left: number, top: number, nodeSafe = false): WorldRoutePoint {
  return { left, top, surface: 'boardwalk', nodeSafe };
}

/**
 * Authored bottom-to-top centerlines for the outdoor desert town.
 * Points are [left%, top%]. Exactly four `landing` chips per chunk are frozen;
 * `road` / `bridge` / `boardwalk` points only draw the trail between them.
 */
export const LOCAL_CASINO_ROUTES = {
  a: [
    road(52.4, 93.0, false),
    road(51.8, 88.2),
    landing(51.2, 82.6),
    road(51.4, 77.6),
    road(51.8, 72.2),
    landing(52.2, 66.8),
    road(51.2, 61.8),
    road(50.0, 57.2),
    road(48.8, 52.6),
    road(50.2, 47.8),
    road(52.4, 43.6),
    landing(55.2, 40.0),
    road(51.6, 36.8, false),
    road(47.2, 39.2, false),
    road(41.8, 34.0, false),
    road(41.2, 30.4, false),
    road(36.4, 27.0),
    road(31.4, 23.6),
    road(26.2, 21.0),
    landing(21.2, 18.6),
    road(27.8, 15.4),
    road(31.6, 13.8),
    road(35.6, 12.2),
    road(39.6, 10.8),
    road(43.8, 9.6),
    road(51.6, 8.0, false),
  ],
  b: [
    road(50.2, 93.0, false),
    road(50.6, 87.8),
    road(47.8, 84.6),
    landing(45.0, 81.8),
    road(48.6, 78.2),
    road(51.0, 73.6),
    road(50.8, 68.8),
    road(46.2, 66.0),
    landing(41.4, 63.2),
    road(46.8, 60.4, false),
    boardwalk(50.2, 56.6),
    boardwalk(50.4, 51.8),
    boardwalk(51.2, 46.6),
    landing(53.8, 41.2),
    road(52.8, 35.2),
    road(53.6, 29.0),
    landing(54.6, 22.8),
    road(53.6, 16.8),
    road(52.4, 11.2, false),
  ],
  c: [
    road(50.4, 93.0, false),
    road(50.8, 88.4),
    landing(53.6, 83.2),
    road(50.8, 78.6),
    road(50.0, 73.2),
    road(50.2, 67.8),
    road(50.8, 62.4),
    landing(52.4, 57.2),
    bridge(51.2, 52.4),
    bridge(51.6, 47.6),
    landing(47.0, 43.2),
    road(50.6, 38.4, false),
    road(51.6, 33.0),
    road(51.2, 28.8),
    landing(45.8, 25.2),
    road(50.2, 21.0),
    road(51.8, 16.4),
    road(52.2, 13.4, false),
  ],
} as const satisfies Record<string, readonly WorldRoutePoint[]>;

export type LocalCasinoMapVariantId = keyof typeof LOCAL_CASINO_ROUTES;
