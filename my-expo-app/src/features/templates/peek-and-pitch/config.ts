import type { ImageSourcePropType } from 'react-native';

import type { PeekAndPitchSpot, TableSkin } from './types';

type Point = { x: number; y: number };

type SkinConfig = {
  label: string;
  background: ImageSourcePropType;
  /** Intrinsic size of the backdrop, needed to map image-space anchors through `cover`. */
  backgroundSize: { width: number; height: number };
  /** The dealer's hands in the artwork, as a fraction of the image. Cards are pitched from here. */
  dealOrigin: Point;
  /** The middle of the felt in the artwork: where mucked cards and raised chips end up. */
  tableCenter: Point;
  feltTint: string;
  accent: string;
};

export const SKINS: Record<TableSkin, SkinConfig> = {
  casino: {
    label: 'Local Casino',
    background: require('../../../../assets/tables/pov-table-casino.jpg'),
    backgroundSize: { width: 900, height: 1350 },
    dealOrigin: { x: 0.5, y: 0.37 },
    tableCenter: { x: 0.5, y: 0.52 },
    feltTint: '#0d1420',
    accent: '#f0c15c',
  },
  garden: {
    label: "Benny's Garden",
    background: require('../../../../assets/tables/pov-table-garden.jpg'),
    backgroundSize: { width: 900, height: 1350 },
    dealOrigin: { x: 0.5, y: 0.38 },
    tableCenter: { x: 0.47, y: 0.5 },
    feltTint: '#14200f',
    accent: '#8fd694',
  },
};

/**
 * Maps a point expressed in backdrop coordinates onto the screen, accounting for the way
 * `resizeMode="cover"` crops the artwork. Keeps the dealer and the pot anchored to the art
 * whatever the phone's aspect ratio is.
 */
export function mapBackdropPoint(
  point: Point,
  image: { width: number; height: number },
  screen: { width: number; height: number }
): Point {
  const scale = Math.max(screen.width / image.width, screen.height / image.height);
  const renderedWidth = image.width * scale;
  const renderedHeight = image.height * scale;

  return {
    x: (screen.width - renderedWidth) / 2 + point.x * renderedWidth,
    y: (screen.height - renderedHeight) / 2 + point.y * renderedHeight,
  };
}

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
  skin: 'casino',
  heroCards: ['Ah', 'Ac'],
  position: 'BTN',
  actionLine: 'UTG opens to $15 \u00b7 2 callers',
  potLabel: '$48',
  heroStackLabel: '$300',
};
