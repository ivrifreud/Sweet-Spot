import { smoothRoute, type RouteControl } from './smoothRoute';
import type { WorldRoutePoint, WorldRouteSurface } from './worldRoute';

export type GardenRouteSurface = Extract<WorldRouteSurface, 'road' | 'bridge'>;

export type GardenRoutePoint = WorldRoutePoint;

function road(left: number, top: number): RouteControl {
  return { left, top, surface: 'road' };
}

/** Chip seat on a wide stretch of painted dirt. */
function landing(left: number, top: number): RouteControl {
  return { left, top, surface: 'road', landing: true };
}

function bridge(left: number, top: number): RouteControl {
  return { left, top, surface: 'bridge' };
}

/**
 * Painted-road centerlines, bottom to top. Points are [left%, top%] on each
 * chunk JPEG. Four landings per chunk. Seams: A/B meet at left 50, B/C at 48.
 */
export const BENNYS_GARDEN_ROUTES: Record<'a' | 'b' | 'c', readonly GardenRoutePoint[]> = {
  a: smoothRoute([
    road(44, 99),
    road(46, 92),
    landing(46, 85),
    road(45, 77),
    road(38, 71),
    landing(33, 66),
    road(40, 61),
    road(51, 57),
    road(61, 53),
    bridge(69, 50.5),
    bridge(80, 47.5),
    bridge(91, 44.5),
    road(93, 40),
    road(89, 35),
    landing(87, 31),
    road(74, 26),
    road(62, 22.5),
    road(48, 19),
    landing(38, 15.5),
    road(45, 10),
    road(49, 5),
    road(50, 1),
  ]),
  b: smoothRoute([
    road(50, 99),
    road(50, 91),
    landing(51, 84),
    road(47, 76),
    road(41, 70),
    landing(40, 65),
    road(43, 59),
    road(42, 55),
    bridge(40, 51),
    bridge(40, 47),
    road(41, 43),
    landing(41, 39),
    road(46, 33),
    road(50, 28),
    road(47, 23),
    landing(42, 19),
    road(42, 13),
    road(46, 8),
    road(48, 1),
  ]),
  c: smoothRoute([
    road(48, 99),
    road(50, 91),
    landing(52, 85),
    road(44, 79),
    road(33, 77.5),
    landing(22, 75.5),
    road(13, 70),
    road(14, 64),
    road(21, 61),
    road(31, 60),
    road(39, 57),
    bridge(40, 52),
    bridge(40, 47),
    road(41, 43),
    landing(41, 39),
    road(46, 33),
    road(49, 28),
    road(43, 24.5),
    road(34, 23),
    landing(29, 19.5),
    road(33, 15),
    road(42, 12.5),
    road(46, 8),
    road(48, 1),
  ]),
};

export type GardenMapVariantId = keyof typeof BENNYS_GARDEN_ROUTES;
