import type { GestureTutorialAction, GestureTutorialHand, GestureTutorialTarget } from './types';

export type TutorialPoint = { x: number; y: number };

export type TutorialRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type TutorialArc = {
  from: TutorialPoint;
  control: TutorialPoint;
  to: TutorialPoint;
};

export function rectCenter(rect: TutorialRect): TutorialPoint {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}

export function rectsOverlap(a: TutorialRect, b: TutorialRect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

/** Prefer the overlay's laid-out box over the browser window (phone preview). */
export function overlayViewport(
  layout: { width: number; height: number } | null | undefined,
  windowSize: { width: number; height: number }
): { width: number; height: number } {
  if (layout && layout.width >= 1 && layout.height >= 1) {
    return { width: layout.width, height: layout.height };
  }
  return windowSize;
}

const POINTING_SOURCE_W = 544;
const POINTING_SOURCE_H = 327;
export const POINTING_GLOVE_W = 120;
export const POINTING_GLOVE_H = Math.round((POINTING_GLOVE_W * POINTING_SOURCE_H) / POINTING_SOURCE_W);
/** Fingertip of the right hand, on the left edge of the artwork. */
export const POINTING_GLOVE_TIP_X = (2 / POINTING_SOURCE_W) * POINTING_GLOVE_W;
export const POINTING_GLOVE_TIP_Y = (28 / POINTING_SOURCE_H) * POINTING_GLOVE_H;

export function pointingGloveFrame(tip: TutorialPoint): TutorialRect {
  return {
    x: tip.x - POINTING_GLOVE_TIP_X,
    y: tip.y - POINTING_GLOVE_TIP_Y,
    width: POINTING_GLOVE_W,
    height: POINTING_GLOVE_H,
  };
}

export function fallbackTableRects(viewport: { width: number; height: number }) {
  return {
    cardHit: {
      x: viewport.width * 0.42,
      y: viewport.height * 0.68,
      width: viewport.width * 0.4,
      height: viewport.height * 0.18,
    },
    stackHit: {
      x: viewport.width * 0.06,
      y: viewport.height * 0.7,
      width: viewport.width * 0.3,
      height: viewport.height * 0.16,
    },
    tableCenter: { x: viewport.width * 0.5, y: viewport.height * 0.4 },
  };
}

export type TutorialSpotlight = {
  origin: TutorialPoint;
  radius: number;
};

export type TutorialControlHits = {
  dial?: TutorialRect;
  lockIn?: TutorialRect;
  fold?: TutorialRect;
  call?: TutorialRect;
};

function spotlightFromRect(rect: TutorialRect): TutorialSpotlight {
  return {
    origin: rectCenter(rect),
    radius: Math.max(rect.width, rect.height) * 0.78,
  };
}

/** Soft pool of light over the table actor this step starts from — no box. */
export function spotlightForTarget(
  target: GestureTutorialTarget,
  cardHit: TutorialRect,
  stackHit: TutorialRect,
  viewport: { width: number; height: number },
  extras?: TutorialControlHits
): TutorialSpotlight {
  if (target === 'cards') {
    return spotlightFromRect(cardHit);
  }
  if (target === 'stack') {
    return spotlightFromRect(stackHit);
  }
  if (target === 'dial' && extras?.dial) {
    return spotlightFromRect(extras.dial);
  }
  if (target === 'lockIn' && extras?.lockIn) {
    return spotlightFromRect(extras.lockIn);
  }
  if (target === 'foldButton' && extras?.fold) {
    return spotlightFromRect(extras.fold);
  }
  if (target === 'callButton' && extras?.call) {
    return spotlightFromRect(extras.call);
  }
  return {
    origin: { x: viewport.width / 2, y: viewport.height / 2 },
    radius: Math.min(viewport.width, viewport.height) * 0.32,
  };
}

function bowControl(from: TutorialPoint, to: TutorialPoint, bow: number): TutorialPoint {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  return {
    x: (from.x + to.x) / 2 + nx * bow * len,
    y: (from.y + to.y) / 2 + ny * bow * len,
  };
}

/**
 * Peek: screen middle → hole cards. Fold: hole cards → screen middle.
 * Only a tiny bow so it reads as a finger swipe, not a C-arc.
 */
export function swipeArcForAction(
  action: GestureTutorialAction,
  cardHit: TutorialRect,
  stackHit: TutorialRect,
  tableCenter: TutorialPoint,
  viewport: { width: number; height: number }
): TutorialArc | null {
  const cards = rectCenter(cardHit);
  const stack = rectCenter(stackHit);
  const middle = { x: viewport.width * 0.5, y: viewport.height * 0.5 };
  const tinyBow = 0.05;

  if (action === 'peek') {
    return { from: middle, control: bowControl(middle, cards, tinyBow), to: cards };
  }
  if (action === 'fold') {
    return { from: cards, control: bowControl(cards, middle, tinyBow), to: middle };
  }
  if (action === 'raise') {
    const from = stack;
    const to = { x: tableCenter.x, y: tableCenter.y };
    return { from, control: bowControl(from, to, 0.14), to };
  }
  return null;
}

export function tapOriginForAction(
  action: GestureTutorialAction,
  cardHit: TutorialRect,
  stackHit: TutorialRect,
  tableCenter: TutorialPoint,
  viewport: { width: number; height: number }
): TutorialPoint | null {
  if (action === 'call') {
    return rectCenter(stackHit);
  }
  if (action === 'check') {
    return { x: viewport.width / 2, y: viewport.height / 2 };
  }
  if (action === 'peek' || action === 'fold') {
    return rectCenter(cardHit);
  }
  if (action === 'raise') {
    return rectCenter(stackHit);
  }
  return null;
}

export function tapOriginForTarget(
  target: GestureTutorialTarget,
  cardHit: TutorialRect,
  stackHit: TutorialRect,
  viewport: { width: number; height: number },
  extras?: TutorialControlHits
): TutorialPoint | null {
  if (target === 'lockIn' && extras?.lockIn) {
    return rectCenter(extras.lockIn);
  }
  if (target === 'foldButton' && extras?.fold) {
    return rectCenter(extras.fold);
  }
  if (target === 'callButton' && extras?.call) {
    return rectCenter(extras.call);
  }
  if (target === 'dial' && extras?.dial) {
    return rectCenter(extras.dial);
  }
  if (target === 'cards') {
    return rectCenter(cardHit);
  }
  if (target === 'stack') {
    return rectCenter(stackHit);
  }
  if (target === 'felt') {
    return { x: viewport.width / 2, y: viewport.height / 2 };
  }
  return null;
}

export type TutorialDialArc = {
  center: TutorialPoint;
  radius: number;
  from: TutorialPoint;
  to: TutorialPoint;
  d: string;
};

function pointOnDialArc(center: TutorialPoint, radius: number, t: number): TutorialPoint {
  const rad = ((90 - t * 180) * Math.PI) / 180;
  return {
    x: center.x + radius * Math.cos(rad),
    y: center.y - radius * Math.sin(rad),
  };
}

/** Right half-circle on the dial rim: top → right → bottom. */
export function dialRotatePath(dialHit: TutorialRect): TutorialDialArc {
  const center = rectCenter(dialHit);
  const radius = Math.min(dialHit.width, dialHit.height) * 0.42;
  const from = pointOnDialArc(center, radius, 0);
  const to = pointOnDialArc(center, radius, 1);
  return {
    center,
    radius,
    from,
    to,
    d: `M ${from.x} ${from.y} A ${radius} ${radius} 0 0 1 ${to.x} ${to.y}`,
  };
}

export function pointOnArc(path: TutorialDialArc, t: number): TutorialPoint {
  return pointOnDialArc(path.center, path.radius, Math.min(1, Math.max(0, t)));
}

/** Travel heading along the right arc. t=0 is top, t=1 is bottom. */
export function tangentOnDialArc(path: TutorialDialArc, t: number, _reverse = false): number {
  const rad = ((90 - Math.min(1, Math.max(0, t)) * 180) * Math.PI) / 180;
  return Math.atan2(Math.cos(rad), Math.sin(rad));
}

export function dialArcLength(path: TutorialDialArc): number {
  return Math.PI * path.radius;
}

export function fingerPathForStep(
  step: { action: GestureTutorialAction; hand: GestureTutorialHand; target: GestureTutorialTarget },
  cardHit: TutorialRect,
  stackHit: TutorialRect,
  tableCenter: TutorialPoint,
  viewport: { width: number; height: number },
  extras?: TutorialControlHits
): TutorialArc {
  if (step.hand === 'turnDial' && extras?.dial) {
    const path = dialRotatePath(extras.dial);
    return { from: path.from, control: path.center, to: path.to };
  }
  if (step.hand === 'tapPair') {
    const fold = extras?.fold
      ? rectCenter(extras.fold)
      : { x: viewport.width * 0.2, y: viewport.height * 0.8 };
    const call = extras?.call
      ? rectCenter(extras.call)
      : { x: viewport.width * 0.8, y: viewport.height * 0.8 };
    const from = fold.x >= call.x ? fold : call;
    const to = fold.x >= call.x ? call : fold;
    return { from, control: from, to };
  }
  const spotlight = spotlightForTarget(step.target, cardHit, stackHit, viewport, extras);
  const arc = swipeArcForAction(step.action, cardHit, stackHit, tableCenter, viewport);
  const tapAt = tapOriginForAction(step.action, cardHit, stackHit, tableCenter, viewport);
  const from = arc?.from ?? tapAt ?? spotlight.origin;
  const to = arc?.to ?? from;
  const control = arc?.control ?? from;
  return { from, control, to };
}

/**
 * Vertical top for the tutorial title: upper-center of the phone, shifted
 * clear of the guide-hand path so copy never sits on the fingertip.
 */
export function tutorialCopyTop(
  viewport: { width: number; height: number },
  path: Pick<TutorialArc, 'from' | 'control' | 'to'>,
  safeTop: number,
  copyHeight = 96
): number {
  const handMinY = Math.min(path.from.y, path.control.y, path.to.y);
  const handMaxY = Math.max(path.from.y, path.control.y, path.to.y);
  // Upper-middle of the screen — more centered than flush-to-status-bar.
  const preferred = Math.max(safeTop + 12, viewport.height * 0.16);
  const clearance = 36;
  const preferredBottom = preferred + copyHeight;

  if (preferredBottom + clearance <= handMinY) {
    return preferred;
  }

  const aboveHand = handMinY - copyHeight - clearance;
  if (aboveHand >= safeTop) {
    return aboveHand;
  }

  // Hand occupies the top — park the title just below the gesture band.
  return Math.min(
    Math.max(handMaxY + clearance, safeTop + 12),
    viewport.height * 0.46 - copyHeight
  );
}

export function pointOnQuad(
  from: TutorialPoint,
  control: TutorialPoint,
  to: TutorialPoint,
  t: number
): TutorialPoint {
  const inverse = 1 - t;
  return {
    x: inverse * inverse * from.x + 2 * inverse * t * control.x + t * t * to.x,
    y: inverse * inverse * from.y + 2 * inverse * t * control.y + t * t * to.y,
  };
}

export function tangentOnQuad(
  from: TutorialPoint,
  control: TutorialPoint,
  to: TutorialPoint,
  t: number
): number {
  const dx = 2 * (1 - t) * (control.x - from.x) + 2 * t * (to.x - control.x);
  const dy = 2 * (1 - t) * (control.y - from.y) + 2 * t * (to.y - control.y);
  return Math.atan2(dy, dx);
}

export function approxQuadLength(
  from: TutorialPoint,
  control: TutorialPoint,
  to: TutorialPoint,
  samples = 48
): number {
  let length = 0;
  let previous = from;
  for (let index = 1; index <= samples; index += 1) {
    const point = pointOnQuad(from, control, to, index / samples);
    length += Math.hypot(point.x - previous.x, point.y - previous.y);
    previous = point;
  }
  return length;
}

export function cometTailLength(pathLength: number): number {
  return Math.min(Math.max(pathLength * 0.4, 52), 108);
}

export function cometDashOffset(travel: number, pathLength: number, tailLength: number): number {
  return tailLength - travel * pathLength;
}

export type WarmthTrailHeatStop = {
  offset: number;
  color: string;
  opacity: number;
};

export type WarmthTrailProfile = {
  tailLength: number;
  tipHalfWidth: number;
  taperPower: number;
  heatStops: WarmthTrailHeatStop[];
};

/** Heat palette matches ContactGlow: warm tip → cold fading tail. */
export type WarmthTrailSize = 'default' | 'finger';

export function warmthTrailProfile(
  pathLength: number,
  size: WarmthTrailSize = 'default'
): WarmthTrailProfile {
  // Dial / finger-sized: bulb matches the contact glow, short streak behind the tip.
  if (size === 'finger') {
    return {
      tailLength: Math.min(Math.max(pathLength * 0.14, 28), 42),
      tipHalfWidth: 8,
      taperPower: 2.35,
      heatStops: [
        { offset: 0, color: '#E6C46A', opacity: 1 },
        { offset: 0.28, color: '#C89B3C', opacity: 0.9 },
        { offset: 0.62, color: '#E8D7A7', opacity: 0.45 },
        { offset: 1, color: '#4F8580', opacity: 0 },
      ],
    };
  }

  return {
    tailLength: Math.min(Math.max(pathLength * 0.32, 44), 78),
    tipHalfWidth: 14,
    taperPower: 2.2,
    heatStops: [
      { offset: 0, color: '#E6C46A', opacity: 1 },
      { offset: 0.28, color: '#C89B3C', opacity: 0.9 },
      { offset: 0.62, color: '#E8D7A7', opacity: 0.45 },
      { offset: 1, color: '#4F8580', opacity: 0 },
    ],
  };
}

export type TrailCenterlineInput =
  | {
      kind: 'quad';
      from: TutorialPoint;
      control: TutorialPoint;
      to: TutorialPoint;
      along: number;
      direction?: 1 | -1;
      pathLength: number;
      tailLength: number;
      /** Pull the tip back from the fingertip so it sits on the glow rim. */
      tipInset?: number;
      samples?: number;
    }
  | {
      kind: 'dial';
      center: TutorialPoint;
      radius: number;
      along: number;
      direction?: 1 | -1;
      pathLength: number;
      tailLength: number;
      tipInset?: number;
      samples?: number;
    };

/** Matches ContactGlow circle radius in PointingGesture. */
export const CONTACT_GLOW_RADIUS = 26;

/** Tip-first centerline samples from the fingertip back along the path. */
export function sampleTrailCenterline(input: TrailCenterlineInput): TutorialPoint[] {
  const samples = Math.max(2, input.samples ?? 16);
  const inset = Math.max(0, input.tipInset ?? 0) / Math.max(input.pathLength, 1);
  const span = Math.min(1, Math.max(0, input.tailLength / Math.max(input.pathLength, 1)));
  const tipT = Math.min(1, Math.max(0, input.along - inset));
  const direction = input.direction ?? 1;
  const tailT = Math.min(1, Math.max(0, tipT - span * direction));
  const points: TutorialPoint[] = [];
  for (let index = 0; index <= samples; index += 1) {
    const u = index / samples;
    const t = tipT + (tailT - tipT) * u;
    if (input.kind === 'quad') {
      points.push(pointOnQuad(input.from, input.control, input.to, t));
    } else {
      points.push(pointOnDialArc(input.center, input.radius, t));
    }
  }
  return points;
}

function halfWidthAt(u: number, tipHalfWidth: number, taperPower: number): number {
  const clamped = Math.min(1, Math.max(0, u));
  // Cosine bulb near the tip, then power taper — rounder tear-drop, less wedge.
  const bulb = 0.5 + 0.5 * Math.cos(Math.PI * clamped);
  return tipHalfWidth * Math.pow(bulb, taperPower * 0.55) * Math.pow(1 - clamped, taperPower * 0.45);
}

function unitNormal(dx: number, dy: number): TutorialPoint {
  const length = Math.hypot(dx, dy);
  if (length < 1e-6) {
    return { x: 0, y: 1 };
  }
  return { x: -dy / length, y: dx / length };
}

/**
 * Closed tear-drop silhouette: bulb at the tip (index 0), pointed cold tail.
 * Outline is tip-cap → right side → left side reverse → close.
 */
export function buildTearDropOutline(
  centerline: TutorialPoint[],
  profile: Pick<WarmthTrailProfile, 'tipHalfWidth' | 'taperPower'>
): TutorialPoint[] {
  if (centerline.length < 2) {
    return centerline.length === 1 ? [centerline[0]!, centerline[0]!] : [];
  }

  const left: TutorialPoint[] = [];
  const right: TutorialPoint[] = [];
  const last = centerline.length - 1;

  for (let index = 0; index <= last; index += 1) {
    const point = centerline[index]!;
    const prev = centerline[Math.max(0, index - 1)]!;
    const next = centerline[Math.min(last, index + 1)]!;
    const normal = unitNormal(next.x - prev.x, next.y - prev.y);
    const half = halfWidthAt(index / last, profile.tipHalfWidth, profile.taperPower);
    left.push({ x: point.x + normal.x * half, y: point.y + normal.y * half });
    right.push({ x: point.x - normal.x * half, y: point.y - normal.y * half });
  }

  const tip = centerline[0]!;
  const tipNext = centerline[1]!;
  const travelX = tip.x - tipNext.x;
  const travelY = tip.y - tipNext.y;
  const travelLen = Math.hypot(travelX, travelY) || 1;
  const fwd = { x: travelX / travelLen, y: travelY / travelLen };
  // Keep the nose inside the fingertip glow so the trail starts under that blob.
  const noseReach = Math.min(profile.tipHalfWidth * 0.45, CONTACT_GLOW_RADIUS * 0.35);
  const left0 = left[0]!;
  const right0 = right[0]!;
  const tipCap: TutorialPoint[] = [];
  const capSteps = 16;
  for (let step = 0; step <= capSteps; step += 1) {
    const t = step / capSteps;
    const ox =
      (1 - t) * (left0.x - tip.x) + t * (right0.x - tip.x) + Math.sin(Math.PI * t) * fwd.x * noseReach;
    const oy =
      (1 - t) * (left0.y - tip.y) + t * (right0.y - tip.y) + Math.sin(Math.PI * t) * fwd.y * noseReach;
    tipCap.push({ x: tip.x + ox, y: tip.y + oy });
  }

  const outline: TutorialPoint[] = [...tipCap];
  for (let index = 1; index <= last; index += 1) {
    outline.push(right[index]!);
  }
  for (let index = last; index >= 1; index -= 1) {
    outline.push(left[index]!);
  }
  outline.push(tipCap[0]!);
  // One light pass — extra Chaikin shrinks the nose away from the glow.
  return smoothClosedOutline(outline, 1);
}

/** Chaikin corner-cutting on a closed ring (first == last). Softens faceted edges. */
export function smoothClosedOutline(points: TutorialPoint[], passes = 1): TutorialPoint[] {
  if (points.length < 4) {
    return points;
  }
  let ring = points;
  const iterations = Math.max(0, Math.min(4, Math.floor(passes)));
  for (let pass = 0; pass < iterations; pass += 1) {
    const open =
      ring.length > 1 &&
      ring[0]!.x === ring[ring.length - 1]!.x &&
      ring[0]!.y === ring[ring.length - 1]!.y
        ? ring.slice(0, -1)
        : ring;
    if (open.length < 3) {
      return points;
    }
    const next: TutorialPoint[] = [];
    for (let index = 0; index < open.length; index += 1) {
      const a = open[index]!;
      const b = open[(index + 1) % open.length]!;
      next.push({ x: 0.75 * a.x + 0.25 * b.x, y: 0.75 * a.y + 0.25 * b.y });
      next.push({ x: 0.25 * a.x + 0.75 * b.x, y: 0.25 * a.y + 0.75 * b.y });
    }
    next.push(next[0]!);
    ring = next;
  }
  return ring;
}

/** Smooth closed SVG path via Catmull-Rom → cubic Beziers (no faceted edges). */
export function outlineToSvgPathD(outline: TutorialPoint[]): string {
  if (outline.length === 0) {
    return '';
  }
  const open =
    outline.length > 1 &&
    outline[0]!.x === outline[outline.length - 1]!.x &&
    outline[0]!.y === outline[outline.length - 1]!.y
      ? outline.slice(0, -1)
      : outline;
  if (open.length < 2) {
    return `M ${outline[0]!.x} ${outline[0]!.y} Z`;
  }
  const n = open.length;
  let d = `M ${open[0]!.x} ${open[0]!.y}`;
  for (let index = 0; index < n; index += 1) {
    const p0 = open[(index - 1 + n) % n]!;
    const p1 = open[index]!;
    const p2 = open[(index + 1) % n]!;
    const p3 = open[(index + 2) % n]!;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`;
  }
  d += ' Z';
  return d;
}

export function quadPathD(from: TutorialPoint, control: TutorialPoint, to: TutorialPoint): string {
  return `M ${from.x} ${from.y} Q ${control.x} ${control.y} ${to.x} ${to.y}`;
}
