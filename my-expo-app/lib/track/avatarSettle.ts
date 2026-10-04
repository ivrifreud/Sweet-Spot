export type Point = { x: number; y: number };

/** Rubber-hose settle: the hop passes the node, then steps back onto it. */
export const WALK_OVERSHOOT = 1.08;
const OVERSHOOT_SPAN = WALK_OVERSHOOT - 1;
const OVERSHOOT_PX = 14;

/** Shoes overlap the node anchor so the feet meet the plate. */
export const MAP_AVATAR_GROUND_CONTACT = 6;

export function pointAlongXY(xs: readonly number[], ys: readonly number[], t: number): Point {
  'worklet';
  const n = xs.length;
  if (n === 0) return { x: 0, y: 0 };
  const firstX = xs[0] ?? 0;
  const firstY = ys[0] ?? 0;
  if (n === 1 || t <= 0) return { x: firstX, y: firstY };
  const lastX = xs[n - 1] ?? firstX;
  const lastY = ys[n - 1] ?? firstY;
  if (t >= 1) {
    if (t === 1) return { x: lastX, y: lastY };
    const prevX = xs[n - 2] ?? lastX;
    const prevY = ys[n - 2] ?? lastY;
    const dx = lastX - prevX;
    const dy = lastY - prevY;
    const len = Math.hypot(dx, dy) || 1;
    const extra = Math.min(OVERSHOOT_PX, len * 2) * Math.min(1, (t - 1) / OVERSHOOT_SPAN);
    return { x: lastX + (dx / len) * extra, y: lastY + (dy / len) * extra };
  }
  const scaled = t * (n - 1);
  const i = Math.min(Math.floor(scaled), n - 2);
  const f = scaled - i;
  const x0 = xs[i] ?? 0;
  const y0 = ys[i] ?? 0;
  const x1 = xs[i + 1] ?? x0;
  const y1 = ys[i + 1] ?? y0;
  return { x: x0 + (x1 - x0) * f, y: y0 + (y1 - y0) * f };
}

export function pointAlongPath(points: readonly Point[], t: number): Point {
  'worklet';
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < points.length; i += 1) {
    const point = points[i]!;
    xs.push(point.x);
    ys.push(point.y);
  }
  return pointAlongXY(xs, ys, t);
}

export function nearestNode(position: Point, anchors: readonly Point[]): Point {
  'worklet';
  if (anchors.length === 0) return position;
  let best = anchors[0]!;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let i = 0; i < anchors.length; i += 1) {
    const anchor = anchors[i]!;
    const distance = Math.hypot(anchor.x - position.x, anchor.y - position.y);
    if (distance < bestDistance) {
      best = anchor;
      bestDistance = distance;
    }
  }
  return best;
}

/**
 * A finished hop stands on `destination`. A hop that stops early stands on the
 * nearest node, never on a road sample between anchors.
 */
export function resolveHopRest(input: {
  progress: number;
  finished: boolean;
  trail: readonly Point[];
  anchors: readonly Point[];
  destination: Point;
}): Point {
  'worklet';
  if (input.finished) return input.destination;
  const along = pointAlongPath(input.trail, input.progress);
  const nodes = input.anchors.length > 0 ? input.anchors : [input.destination];
  return nearestNode(along, nodes);
}

export function avatarSpriteOrigin(anchor: Point, size: number): Point {
  'worklet';
  return {
    x: anchor.x - size / 2,
    y: anchor.y - size + MAP_AVATAR_GROUND_CONTACT,
  };
}
