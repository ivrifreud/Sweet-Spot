import { lightPalette, nightPalette } from '../palette';
import type { GardenThemeVariant } from '../types';

/** Example 2 — cozy garden club table with radio, lemonade, and lantern glow. */
export const moonlitClub: GardenThemeVariant = {
  id: 'moonlit-club',
  name: 'Moonlit Garden Club',
  description:
    'Homemade learning-club vibe with radio, lemonade pitcher, and a round slatted table from the sunny card-game reference.',
  night: {
    palette: nightPalette,
    stringLightsOn: true,
    showCelestial: true,
    layout: {
      table: 'roundSlats',
      fenceHeight: 0.38,
      showTreeCanopy: false,
      showBench: false,
      stringLights: [
        { x: 0.1, y: 0.16, radius: 0.02 },
        { x: 0.3, y: 0.1, radius: 0.022 },
        { x: 0.5, y: 0.08, radius: 0.024 },
        { x: 0.68, y: 0.1, radius: 0.022 },
        { x: 0.86, y: 0.14, radius: 0.02 },
      ],
      stars: [
        { x: 0.08, y: 0.05, size: 2, opacity: 0.8 },
        { x: 0.22, y: 0.03, size: 1.5, opacity: 0.65 },
        { x: 0.4, y: 0.04, size: 2.2, opacity: 0.9 },
        { x: 0.58, y: 0.02, size: 1.3, opacity: 0.55 },
        { x: 0.74, y: 0.04, size: 1.9, opacity: 0.85 },
        { x: 0.88, y: 0.06, size: 1.6, opacity: 0.7 },
      ],
      clouds: [],
      props: [
        { kind: 'radio', x: 0.22, y: 0.58, scale: 0.95 },
        { kind: 'lemonade', x: 0.38, y: 0.62, scale: 1 },
        { kind: 'lantern', x: 0.82, y: 0.48, scale: 0.85 },
        { kind: 'birdhouse', x: 0.14, y: 0.34, scale: 0.75 },
      ],
    },
  },
  light: {
    palette: lightPalette,
    stringLightsOn: false,
    showCelestial: true,
    layout: {
      table: 'roundSlats',
      fenceHeight: 0.38,
      showTreeCanopy: false,
      showBench: false,
      stringLights: [
        { x: 0.1, y: 0.16, radius: 0.02 },
        { x: 0.3, y: 0.1, radius: 0.022 },
        { x: 0.5, y: 0.08, radius: 0.024 },
        { x: 0.68, y: 0.1, radius: 0.022 },
        { x: 0.86, y: 0.14, radius: 0.02 },
      ],
      stars: [],
      clouds: [
        { x: 0.2, y: 0.1, scale: 0.85 },
        { x: 0.55, y: 0.07, scale: 1.1 },
        { x: 0.8, y: 0.11, scale: 0.95 },
        { x: 0.35, y: 0.16, scale: 0.7 },
      ],
      props: [
        { kind: 'radio', x: 0.22, y: 0.58, scale: 0.95 },
        { kind: 'lemonade', x: 0.38, y: 0.62, scale: 1 },
        { kind: 'lantern', x: 0.82, y: 0.48, scale: 0.85 },
        { kind: 'birdhouse', x: 0.14, y: 0.34, scale: 0.75 },
      ],
    },
  },
};
