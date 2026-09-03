export type GardenRouteSurface = 'road' | 'bridge';

export type GardenRoutePoint = {
  left: number;
  top: number;
  surface: GardenRouteSurface;
  nodeSafe: boolean;
};

function road(left: number, top: number, nodeSafe = true): GardenRoutePoint {
  return { left, top, surface: 'road', nodeSafe };
}

function bridge(left: number, top: number, nodeSafe = true): GardenRoutePoint {
  return { left, top, surface: 'bridge', nodeSafe };
}

/**
 * Authored bottom-to-top centerlines. Points are [left%, top%] along the
 * continuous dirt road and the one bridge that actually leads to the exit.
 */
export const BENNYS_GARDEN_ROUTES = {
  a: [
    road(56.8, 91.0, false),
    road(56.0, 86.2),
    road(51.7, 81.2),
    road(44.6, 77.4),
    road(40.0, 73.0),
    road(40.5, 67.8),
    road(45.8, 62.0),
    road(54.0, 58.0),
    road(62.0, 54.2),
    bridge(68.2, 51.2, false),
    bridge(72.4, 48.4),
    bridge(69.6, 44.8, false),
    road(61.4, 39.6),
    road(53.2, 33.4),
    road(47.6, 27.2),
    road(43.8, 21.2),
    road(42.0, 16.4),
    road(43.2, 12.4, false),
  ],
  b: [
    road(54.3, 91.0, false),
    road(54.8, 84.4),
    road(51.9, 79.4),
    road(41.3, 75.8),
    road(34.8, 71.4),
    road(36.8, 66.0),
    road(44.3, 61.6),
    road(51.6, 57.4),
    road(58.4, 53.8),
    bridge(66.2, 51.0, false),
    bridge(72.0, 48.0),
    bridge(67.4, 44.6, false),
    road(60.8, 43.2),
    road(54.6, 42.4),
    road(46.2, 38.2),
    road(50.5, 33.2),
    road(48.0, 28.0),
    road(41.6, 23.4),
    road(36.8, 18.8),
    road(36.0, 13.6, false),
  ],
  c: [
    road(54.6, 91.0, false),
    road(57.2, 84.6),
    road(60.4, 79.2),
    road(57.6, 73.4),
    road(51.4, 68.2),
    road(46.8, 63.0),
    road(42.8, 57.6),
    bridge(40.4, 53.0, false),
    bridge(41.8, 49.0),
    bridge(44.6, 45.2, false),
    road(48.4, 40.6),
    road(50.6, 35.6),
    road(48.0, 30.4),
    road(43.6, 25.4),
    road(37.8, 20.6),
    road(34.2, 16.2),
    road(34.0, 12.2, false),
  ],
} as const satisfies Record<string, readonly GardenRoutePoint[]>;

export type GardenMapVariantId = keyof typeof BENNYS_GARDEN_ROUTES;
