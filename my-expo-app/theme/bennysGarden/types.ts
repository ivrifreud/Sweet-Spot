import type { LightingMode } from './palette';

/** Shared 1930s garden palette tokens that swap per lighting mode. */
export type GardenPalette = {
  skyTop: string;
  skyBottom: string;
  horizon: string;
  ink: string;
  cream: string;
  teal: string;
  tealDeep: string;
  tealFaded: string;
  gold: string;
  goldBright: string;
  tobacco: string;
  feltGreen: string;
  foliageDark: string;
  foliageMid: string;
  foliageLight: string;
  wood: string;
  woodDark: string;
  woodGrain: string;
  stone: string;
  stoneDark: string;
  ambientGlow: string;
  vignette: string;
  /** Night-only star tint; ignored in light mode. */
  star: string;
  /** Light-mode sun core; ignored in night mode. */
  sunCore: string;
  sunRay: string;
  cloud: string;
  cloudShadow: string;
  moonFill: string;
  moonGlow: string;
  bulbWire: string;
  bulbGlass: string;
  bulbGlow: string;
  bulbCore: string;
};

export type GardenPropKind =
  | 'mug'
  | 'radio'
  | 'lemonade'
  | 'pottedPlant'
  | 'birdhouse'
  | 'lantern'
  | 'seedPacket'
  | 'wateringCan';

export type GardenProp = {
  kind: GardenPropKind;
  x: number;
  y: number;
  scale?: number;
  rotation?: number;
};

export type StringLightBulb = {
  x: number;
  y: number;
  radius: number;
};

export type StarPoint = {
  x: number;
  y: number;
  size: number;
  opacity: number;
};

export type CloudShape = {
  x: number;
  y: number;
  scale: number;
};

export type GardenVariantLayout = {
  /** Table silhouette used by the renderer. */
  table: 'trestle' | 'roundSlats' | 'longRustic';
  fenceHeight: number;
  showTreeCanopy: boolean;
  showBench: boolean;
  stringLights: StringLightBulb[];
  stars: StarPoint[];
  clouds: CloudShape[];
  props: GardenProp[];
};

export type GardenThemeMode = {
  palette: GardenPalette;
  layout: GardenVariantLayout;
  /** Whether overhead bulbs emit warm light halos. */
  stringLightsOn: boolean;
  /** Whether celestial body (moon or sun) is visible. */
  showCelestial: boolean;
};

export type GardenThemeVariant = {
  id: string;
  name: string;
  description: string;
  night: GardenThemeMode;
  light: GardenThemeMode;
};

export type ResolvedGardenTheme = GardenThemeMode & {
  variantId: string;
  variantName: string;
  mode: LightingMode;
};
