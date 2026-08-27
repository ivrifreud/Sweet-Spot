/**
 * Invisible table plane that matches the painted POV felt.
 *
 * Reanimated has no physics world, so this config *is* the collision surface:
 * pitch, scale, and depth at any point on the felt. Deal, peek-drop, and muck
 * landings all sample the same pose so cards lie in the backdrop's perspective
 * instead of hovering in the foreground.
 */

export type FeltPlaneConfig = {
  /** Camera distance used by rotateX. Larger = gentler foreshortening. */
  perspective: number;
  /** Pitch in degrees at the hero rail (near the camera). */
  nearRotateX: number;
  /** Pitch in degrees at the pot / dealer edge. */
  farRotateX: number;
  /** Card scale at the pot relative to the hero rail. */
  farScale: number;
};

export const DEFAULT_FELT_PLANE: FeltPlaneConfig = {
  perspective: 1200,
  nearRotateX: 40,
  farRotateX: 58,
  farScale: 0.7,
};

/** How far the pinched corner rises, as a fraction of card height. */
export const PEEL_RISE = 0.22;

/** Full hold still only peels the index corner — never the whole face. */
export const PEEK_MAX_PULL = 0.34;

/** Horizontal bands that make the peek a C-curve instead of a stiff plate. */
export const PEEL_SLICES = 8;

/** How much the left hole card tucks under the right, as a fraction of card width. */
export const HOLE_OVERLAP = 0.16;

/**
 * Hold-to-peek stages from a raw 0–1 lift:
 * contact (almost flat) → slight arch → corner index only.
 */
export function peekPull(lift: number): number {
  'worklet';
  const x = Math.min(1, Math.max(0, lift));
  if (x <= 0.18) {
    return (x / 0.18) * 0.1;
  }
  if (x <= 0.55) {
    return 0.1 + ((x - 0.18) / 0.37) * 0.16;
  }
  return 0.26 + ((x - 0.55) / 0.45) * (PEEK_MAX_PULL - 0.26);
}

export type FeltPose = {
  rotateX: number;
  scale: number;
};

export type CornerPeel = {
  rise: number;
  rotateX: number;
  rotateY: number;
};

/**
 * `depth` is 0 on the hero rail and 1 at the far felt.
 * Smoothstep keeps mid-table cards from shrinking too fast.
 */
export function poseOnFelt(depth: number, plane: FeltPlaneConfig): FeltPose {
  'worklet';
  const t = Math.min(1, Math.max(0, depth));
  const eased = t * t * (3 - 2 * t);
  return {
    rotateX: plane.nearRotateX + eased * (plane.farRotateX - plane.nearRotateX),
    scale: 1 - eased * (1 - plane.farScale),
  };
}

/**
 * Pose while a card is in the air vs colliding with the felt.
 * `inAir` 0 snaps to the plane; 1 is the hop apex.
 */
export function collideWithFelt(depth: number, inAir: number, plane: FeltPlaneConfig): FeltPose {
  'worklet';
  const air = Math.min(1, Math.max(0, inAir));
  const pose = poseOnFelt(depth, plane);
  return {
    rotateX: pose.rotateX * (1 - air * 0.2),
    scale: pose.scale * (1 + air * 0.04),
  };
}

export function depthOnFelt(y: number, nearY: number, farY: number): number {
  'worklet';
  const span = nearY - farY;
  if (span === 0) {
    return 0;
  }
  return Math.min(1, Math.max(0, (nearY - y) / span));
}

/**
 * 0 at the far-left (glued to felt), 1 at the near-right pinch corner.
 * Radial so the peel is a paper curl, not a straight fold across the card.
 */
export function cornerWeight(u: number, v: number): number {
  'worklet';
  const cu = Math.min(1, Math.max(0, u));
  const cv = Math.min(1, Math.max(0, v));
  const dx = 1 - cu;
  const dy = 1 - cv;
  const dist = Math.sqrt(dx * dx * 0.55 + dy * dy);
  const radial = Math.min(1, Math.max(0, 1 - dist / 1.22));
  return radial * radial * (3 - 2 * radial);
}

/**
 * Local card U (0–1 left→right) mapped onto the overlapping hole-card packet.
 * Card 0 is the tucked left card; card 1 is the pinch-side card on top.
 */
export function packetU(cardIndex: number, localU: number, overlap: number): number {
  'worklet';
  const span = 2 - overlap;
  const origin = cardIndex === 0 ? 0 : 1 - overlap;
  return Math.min(1, Math.max(0, (origin + Math.min(1, Math.max(0, localU))) / span));
}

/**
 * Peel weight for a gathered pair. Both near edges rise together so the pinch
 * lifts the packet, with a light bias toward the right-hand pinch corner.
 */
export function packetPeelWeight(
  cardIndex: number,
  localU: number,
  v: number,
  overlap: number
): number {
  'worklet';
  const across = packetU(cardIndex, localU, overlap);
  const nearEdge = cornerWeight(0.52, v);
  const pinch = cornerWeight(across, v);
  return nearEdge * 0.22 + pinch * 0.78;
}

/**
 * Elastic cantilever. `t` is corner weight. `lift` is the peek amount.
 * Starts stiff (cards resist), then a wide belly instead of a hinge.
 */
export function peelLift(t: number, lift: number): number {
  'worklet';
  const x = Math.min(1, Math.max(0, t));
  const pull = Math.pow(Math.min(1, Math.max(0, lift)), 1.32);
  const x2 = x * x;
  const x3 = x2 * x;
  const cantilever = x2 * (1.22 - 0.1 * x);
  const belly = x3 * (1 - x) * 1.45;
  return pull * (cantilever + belly);
}

/** RotateX for one ribbon band; far bands stay planted, near bands curl up. */
export function peelSliceTilt(index: number, slices: number, lift: number): number {
  'worklet';
  const pull = peekPull(lift);
  const v0 = index / slices;
  const v1 = (index + 1) / slices;
  const y0 = peelLift(cornerWeight(0.94, v0), pull);
  const y1 = peelLift(cornerWeight(0.94, v1), pull);
  const deg = Math.atan((y1 - y0) * 3.1) * (180 / Math.PI);
  return Math.max(-2, Math.min(32, deg));
}

export function cornerPeel(u: number, v: number, lift: number): CornerPeel {
  'worklet';
  const rise = peelLift(cornerWeight(u, v), lift);
  const du = 0.07;
  const dv = 0.07;
  const riseU0 = peelLift(cornerWeight(Math.max(0, u - du), v), lift);
  const riseU1 = peelLift(cornerWeight(Math.min(1, u + du), v), lift);
  const riseV0 = peelLift(cornerWeight(u, Math.max(0, v - dv)), lift);
  const riseV1 = peelLift(cornerWeight(u, Math.min(1, v + dv)), lift);
  const rotateX = Math.max(
    -26,
    Math.min(26, Math.atan((riseV1 - riseV0) / (2 * dv)) * (180 / Math.PI) * 0.5)
  );
  const rotateY = Math.max(
    -20,
    Math.min(20, -Math.atan((riseU1 - riseU0) / (2 * du)) * (180 / Math.PI) * 0.42)
  );
  return { rise, rotateX, rotateY };
}

/** @deprecated kept for older tests; prefer cornerPeel. */
export function peelAngleDeg(t: number, lift: number): number {
  'worklet';
  const dt = 0.05;
  const y0 = peelLift(t, lift);
  const y1 = peelLift(Math.min(1, t + dt), lift);
  const deg = Math.atan((y1 - y0) / dt) * (180 / Math.PI);
  return Math.max(-26, Math.min(26, deg * 0.5));
}
