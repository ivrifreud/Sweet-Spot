export type Point = { x: number; y: number };

/**
 * Mario / Candy Crush map grammar: nodes sit on a winding path, not a
 * straight diagonal. Alternate the bulge so the trail S-curves.
 */
export function curveControl(a: Point, b: Point, side: 1 | -1, bulge: number): Point {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  return {
    x: (a.x + b.x) / 2 - (dy / len) * bulge * side,
    y: (a.y + b.y) / 2 + (dx / len) * bulge * side,
  };
}

export function quadPoint(a: Point, c: Point, b: Point, t: number): Point {
  const u = 1 - t;
  return {
    x: u * u * a.x + 2 * u * t * c.x + t * t * b.x,
    y: u * u * a.y + 2 * u * t * c.y + t * t * b.y,
  };
}

export function sampleQuad(a: Point, c: Point, b: Point, steps = 16): Point[] {
  const points: Point[] = [];
  for (let i = 0; i <= steps; i += 1) {
    points.push(quadPoint(a, c, b, i / steps));
  }
  return points;
}

export function walkPolyline(stops: Point[], bulge: number): Point[] {
  if (stops.length === 0) return [];
  if (stops.length === 1) return [stops[0]!];
  const points: Point[] = [];
  for (let i = 0; i < stops.length - 1; i += 1) {
    const a = stops[i]!;
    const b = stops[i + 1]!;
    const side: 1 | -1 = i % 2 === 0 ? 1 : -1;
    const sampled = sampleQuad(a, curveControl(a, b, side, bulge), b);
    if (i > 0) sampled.shift();
    points.push(...sampled);
  }
  return points;
}

export function svgQuadPath(stops: Point[], bulge: number): string {
  if (stops.length === 0) return '';
  const first = stops[0]!;
  if (stops.length === 1) return `M ${first.x} ${first.y}`;
  let d = `M ${first.x} ${first.y}`;
  for (let i = 0; i < stops.length - 1; i += 1) {
    const a = stops[i]!;
    const b = stops[i + 1]!;
    const side: 1 | -1 = i % 2 === 0 ? 1 : -1;
    const c = curveControl(a, b, side, bulge);
    d += ` Q ${c.x} ${c.y} ${b.x} ${b.y}`;
  }
  return d;
}

export function svgQuadSegment(a: Point, b: Point, index: number, bulge: number): string {
  const side: 1 | -1 = index % 2 === 0 ? 1 : -1;
  const c = curveControl(a, b, side, bulge);
  return `M ${a.x} ${a.y} Q ${c.x} ${c.y} ${b.x} ${b.y}`;
}

/** Straight centerline path — used when the route is already authored on the road. */
export function svgPolyline(points: readonly Point[]): string {
  if (points.length === 0) return '';
  const first = points[0]!;
  if (points.length === 1) return `M ${first.x} ${first.y}`;
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
}

/** Uniform Catmull-Rom sample. t = 0 returns p1, t = 1 returns p2. */
export function catmullRomPoint(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x:
      0.5 *
      (2 * p1.x +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y:
      0.5 *
      (2 * p1.y +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  };
}

/**
 * Cubic beziers through every point. Round caps and joins on the stroke
 * finish the curve; a dense L polyline still corners where the samples turn hard.
 */
export function svgCatmullRom(points: readonly Point[]): string {
  if (points.length === 0) return '';
  const first = points[0]!;
  if (points.length === 1) return `M ${first.x} ${first.y}`;
  if (points.length === 2) return `M ${first.x} ${first.y} L ${points[1]!.x} ${points[1]!.y}`;
  let d = `M ${first.x} ${first.y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[Math.max(0, i - 1)]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[Math.min(points.length - 1, i + 2)]!;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`;
  }
  return d;
}

/** Max turn between consecutive samples, in degrees. Portrait art is 9:16. */
export const MAX_PATH_TURN_DEG = 36;

export function maxSegmentTurnDeg(
  points: readonly { left: number; top: number }[],
  aspect = 16 / 9
): number {
  let max = 0;
  for (let i = 1; i < points.length - 1; i += 1) {
    const a = points[i - 1]!;
    const b = points[i]!;
    const c = points[i + 1]!;
    const v1x = b.left - a.left;
    const v1y = (b.top - a.top) * aspect;
    const v2x = c.left - b.left;
    const v2y = (c.top - b.top) * aspect;
    const len1 = Math.hypot(v1x, v1y);
    const len2 = Math.hypot(v2x, v2y);
    if (len1 < 0.15 || len2 < 0.15) continue;
    const cos = Math.min(1, Math.max(-1, (v1x * v2x + v1y * v2y) / (len1 * len2)));
    const turn = (Math.acos(cos) * 180) / Math.PI;
    if (turn > max) max = turn;
  }
  return max;
}

/** Inclusive stage numbers between two checkpoints, walking the path. */
export function routeStages(from: number, to: number): number[] {
  if (from === to) return [from];
  const step = from < to ? 1 : -1;
  const stages: number[] = [];
  for (let n = from; n !== to; n += step) stages.push(n);
  stages.push(to);
  return stages;
}

export function pathLength(points: Point[]): number {
  let length = 0;
  for (let i = 1; i < points.length; i += 1) {
    length += Math.hypot(points[i]!.x - points[i - 1]!.x, points[i]!.y - points[i - 1]!.y);
  }
  return length;
}

/** Milliseconds per path pixel so hop time stays proportional to distance. */
export const WALK_MS_PER_PX = 2.8;
/** Short hops still get a rubber-hose beat instead of a flicker. */
export const WALK_MIN_DURATION_MS = 360;

/** Walk duration scales with path length — long hops take longer, never a teleport cap. */
export function durationForLength(length: number): number {
  if (length <= 0) return 0;
  return Math.round(Math.max(WALK_MIN_DURATION_MS, length * WALK_MS_PER_PX));
}

export function pointAlong(points: Point[], t: number): Point {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1 || t <= 0) return points[0]!;
  if (t >= 1) return points[points.length - 1]!;
  const scaled = t * (points.length - 1);
  const i = Math.min(Math.floor(scaled), points.length - 2);
  const f = scaled - i;
  const a = points[i]!;
  const b = points[i + 1]!;
  return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
}
