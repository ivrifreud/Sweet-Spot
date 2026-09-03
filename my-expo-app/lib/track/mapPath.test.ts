import { describe, expect, it } from 'vitest';

import {
  curveControl,
  durationForLength,
  pathLength,
  pointAlong,
  quadPoint,
  routeStages,
  svgQuadPath,
  svgPolyline,
  walkPolyline,
} from './mapPath';

describe('overworld path', () => {
  it('walks sequential checkpoints in both directions', () => {
    expect(routeStages(1, 3)).toEqual([1, 2, 3]);
    expect(routeStages(4, 2)).toEqual([4, 3, 2]);
    expect(routeStages(2, 2)).toEqual([2]);
  });

  it('samples a curved trail between stops instead of a straight cut', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 100, y: 0 };
    const trail = walkPolyline([a, b], 20);
    const mid = trail[Math.floor(trail.length / 2)]!;
    expect(Math.abs(mid.y)).toBeGreaterThan(8);
    expect(pathLength(trail)).toBeGreaterThan(100);
  });

  it('starts and ends on the checkpoint centers', () => {
    const stops = [
      { x: 10, y: 80 },
      { x: 70, y: 50 },
      { x: 20, y: 20 },
    ];
    const trail = walkPolyline(stops, 12);
    expect(trail[0]).toEqual(stops[0]);
    expect(trail[trail.length - 1]).toEqual(stops[2]);
  });

  it('builds an SVG quadratic path from the same controls', () => {
    const d = svgQuadPath(
      [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ],
      4
    );
    expect(d.startsWith('M 0 0 Q')).toBe(true);
  });

  it('builds a straight SVG polyline from authored route points', () => {
    expect(svgPolyline([])).toBe('');
    expect(
      svgPolyline([
        { x: 1, y: 2 },
        { x: 3, y: 4 },
        { x: 5, y: 6 },
      ])
    ).toBe('M 1 2 L 3 4 L 5 6');
  });

  it('scales walk time with distance without a teleport cap', () => {
    expect(durationForLength(0)).toBe(0);
    expect(durationForLength(10)).toBe(360);
    expect(durationForLength(500)).toBe(1400);
    expect(durationForLength(2000)).toBe(5600);
    expect(durationForLength(2000)).toBeGreaterThan(durationForLength(500));
  });

  it('interpolates along sampled points', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ];
    expect(pointAlong(points, 0)).toEqual({ x: 0, y: 0 });
    expect(pointAlong(points, 1)).toEqual({ x: 10, y: 0 });
    expect(pointAlong(points, 0.5).x).toBeCloseTo(5);
  });

  it('keeps the quadratic on the control hull', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 2, y: 0 };
    const c = curveControl(a, b, 1, 2);
    const mid = quadPoint(a, c, b, 0.5);
    expect(mid.y).not.toBe(0);
  });
});
