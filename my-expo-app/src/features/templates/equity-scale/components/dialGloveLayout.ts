import { DIAL_MAX_DEG, DIAL_MIN_DEG } from '../dialMath';

/**
 * Open rest pose on the aligned 900×760 canvas.
 * Fingertips sit on the rim; the sleeve plants at the screen edge.
 */
export const DIAL_GLOVE_CONTACT = { x: 0.16, y: 0.36 };
export const DIAL_GLOVE_SLEEVE = { x: 0.75, y: 0.966 };

/** Lower-rim sweep in screen space (0° = 3 o'clock, clockwise). */
export const GRIP_START_DEG = 142;
export const GRIP_END_DEG = 38;

/**
 * Sleeve plant relative to the dial, matching the 10-outs (6 o'clock) rest
 * where the arm already exits the bottom of the screen.
 */
export const SLEEVE_ANCHOR_X_FROM_CENTER = 120;

const ASPECT = 760 / 900;
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

/**
 * Scale and rotate the open glove so the sleeve stays on `anchor` (screen
 * bottom) while the fingertips sit on `contact` (dial rim). Extra `scale`
 * grows around the sleeve; fingertips may leave the exact rim.
 */
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
