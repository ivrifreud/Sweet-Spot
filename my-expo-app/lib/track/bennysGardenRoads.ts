import type { WorldRoutePoint, WorldRouteSurface } from './worldRoute';

export type GardenRouteSurface = Extract<WorldRouteSurface, 'road' | 'bridge'>;

export type GardenRoutePoint = WorldRoutePoint;

function road(left: number, top: number, nodeSafe = true): GardenRoutePoint {
  return { left, top, surface: 'road', nodeSafe };
}

/** Permanent chip seat. Do not move these when retuning the road between them. */
function landing(left: number, top: number): GardenRoutePoint {
  return { left, top, surface: 'road', nodeSafe: true, landing: true };
}

function bridge(left: number, top: number, nodeSafe = false): GardenRoutePoint {
  return { left, top, surface: 'bridge', nodeSafe };
}

/** Fill long cuts so Benny walks the authored polyline instead of jumping grass. */
function withSteps(points: readonly GardenRoutePoint[], maxStep = 6.8): GardenRoutePoint[] {
  const out: GardenRoutePoint[] = [];
  for (let i = 0; i < points.length; i += 1) {
    const to = points[i]!;
    if (i === 0) {
      out.push(to);
      continue;
    }
    const from = out[out.length - 1]!;
    const dist = Math.hypot(to.left - from.left, to.top - from.top);
    const steps = Math.max(1, Math.ceil(dist / maxStep));
    for (let step = 1; step < steps; step += 1) {
      const t = step / steps;
      out.push(
        road(from.left + (to.left - from.left) * t, from.top + (to.top - from.top) * t, false)
      );
    }
    out.push(to);
  }
  return out;
}

/**
 * Authored bottom-to-top centerlines. Points are [left%, top%].
 * Exactly four `landing` chips per chunk are frozen; other points are the trail.
 * Map `a` is Garden screen 1 — this polyline is the permanent walk path.
 */
export const BENNYS_GARDEN_ROUTES = {
  a: withSteps([
    road(57.8, 80.4, false),
    landing(55.6, 83.6),
    road(51.2, 80.2),
    road(40.4, 74.2),
    road(46.2, 72.4),
    road(52.6, 68.2),
    landing(34.2, 66.8),
    road(52.4, 59.2, false),
    road(59.0, 55.8, false),
    road(65.2, 53.0, false),
    bridge(70.4, 50.6),
    bridge(81.8, 48.0),
    bridge(97.6, 40.4),
    road(97.8, 42.2, false),
    road(97.6, 38.8, false),
    road(97.0, 35.2),
    landing(91.2, 32.4),
    road(60.0, 20.8),
    road(50.4, 19.6),
    road(45.2, 18.8),
    landing(40.4, 18.8),
    road(44.0, 12.6),
    road(46.6, 11.4, false),
  ]),
  b: withSteps([
    road(52.4, 82.2, false),
    landing(55.0, 84.4),
    road(49.6, 82.8),
    road(45.2, 78.6),
    road(40.2, 74.6),
    landing(40.4, 66.8),
    road(42.6, 66.0),
    road(47.2, 61.8),
    road(50.4, 57.4),
    road(47.4, 54.8, false),
    road(43.6, 52.6, false),
    bridge(41.4, 50.4),
    bridge(41.0, 48.2),
    road(43.2, 45.6, false),
    landing(42.0, 39.4),
    road(48.8, 40.8),
    road(46.4, 36.6),
    road(42.2, 32.8),
    landing(42.6, 19.6),
    road(44.2, 24.6),
    road(48.0, 20.8),
    road(44.6, 16.8),
    road(43.2, 12.6, false),
  ]),
  c: withSteps([
    road(45.6, 92.0, false),
    landing(56.4, 83.2),
    road(52.2, 83.0),
    landing(40.4, 74),
    road(19.8, 78.8),
    road(18.4, 77.6),
    road(12.4, 76.4),
    road(10.4, 75.2),
    road(15.6, 66.4),
    road(26.7, 63.7),
    road(26.0, 63.2),
    road(36.4, 60.4),
    road(47.8, 57.2),
    road(47.2, 54.6, false),
    bridge(43.6, 51.4),
    bridge(42.8, 48.4),
    road(45.2, 45.2, false),
    landing(40.8, 60.4),
    road(49.4, 40.2),
    road(48.6, 35.8),
    road(45.2, 31.4),
    road(41.4, 27.0),
    landing(40.6, 40.4),
    road(42.4, 18.0),
    road(45.8, 14.0),
    road(47.2, 11.0, false),
  ]),
} as const satisfies Record<string, readonly GardenRoutePoint[]>;

export type GardenMapVariantId = keyof typeof BENNYS_GARDEN_ROUTES;
