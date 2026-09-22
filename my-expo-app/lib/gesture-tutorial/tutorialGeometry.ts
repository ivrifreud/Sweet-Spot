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

export type WarmthTrailLayer = {
  role: 'vapor' | 'warmth' | 'ember';
  width: number;
  length: number;
  opacity: number;
};

export function warmthTrailLayers(pathLength: number): WarmthTrailLayer[] {
  const tail = cometTailLength(pathLength);
  return [
    { role: 'vapor', width: 30, length: tail, opacity: 0.28 },
    { role: 'warmth', width: 17, length: tail * 0.64, opacity: 0.56 },
    { role: 'ember', width: 7, length: tail * 0.3, opacity: 0.96 },
  ];
}

export function quadPathD(from: TutorialPoint, control: TutorialPoint, to: TutorialPoint): string {
  return `M ${from.x} ${from.y} Q ${control.x} ${control.y} ${to.x} ${to.y}`;
}
