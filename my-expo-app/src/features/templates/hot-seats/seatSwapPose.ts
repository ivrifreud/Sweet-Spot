import { WHOOSH_ANTICIPATION_MS, WHOOSH_MS, WHOOSH_TRAVEL_MS } from './seatRail';

/** Art pixels on the 571×1024 plates. Both skins share this blocking. */
export const ART_CENTER = { x: 571 / 2, y: 1024 / 2 } as const;

/** Midpoint of the left player's two painted card backs, (106.5, 358.2) and (137.3, 363.5). */
export const LEFT_CARD_ANCHOR = { x: 122, y: 361 } as const;
/** Midpoint of the hero hole cards. */
export const HERO_CARD_ANCHOR = { x: 295.5, y: 853.5 } as const;

/** One painted card back is 31 art pixels wide; the hero slots average 128. */
export const LOCK_SCALE = 128 / 31;
/** His pair sits at +9.8°, the hero pair at atan2(-9, 75). */
export const LOCK_ROTATION_DEG = (Math.atan2(-9, 75) * 180) / Math.PI - 9.8;

const PINPOINT_SCALE = 1.08;
const PINPOINT_OFFSET = { x: -8, y: -10 };
const BOW = { x: 36, y: -24 };
const BOW_AT = 0.45;
const OVERSHOOT_MS = 80;
const OVERSHOOT_PX = 10;
const OVERSHOOT_SCALE = 1.04;
const RETURN_MS = 60;
const PLATE_PEAK = { scale: 1.04, x: 14, y: 8 };
const PLATE_PEAK_AT = 0.7;
const THUMB_DROP = 160;

const PIN_END = WHOOSH_ANTICIPATION_MS;
const TRAVEL_END = WHOOSH_ANTICIPATION_MS + WHOOSH_TRAVEL_MS;
const ARRIVE = TRAVEL_END - OVERSHOOT_MS;
const LOCK = TRAVEL_END + RETURN_MS;
const PLATE_PEAK_MS = PIN_END + WHOOSH_TRAVEL_MS * PLATE_PEAK_AT;

/** Progress at which the cutout covers the hand, so the next seat's faces can swap in. */
export const HAND_SWAP_PROGRESS = TRAVEL_END / WHOOSH_MS;
/** Progress at which the anchor first lands on the hero cards, before the overshoot. */
export const ARRIVE_PROGRESS = ARRIVE / WHOOSH_MS;

export type SwapPose = {
  plate: { scale: number; x: number; y: number };
  /** x and y are the card anchor in art pixels; scale and rotation pivot on it. */
  cutout: { x: number; y: number; scale: number; rotation: number; opacity: number };
  fillOpacity: number;
  originalOpacity: number;
  thumb: { y: number; opacity: number };
};

const PIN_ANCHOR = {
  x: LEFT_CARD_ANCHOR.x + PINPOINT_OFFSET.x,
  y: LEFT_CARD_ANCHOR.y + PINPOINT_OFFSET.y,
};
const BOW_POINT = {
  x: LEFT_CARD_ANCHOR.x + (HERO_CARD_ANCHOR.x - LEFT_CARD_ANCHOR.x) * BOW_AT + BOW.x,
  y: LEFT_CARD_ANCHOR.y + (HERO_CARD_ANCHOR.y - LEFT_CARD_ANCHOR.y) * BOW_AT + BOW.y,
};
const ARRIVAL_DIRECTION = (() => {
  const dx = HERO_CARD_ANCHOR.x - BOW_POINT.x;
  const dy = HERO_CARD_ANCHOR.y - BOW_POINT.y;
  const length = Math.hypot(dx, dy);
  return { x: dx / length, y: dy / length };
})();

/** One 720ms swap, progress 0 to 1. Both ends are the shipped painting at rest. */
export function swapPose(progress: number): SwapPose {
  'worklet';
  const t = clamp01(progress) * WHOOSH_MS;

  let anchorX = LEFT_CARD_ANCHOR.x;
  let anchorY = LEFT_CARD_ANCHOR.y;
  let scale = 1;
  let rotation = 0;
  let cutoutOpacity = 1;
  let originalOpacity = 0;

  if (t < PIN_END) {
    const e = easeOutQuad(t / PIN_END);
    anchorX += PINPOINT_OFFSET.x * e;
    anchorY += PINPOINT_OFFSET.y * e;
    scale = 1 + (PINPOINT_SCALE - 1) * e;
  } else if (t < ARRIVE) {
    const e = easeInCubic((t - PIN_END) / (ARRIVE - PIN_END));
    const inv = 1 - e;
    anchorX = inv * inv * PIN_ANCHOR.x + 2 * inv * e * BOW_POINT.x + e * e * HERO_CARD_ANCHOR.x;
    anchorY = inv * inv * PIN_ANCHOR.y + 2 * inv * e * BOW_POINT.y + e * e * HERO_CARD_ANCHOR.y;
    scale = PINPOINT_SCALE + (LOCK_SCALE - PINPOINT_SCALE) * e;
    rotation = LOCK_ROTATION_DEG * e;
  } else {
    let overshoot = 0;
    if (t < TRAVEL_END) {
      overshoot = easeOutQuad((t - ARRIVE) / OVERSHOOT_MS);
    } else if (t < LOCK) {
      overshoot = 1 - easeInOutQuad((t - TRAVEL_END) / RETURN_MS);
    }
    anchorX = HERO_CARD_ANCHOR.x + ARRIVAL_DIRECTION.x * OVERSHOOT_PX * overshoot;
    anchorY = HERO_CARD_ANCHOR.y + ARRIVAL_DIRECTION.y * OVERSHOOT_PX * overshoot;
    scale = LOCK_SCALE * (1 + (OVERSHOOT_SCALE - 1) * overshoot);
    rotation = LOCK_ROTATION_DEG;
    if (t >= LOCK) {
      const fade = easeInOutQuad((t - LOCK) / (WHOOSH_MS - LOCK));
      cutoutOpacity = 1 - fade;
      originalOpacity = fade;
    }
  }

  let plateAmount = 0;
  if (t >= PIN_END && t < PLATE_PEAK_MS) {
    plateAmount = easeInOutSine((t - PIN_END) / (PLATE_PEAK_MS - PIN_END));
  } else if (t >= PLATE_PEAK_MS) {
    plateAmount = 1 - easeInOutSine((t - PLATE_PEAK_MS) / (WHOOSH_MS - PLATE_PEAK_MS));
  }

  let thumbY = 0;
  let thumbOpacity = 1;
  if (t >= PIN_END && t < TRAVEL_END) {
    const u = (t - PIN_END) / WHOOSH_TRAVEL_MS;
    thumbY = THUMB_DROP * u * u;
    thumbOpacity = 1 - u;
  } else if (t >= TRAVEL_END && t < LOCK) {
    thumbY = THUMB_DROP;
    thumbOpacity = 0;
  } else if (t >= LOCK) {
    const e = easeOutCubic((t - LOCK) / (WHOOSH_MS - LOCK));
    thumbY = THUMB_DROP * (1 - e);
    thumbOpacity = e;
  }

  const atRest = t >= WHOOSH_MS;
  return {
    plate: {
      scale: 1 + (PLATE_PEAK.scale - 1) * plateAmount,
      x: PLATE_PEAK.x * plateAmount,
      y: PLATE_PEAK.y * plateAmount,
    },
    cutout: {
      x: anchorX,
      y: anchorY,
      scale,
      rotation,
      opacity: atRest ? 0 : cutoutOpacity,
    },
    fillOpacity: atRest ? 0 : 1,
    originalOpacity: atRest ? 1 : originalOpacity,
    thumb: { y: atRest ? 0 : thumbY, opacity: atRest ? 1 : thumbOpacity },
  };
}

function clamp01(value: number) {
  'worklet';
  return Math.min(1, Math.max(0, value));
}

function easeOutQuad(u: number) {
  'worklet';
  return 1 - (1 - u) * (1 - u);
}

function easeInCubic(u: number) {
  'worklet';
  return u * u * u;
}

function easeOutCubic(u: number) {
  'worklet';
  return 1 - Math.pow(1 - u, 3);
}

function easeInOutQuad(u: number) {
  'worklet';
  return u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
}

function easeInOutSine(u: number) {
  'worklet';
  return -(Math.cos(Math.PI * u) - 1) / 2;
}
