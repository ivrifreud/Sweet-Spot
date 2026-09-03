/**
 * Sweet Spot chip sprite set — cream clay body, brick-red rim inserts, inked
 * spade medallion. Every chip drawn anywhere in the app comes from here.
 *
 * Sprites carry no background, ground plane, or drop shadow. Contact shadows are
 * drawn in the UI so they can react to height and lighting.
 */
export const chipArt = {
  /** Top-down face. Stack caps, HUD lives, chips at rest in the pot. */
  face: require('../assets/brand/chips/chip-face.png'),
  /** Spent HUD life slot — dark inked socket, same silhouette as `face`. */
  faceEmpty: require('../assets/brand/chips/chip-face-empty.png'),
  /** One chip's side wall. Repeat vertically to build stack thickness. */
  edge: require('../assets/brand/chips/chip-edge.png'),
  /** Three-quarter view with visible thickness. Chips in the air. */
  threeQuarter: require('../assets/brand/chips/chip-3q.png'),
} as const;

/** `chip-face.png` is 490x512 — height as a multiple of width. */
export const CHIP_FACE_ASPECT = 512 / 490;

/** `chip-face-empty.png` is 494x512. */
export const CHIP_EMPTY_ASPECT = 512 / 494;

/** `chip-3q.png` is 512x450 — height as a multiple of width. */
export const CHIP_3Q_ASPECT = 450 / 512;

/**
 * `chip-edge.png` is 512x81 — one chip's thickness as a fraction of its
 * diameter. Drives how fast a stack grows per chip.
 */
export const CHIP_EDGE_RATIO = 81 / 512;

/**
 * Vertical squash for a face lying flat on the felt, so a chip on the table
 * reads as an ellipse in the table's perspective instead of a coin facing camera.
 */
export const CHIP_FELT_SQUASH = 0.46;
