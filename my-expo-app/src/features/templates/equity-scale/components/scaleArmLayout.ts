import { DIAL_MAX_DEG, SCALE_MAX_TILT_DEG } from '../dialMath';

type Point = { x: number; y: number };
type Box = { x: number; y: number; w: number; h: number };

function clampTilt(tilt: number): number {
  'worklet';
  return Math.min(SCALE_MAX_TILT_DEG, Math.max(-SCALE_MAX_TILT_DEG, tilt));
}

/** Map a dial reading onto ±SCALE_MAX_TILT_DEG. Center stays level. */
export function dialValueToTilt(value: number, min: number, max: number): number {
  'worklet';
  const span = max - min;
  if (span <= 0) return 0;
  const t = Math.min(1, Math.max(0, (value - min) / span));
  return clampTilt((t - 0.5) * 2 * SCALE_MAX_TILT_DEG);
}

/**
 * Live dial angle to hose tilt. Same line as `dialValueToTilt(dialAngleToValue(angle))`,
 * but continuous, so the arms follow the finger between detents.
 */
export function dialAngleToScaleTilt(angleDeg: number): number {
  'worklet';
  return clampTilt((angleDeg / DIAL_MAX_DEG) * SCALE_MAX_TILT_DEG);
}

/**
 * Transform list that rotates an absolutely placed box around `pivot` instead of its
 * centre. Box and pivot are in art px; `k` converts art px to screen points.
 * Avoids `transformOrigin`, which web and native resolve differently.
 */
export function rotateAboutPoint(box: Box, pivot: Point, deg: number, k: number) {
  'worklet';
  const dx = (pivot.x - (box.x + box.w / 2)) * k;
  const dy = (pivot.y - (box.y + box.h / 2)) * k;
  return [
    { translateX: dx },
    { translateY: dy },
    { rotate: `${deg}deg` },
    { translateX: -dx },
    { translateY: -dy },
  ];
}

/**
 * Screen offset for a hanging pan: its holding ring rides the hose, which rotates
 * clockwise-positive around the shoulder pivot. The pan itself never rotates.
 */
export function panOffset(ring: Point, pivot: Point, deg: number, k: number) {
  'worklet';
  const t = (deg * Math.PI) / 180;
  const rx = ring.x - pivot.x;
  const ry = ring.y - pivot.y;
  const cos = Math.cos(t);
  const sin = Math.sin(t);
  return {
    dx: (rx * cos - ry * sin - rx) * k,
    dy: (rx * sin + ry * cos - ry) * k,
  };
}
