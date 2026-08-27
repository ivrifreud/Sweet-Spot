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

/** Keep hops in a Mario-like walk window: never instant, never a slog. */
export function durationForLength(length: number): number {
  return Math.round(Math.max(420, Math.min(980, length * 1.2)));
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
