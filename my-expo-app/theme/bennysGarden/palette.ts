import { artStyle } from '../artStyle';
import type { GardenPalette } from './types';

export type LightingMode = 'night' | 'light';

const { colors } = artStyle;

/** Night palette — moonlit teal garden with warm string bulbs. */
export const nightPalette: GardenPalette = {
  skyTop: '#0a1628',
  skyBottom: '#1a3a4a',
  horizon: colors.tealFaded,
  ink: '#171713',
  cream: colors.cream,
  teal: colors.teal,
  tealDeep: '#064a4f',
  tealFaded: colors.tealFaded,
  gold: colors.gold,
  goldBright: colors.goldBright,
  tobacco: colors.tobacco,
  feltGreen: colors.feltGreen,
  foliageDark: '#1e3d2f',
  foliageMid: '#3a6b52',
  foliageLight: colors.feltGreen,
  wood: '#8b6b4a',
  woodDark: colors.tobacco,
  woodGrain: '#6a4f38',
  stone: '#6b7280',
  stoneDark: '#4b5563',
  ambientGlow: 'rgba(230, 196, 106, 0.12)',
  vignette: 'rgba(17, 23, 20, 0.45)',
  star: colors.goldBright,
  sunCore: colors.goldBright,
  sunRay: colors.gold,
  cloud: colors.cream,
  cloudShadow: colors.tealFaded,
  moonFill: colors.cream,
  moonGlow: 'rgba(232, 215, 167, 0.35)',
  bulbWire: colors.tobacco,
  bulbGlass: 'rgba(232, 215, 167, 0.55)',
  bulbGlow: colors.goldBright,
  bulbCore: colors.gold,
};

/** Light palette — afternoon cream/green garden club. */
export const lightPalette: GardenPalette = {
  skyTop: '#7ec8e8',
  skyBottom: '#c8e8f4',
  horizon: colors.cream,
  ink: '#171713',
  cream: colors.cream,
  teal: colors.teal,
  tealDeep: colors.teal,
  tealFaded: '#7eb8b0',
  gold: colors.gold,
  goldBright: colors.goldBright,
  tobacco: colors.tobacco,
  feltGreen: colors.feltGreen,
  foliageDark: '#2f5a42',
  foliageMid: '#4d8a5b',
  foliageLight: '#7cb88a',
  wood: '#c4a574',
  woodDark: colors.tobacco,
  woodGrain: '#a08058',
  stone: '#9ca3af',
  stoneDark: '#6b7280',
  ambientGlow: 'rgba(255, 248, 220, 0.18)',
  vignette: 'rgba(118, 83, 55, 0.08)',
  star: colors.goldBright,
  sunCore: colors.goldBright,
  sunRay: colors.gold,
  cloud: '#f8f4e8',
  cloudShadow: '#d4cfc0',
  moonFill: colors.cream,
  moonGlow: 'rgba(232, 215, 167, 0.2)',
  bulbWire: colors.tobacco,
  bulbGlass: 'rgba(200, 190, 170, 0.6)',
  bulbGlow: colors.goldBright,
  bulbCore: colors.gold,
};

export function resolvePalette(mode: LightingMode): GardenPalette {
  return mode === 'night' ? nightPalette : lightPalette;
}
