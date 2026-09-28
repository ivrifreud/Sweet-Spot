import { smoothRoute, type RouteControl } from './smoothRoute';
import type { WorldRoutePoint } from './worldRoute';

function road(left: number, top: number): RouteControl {
  return { left, top, surface: 'road' };
}

/** Chip seat on a wide stretch of painted road or plaza. */
function landing(left: number, top: number): RouteControl {
  return { left, top, surface: 'road', landing: true };
}

function bridge(left: number, top: number): RouteControl {
  return { left, top, surface: 'bridge' };
}

function boardwalk(left: number, top: number): RouteControl {
  return { left, top, surface: 'boardwalk' };
}

/**
 * Painted-road centerlines for the desert town, bottom to top. Points are
 * [left%, top%] on each chunk JPEG. Four landings per chunk. The painted
 * chunks only overlap at the road edge, so A/B meet at left 50 and B/C at 60.
 */
export const LOCAL_CASINO_ROUTES: Record<'a' | 'b' | 'c', readonly WorldRoutePoint[]> = {
  a: smoothRoute([
    road(54, 98),
    road(53, 90),
    landing(51, 82),
    road(50, 74),
    landing(51, 66),
    road(51, 60),
    road(50, 54),
    road(48, 49),
    landing(52, 42),
    road(44, 37),
    road(40, 31),
    road(36, 26),
    landing(30, 20.5),
    road(28, 14),
    road(34, 8),
    road(42, 4),
    road(50, 1),
  ]),
  b: smoothRoute([
    road(49, 99),
    road(44, 92),
    landing(43, 82),
    road(44, 74),
    landing(42, 64),
    road(44, 58),
    boardwalk(46, 55),
    boardwalk(49, 51),
    road(51, 46),
    landing(55, 39),
    road(57, 32),
    landing(56, 22),
    road(59, 13),
    road(61, 6),
    road(61, 1),
  ]),
  c: smoothRoute([
    road(60, 99),
    road(55, 92),
    landing(53, 82),
    road(51, 72),
    landing(50, 62),
    road(49, 52),
    landing(48, 44),
    bridge(47, 37),
    bridge(47, 31),
    road(48, 26),
    landing(50, 20),
    road(52, 12),
    road(54, 6),
  ]),
};

export type LocalCasinoMapVariantId = keyof typeof LOCAL_CASINO_ROUTES;
