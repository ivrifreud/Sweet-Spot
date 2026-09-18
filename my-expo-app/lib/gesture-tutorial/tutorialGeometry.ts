import type { GestureTutorialAction, GestureTutorialTarget } from './types';

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

/** Soft pool of light over the table actor this step starts from — no box. */
export function spotlightForTarget(
  target: GestureTutorialTarget,
  cardHit: TutorialRect,
  stackHit: TutorialRect,
  viewport: { width: number; height: number }
): TutorialSpotlight {
  if (target === 'cards') {
    return {
      origin: rectCenter(cardHit),
      radius: Math.max(cardHit.width, cardHit.height) * 0.78,
    };
  }
  if (target === 'stack') {
    return {
      origin: rectCenter(stackHit),
      radius: Math.max(stackHit.width, stackHit.height) * 0.78,
    };
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
