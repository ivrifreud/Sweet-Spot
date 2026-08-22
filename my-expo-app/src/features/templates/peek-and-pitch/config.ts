import type { ImageSourcePropType } from 'react-native';

import type { PeekAndPitchSpot, TableSkin } from './types';

type SkinConfig = {
  label: string;
  background: ImageSourcePropType;
  /** Where the dealer pitches from, as a fraction of the screen. Drives the deal animation. */
  dealOrigin: { x: number; y: number };
  /** Where mucked cards and raised chips travel to, as a fraction of the screen. */
  tableCenter: { x: number; y: number };
  feltTint: string;
  accent: string;
};

export const SKINS: Record<TableSkin, SkinConfig> = {
  casino: {
    label: 'Local Casino',
    background: require('../../../../assets/tables/pov-table-casino.jpg'),
    dealOrigin: { x: 0.5, y: 0.37 },
    tableCenter: { x: 0.5, y: 0.52 },
    feltTint: '#0d1420',
    accent: '#f0c15c',
  },
  garden: {
    label: "Benny's Garden",
    background: require('../../../../assets/tables/pov-table-garden.jpg'),
    dealOrigin: { x: 0.5, y: 0.31 },
    tableCenter: { x: 0.5, y: 0.48 },
    feltTint: '#14200f',
    accent: '#8fd694',
  },
};

/** Gesture tuning. Distances are fractions of the screen height. */
export const GESTURES = {
  /** A drag that starts below this line (fraction of screen height) can muck the hand. */
  muckZoneTop: 0.66,
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
