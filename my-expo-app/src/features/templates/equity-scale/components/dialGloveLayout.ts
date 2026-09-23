import { DIAL_MAX_DEG, DIAL_MIN_DEG } from '../dialMath';

/** Shared hub for the housing and numbered ring. */
export const DIAL_PIVOT_ORIGIN = { x: 0.5, y: 0.5 } as const;

export const DIAL_HAND_TILT_MAX_DEG = 15;

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

/** Hanan pinch canvases are 900×760. */
const ASPECT = 760 / 900;

/**
 * Glove size vs dial. Large enough that the pinch frame reads on a phone,
 * small enough the layout box still fits beside the action buttons.
 */
export const DIAL_GLOVE_SIZE_MUL = 2.35;

/**
 * Dial center on the Hanan `dial-hand-pinch-*.png` canvas — the open pinch
 * gap between thumb and fingers (not the old 0.2/0.33 rim guess).
 */
export const DIAL_GLOVE_CONTACT = { x: 0.346, y: 0.174 };

/** Dark sleeve mass in the bottom-right of the same canvas. */
export const DIAL_GLOVE_SLEEVE = { x: 0.807, y: 0.801 };

/**
 * Large glove gripping the wheel. The pinch gap is centered on the dial so
 * the disc sits in the open mouth; sleeve runs off the bottom-right.
 */
export function dialHandPose(rotationDeg: number, dialSize: number) {
  'worklet';
  const width = dialSize * DIAL_GLOVE_SIZE_MUL;
  const height = width * ASPECT;
  return {
    width,
    height,
    left: dialSize * 0.5 - DIAL_GLOVE_CONTACT.x * width,
    top: dialSize * 0.5 - DIAL_GLOVE_CONTACT.y * height,
    rotateDeg: dialHandTilt(rotationDeg),
  };
}

/** Lower-rim sweep in screen space (0° = 3 o'clock, clockwise). */
export const GRIP_START_DEG = 142;
export const GRIP_END_DEG = 38;

/**
 * Sleeve plant relative to the dial, matching the 10-outs (6 o'clock) rest
 * where the arm already exits the bottom of the screen.
 */
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

export type DialGloveLayoutBox = {
  width: number;
  height: number;
  dialLeft: number;
  dialTop: number;
  gloveLeft: number;
  gloveTop: number;
  overflowBelow: number;
};

/**
 * Parent box that actually contains the glove. Android clips overflow, so the
 * dial wrap must be this size instead of the dial wheel alone.
 */
export function dialGloveLayoutBox(dialSize: number): DialGloveLayoutBox {
  const pose = dialHandPose(0, dialSize);
  const origin = {
    x: pose.left + DIAL_GLOVE_CONTACT.x * pose.width,
    y: pose.top + DIAL_GLOVE_CONTACT.y * pose.height,
  };
  const corners = [
    { x: pose.left, y: pose.top },
    { x: pose.left + pose.width, y: pose.top },
    { x: pose.left, y: pose.top + pose.height },
    { x: pose.left + pose.width, y: pose.top + pose.height },
  ];
  let minX = 0;
  let minY = 0;
  let maxX = dialSize;
  let maxY = dialSize;
  for (const deg of [-DIAL_HAND_TILT_MAX_DEG, 0, DIAL_HAND_TILT_MAX_DEG]) {
    for (const corner of corners) {
      const spun = rotateAround(corner, origin, deg);
      minX = Math.min(minX, spun.x);
      minY = Math.min(minY, spun.y);
      maxX = Math.max(maxX, spun.x);
      maxY = Math.max(maxY, spun.y);
    }
  }
  return {
    width: maxX - minX,
    height: maxY - minY,
    dialLeft: -minX,
    dialTop: -minY,
    gloveLeft: pose.left - minX,
    gloveTop: pose.top - minY,
    overflowBelow: Math.max(0, maxY - dialSize),
  };
}
