import { catmullRomPoint } from './mapPath';
import type { WorldRoutePoint, WorldRouteSurface } from './worldRoute';

export type RouteControl = {
  left: number;
  top: number;
  surface: WorldRouteSurface;
  landing?: boolean;
};

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function isDeck(surface: WorldRouteSurface): boolean {
  return surface === 'bridge' || surface === 'boardwalk';
}

/** A sample between two controls keeps the deck surface if either end is on it. */
function spanSurface(from: RouteControl, to: RouteControl): WorldRouteSurface {
  if (isDeck(from.surface)) return from.surface;
  if (isDeck(to.surface)) return to.surface;
  return from.surface;
}

/**
 * Catmull-Rom through an authored centerline. The curve passes through every
 * control, including the four landings. Only landings are chip seats.
 */
export function smoothRoute(
  controls: readonly RouteControl[],
  samplesPerSpan = 8
): WorldRoutePoint[] {
  if (controls.length === 0) return [];
  const out: WorldRoutePoint[] = [];

  const push = (left: number, top: number, surface: WorldRouteSurface, landing: boolean) => {
    const point: WorldRoutePoint = {
      left: round1(left),
      top: round1(top),
      surface,
      nodeSafe: landing,
    };
    if (landing) point.landing = true;
    const prev = out[out.length - 1];
    if (!landing && prev && Math.hypot(prev.left - point.left, prev.top - point.top) < 0.05) {
      return;
    }
    out.push(point);
  };

  if (controls.length === 1) {
    const only = controls[0]!;
    push(only.left, only.top, only.surface, Boolean(only.landing));
    return out;
  }

  for (let i = 0; i < controls.length - 1; i += 1) {
    const p0 = controls[Math.max(0, i - 1)]!;
    const p1 = controls[i]!;
    const p2 = controls[i + 1]!;
    const p3 = controls[Math.min(controls.length - 1, i + 2)]!;
    for (let step = 0; step < samplesPerSpan; step += 1) {
      const point = catmullRomPoint(
        { x: p0.left, y: p0.top },
        { x: p1.left, y: p1.top },
        { x: p2.left, y: p2.top },
        { x: p3.left, y: p3.top },
        step / samplesPerSpan
      );
      if (step === 0) {
        push(point.x, point.y, p1.landing ? 'road' : p1.surface, Boolean(p1.landing));
      } else {
        push(point.x, point.y, spanSurface(p1, p2), false);
      }
    }
  }

  const last = controls[controls.length - 1]!;
  push(last.left, last.top, last.landing ? 'road' : last.surface, Boolean(last.landing));
  return out;
}
