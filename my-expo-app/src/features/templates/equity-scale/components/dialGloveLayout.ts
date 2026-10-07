import { DIAL_MAX_DEG, DIAL_MIN_DEG } from '../dialMath';

/** Shared hub for the housing and numbered ring. */
export const DIAL_PIVOT_ORIGIN = { x: 0.5, y: 0.5 } as const;

export const DIAL_HAND_TILT_MAX_DEG = 10;

/**
 * Same pinch PNG, rocked a little with the wheel. Left / CCW tilts up,
 * right / CW tilts down. Rest stays level.
 */
export function dialHandTilt(rotationDeg: number): number {
  'worklet';
  const span = DIAL_MAX_DEG - DIAL_MIN_DEG;
  const t = Math.min(1, Math.max(0, (rotationDeg - DIAL_MIN_DEG) / span));
  return (t - 0.5) * 2 * DIAL_HAND_TILT_MAX_DEG;
}

const ASPECT = 760 / 900;

/**
 * Wide pinch pose drawn by the dial. Size and offset are relative to the
 * dial's top-left. The sleeve is meant to leave the bottom of the screen.
 */
export function dialHandPose(rotationDeg: number, dialSize: number) {
  'worklet';
  const width = dialSize * 2.2;
  const height = width * ASPECT;
  return {
    width,
    height,
    left: dialSize * 0.3,
    top: dialSize * -0.06,
    rotateDeg: dialHandTilt(rotationDeg),
  };
}

/**
 * Thumb pad on the 900×760 open-pinch canvas. The pad plants on the right
 * rim; the index fingertip tucks behind the wheel.
 */
export const DIAL_GLOVE_CONTACT = { x: 0.16, y: 0.36 };
export const DIAL_GLOVE_SLEEVE = { x: 0.75, y: 0.966 };

/** Rim attach in screen space (0° = 3 o'clock, clockwise). */
export const DIAL_HAND_ATTACH_DEG = 8;

/** Hand canvas width versus the wheel. */
export const DIAL_HAND_WIDTH_SCALE = 1.15;

/** Lower-rim sweep in screen space (0° = 3 o'clock, clockwise). */
export const GRIP_START_DEG = 142;
export const GRIP_END_DEG = 38;

export const SLEEVE_ANCHOR_X_FROM_CENTER = 120;

const ROT_MIN = DIAL_MIN_DEG;
const ROT_MAX = DIAL_MAX_DEG;

export function gripAngleForRotation(rotationDeg: number): number {
  'worklet';
  const span = ROT_MAX - ROT_MIN;
  const t = Math.min(1, Math.max(0, (rotationDeg - ROT_MIN) / span));
  return GRIP_START_DEG + t * (GRIP_END_DEG - GRIP_START_DEG);
}

export function rimPoint(
  centerX: number,
  centerY: number,
  radius: number,
  attachDeg: number
): { x: number; y: number } {
  'worklet';
  const rad = (attachDeg * Math.PI) / 180;
  return {
    x: centerX + Math.cos(rad) * radius,
    y: centerY + Math.sin(rad) * radius,
  };
}

export function dialGlovePose(input: {
  anchor: { x: number; y: number };
  contact: { x: number; y: number };
  sleeveUv?: { x: number; y: number };
  contactUv?: { x: number; y: number };
  aspect?: number;
  scale?: number;
}): { left: number; top: number; width: number; height: number; rotateDeg: number } {
  'worklet';
  const sleeve = input.sleeveUv ?? DIAL_GLOVE_SLEEVE;
  const pinch = input.contactUv ?? DIAL_GLOVE_CONTACT;
  const aspect = input.aspect ?? ASPECT;
  const scale = input.scale ?? 1;
  const localDx = pinch.x - sleeve.x;
  const localDy = (pinch.y - sleeve.y) * aspect;
  const localLen = Math.max(Math.hypot(localDx, localDy), 0.001);
  const screenDx = input.contact.x - input.anchor.x;
  const screenDy = input.contact.y - input.anchor.y;
  const screenLen = Math.max(Math.hypot(screenDx, screenDy), 1);
  const width = (screenLen / localLen) * scale;
  const height = width * aspect;
  const rotateDeg =
    (Math.atan2(screenDy, screenDx) - Math.atan2(localDy, localDx)) * (180 / Math.PI);
  return {
    left: input.anchor.x - sleeve.x * width,
    top: input.anchor.y - sleeve.y * height,
    width,
    height,
    rotateDeg,
  };
}

export type DialHandPhonePose = {
  left: number;
  top: number;
  width: number;
  height: number;
  restDeg: number;
  /** Rotation origin in the hand view's local coordinates. */
  contact: { x: number; y: number };
};

/** Axis-aligned bounds after rotating the hand box about `contact`. */
export function dialHandRotatedBounds(
  pose: DialHandPhonePose,
  extraDeg: number
): { minX: number; maxX: number; minY: number; maxY: number } {
  const deg = ((pose.restDeg + extraDeg) * Math.PI) / 180;
  const cos = Math.cos(deg);
  const sin = Math.sin(deg);
  const cx = pose.contact.x;
  const cy = pose.contact.y;
  const corners = [
    { x: 0, y: 0 },
    { x: pose.width, y: 0 },
    { x: pose.width, y: pose.height },
    { x: 0, y: pose.height },
  ];
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of corners) {
    const dx = p.x - cx;
    const dy = p.y - cy;
    const x = pose.left + cx + dx * cos - dy * sin;
    const y = pose.top + cy + dx * sin + dy * cos;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  return { minX, maxX, minY, maxY };
}

/**
 * Smaller bottom-center glove. Layout tests still cover it. The dial draws
 * {@link dialHandPose}.
 */
export function dialHandPhonePose(input: {
  dialSize: number;
  bottomClearance: number;
  columnHalfWidth: number;
}): DialHandPhonePose {
  const hub = input.dialSize / 2;
  const contact = rimPoint(hub, hub, hub, DIAL_HAND_ATTACH_DEG);
  const anchor = {
    x: hub + input.dialSize * 0.28,
    y: input.dialSize + Math.max(input.bottomClearance, 28) + 24,
  };
  const targetWidth = input.dialSize * DIAL_HAND_WIDTH_SCALE;
  const probe = dialGlovePose({ anchor, contact, scale: 1 });
  const scale = targetWidth / Math.max(probe.width, 1);
  const fitted = dialGlovePose({ anchor, contact, scale });
  const contactLocal = {
    x: DIAL_GLOVE_CONTACT.x * fitted.width,
    y: DIAL_GLOVE_CONTACT.y * fitted.height,
  };
  return {
    left: contact.x - contactLocal.x,
    top: contact.y - contactLocal.y,
    width: fitted.width,
    height: fitted.height,
    restDeg: fitted.rotateDeg,
    contact: contactLocal,
  };
}

export function rotateAround(
  point: { x: number; y: number },
  origin: { x: number; y: number },
  deg: number
): { x: number; y: number } {
  const rad = (deg * Math.PI) / 180;
  const dx = point.x - origin.x;
  const dy = point.y - origin.y;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: origin.x + dx * cos - dy * sin,
    y: origin.y + dx * sin + dy * cos,
  };
}
