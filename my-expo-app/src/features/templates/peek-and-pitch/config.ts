import type { ImageSourcePropType } from 'react-native';

import { DEFAULT_FELT_PLANE, type FeltPlaneConfig } from './feltPlane';
import type { PeekAndPitchSpot, TableSkin } from './types';

type Point = { x: number; y: number };

export type BackdropFit = 'cover' | 'width-top';

type Anchor = { x: number; y: number };

type SkinConfig = {
  label: string;
  background: ImageSourcePropType;
  /** Intrinsic size of the backdrop, needed to map image-space anchors through the fit mode. */
  backgroundSize: { width: number; height: number };
  /**
   * `cover` fills the screen and may crop left/right (casino).
   * `width-top` shows the full art width, pinned to the top — needed when
   * characters sit across the image and phones would otherwise crop them.
   */
  fit: BackdropFit;
  /**
   * Cover-fit crop bias in 0–1 image space. `(0.5, 0.5)` is centered.
   * Garden pins toward the lower table so phone 9:16 keeps the play rail.
   */
  coverAnchor?: Anchor;
  /** The dealer's hands in the artwork, as a fraction of the image. Cards are pitched from here. */
  dealOrigin: Point;
  /** The middle of the felt in the artwork: where mucked cards and raised chips end up. */
  tableCenter: Point;
  /** Near-felt seat for hole cards, in image space, glued to the invisible table plane. */
  holeRest: Point;
  /** Invisible 3D felt that cards rest on so they match the painted table. */
  feltPlane: FeltPlaneConfig;
  feltTint: string;
  accent: string;
  /**
   * Colour used to cover the bottom of the backdrop. Garden art paints hero gloves
   * into that strip; the overlay glove needs a clean rail to sit on.
   */
  railCover: [string, string];
};

export const SKINS: Record<TableSkin, SkinConfig> = {
  casino: {
    label: 'Local Casino',
    background: require('../../../../assets/tables/pov-table-casino-1930s.png'),
    backgroundSize: { width: 1024, height: 1536 },
    fit: 'cover',
    dealOrigin: { x: 0.5, y: 0.34 },
    tableCenter: { x: 0.5, y: 0.48 },
    holeRest: { x: 0.62, y: 0.88 },
    feltPlane: DEFAULT_FELT_PLANE,
    feltTint: '#111714',
    accent: '#C89B3C',
    railCover: ['rgba(17,23,20,0)', 'rgba(12,18,16,0.72)'],
  },
  garden: {
    label: "Benny's Garden",
    background: require('../../../../assets/themes/bennys-garden/night-playable-mobile.png'),
    backgroundSize: { width: 1080, height: 1920 },
    fit: 'cover',
    coverAnchor: { x: 0.5, y: 0.82 },
    dealOrigin: { x: 0.5, y: 0.3 },
    tableCenter: { x: 0.5, y: 0.46 },
    holeRest: { x: 0.62, y: 0.9 },
    feltPlane: DEFAULT_FELT_PLANE,
    feltTint: '#14110c',
    accent: '#E6C46A',
    railCover: ['rgba(32,22,12,0)', 'rgba(22,16,10,0.55)'],
  },
};

export function getBackdropLayout(
  image: { width: number; height: number },
  screen: { width: number; height: number },
  fit: BackdropFit,
  anchor: Anchor = { x: 0.5, y: 0.5 }
): { left: number; top: number; width: number; height: number } {
  if (fit === 'width-top') {
    const scale = screen.width / image.width;
    return {
      left: 0,
      top: 0,
      width: screen.width,
      height: image.height * scale,
    };
  }

  const scale = Math.max(screen.width / image.width, screen.height / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  return {
    left: (screen.width - width) * anchor.x,
    top: (screen.height - height) * anchor.y,
    width,
    height,
  };
}

/**
 * Maps a point expressed in backdrop coordinates onto the screen so dealer and pot
 * stay glued to the artwork under the skin's fit mode.
 */
export function mapBackdropPoint(
  point: Point,
  image: { width: number; height: number },
  screen: { width: number; height: number },
  fit: BackdropFit = 'cover',
  anchor: Anchor = { x: 0.5, y: 0.5 }
): Point {
  const layout = getBackdropLayout(image, screen, fit, anchor);
  return {
    x: layout.left + point.x * layout.width,
    y: layout.top + point.y * layout.height,
  };
}

/** Hit zone for the hero stack, in overlay (gesture-view) coordinates. */
export const STACK_HIT = {
  width: 132,
  height: 128,
} as const;

/** Minimum gap between the chip hitbox and the hole-card hitbox. */
export const CHIP_CARD_GAP = 56;

/** Gesture tuning. Distances are fractions of the screen height. */
export const GESTURES = {
  /** A drag that starts below this line (fraction of screen height) can muck the hand. */
  muckZoneTop: 0.6,
  /** Drag distance that takes the peek from fully down to fully lifted. */
  peekTravel: 0.18,
  /** Drag distance that commits the muck. */
  muckTravel: 0.16,
  /** Movement needed before the gesture locks into peek or muck. */
  directionLock: 6,
  peekCommit: 0.42,
  muckCommit: 0.38,
  flickVelocity: 750,
} as const;

export const DEFAULT_SPOT: PeekAndPitchSpot = {
  id: 'preflop-btn-vs-utg-open',
  skin: 'garden',
  heroCards: ['Ah', 'Ac'],
  board: [],
  position: 'BTN',
  actionLine: 'UTG opens to $15 \u00b7 2 callers',
  potLabel: '$48',
  heroStackLabel: '$300',
};
