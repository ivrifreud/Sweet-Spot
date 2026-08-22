import { lightPalette, nightPalette } from '../palette';
import type { GardenThemeVariant } from '../types';

/** Example 3 — long rustic table POV with deep garden beyond the fence. */
export const eveningTrestle: GardenThemeVariant = {
  id: 'evening-trestle',
  name: 'Evening Trestle Table',
  description:
    'Long weathered table with garden clutter — seed packets, watering can, and dappled light from the social card-game reference.',
  night: {
    palette: nightPalette,
    stringLightsOn: true,
    showCelestial: true,
    layout: {
      table: 'longRustic',
      fenceHeight: 0.36,
      showTreeCanopy: true,
      showBench: false,
      stringLights: [
        { x: 0.06, y: 0.12, radius: 0.018 },
        { x: 0.18, y: 0.08, radius: 0.02 },
        { x: 0.32, y: 0.06, radius: 0.022 },
        { x: 0.48, y: 0.05, radius: 0.024 },
        { x: 0.64, y: 0.06, radius: 0.022 },
        { x: 0.78, y: 0.08, radius: 0.02 },
        { x: 0.9, y: 0.12, radius: 0.018 },
        { x: 0.96, y: 0.18, radius: 0.016 },
      ],
      stars: [
        { x: 0.1, y: 0.03, size: 1.8, opacity: 0.85 },
        { x: 0.25, y: 0.02, size: 1.4, opacity: 0.6 },
        { x: 0.42, y: 0.01, size: 2.1, opacity: 0.9 },
        { x: 0.6, y: 0.02, size: 1.5, opacity: 0.7 },
        { x: 0.76, y: 0.03, size: 2.3, opacity: 0.95 },
        { x: 0.92, y: 0.05, size: 1.7, opacity: 0.75 },
        { x: 0.5, y: 0.04, size: 1.2, opacity: 0.5 },
      ],
      clouds: [],
      props: [
        { kind: 'seedPacket', x: 0.28, y: 0.64, scale: 0.8 },
        { kind: 'wateringCan', x: 0.72, y: 0.6, scale: 0.9 },
        { kind: 'mug', x: 0.48, y: 0.72, scale: 0.75 },
        { kind: 'pottedPlant', x: 0.88, y: 0.44, scale: 0.7 },
      ],
    },
  },
  light: {
    palette: lightPalette,
    stringLightsOn: false,
    showCelestial: true,
    layout: {
      table: 'longRustic',
      fenceHeight: 0.36,
      showTreeCanopy: true,
      showBench: false,
      stringLights: [
        { x: 0.06, y: 0.12, radius: 0.018 },
        { x: 0.18, y: 0.08, radius: 0.02 },
        { x: 0.32, y: 0.06, radius: 0.022 },
        { x: 0.48, y: 0.05, radius: 0.024 },
        { x: 0.64, y: 0.06, radius: 0.022 },
        { x: 0.78, y: 0.08, radius: 0.02 },
        { x: 0.9, y: 0.12, radius: 0.018 },
        { x: 0.96, y: 0.18, radius: 0.016 },
      ],
      stars: [],
      clouds: [
        { x: 0.12, y: 0.09, scale: 1 },
        { x: 0.38, y: 0.06, scale: 1.15 },
        { x: 0.65, y: 0.1, scale: 0.9 },
        { x: 0.85, y: 0.07, scale: 1.05 },
      ],
      props: [
        { kind: 'seedPacket', x: 0.28, y: 0.64, scale: 0.8 },
        { kind: 'wateringCan', x: 0.72, y: 0.6, scale: 0.9 },
        { kind: 'mug', x: 0.48, y: 0.72, scale: 0.75 },
        { kind: 'pottedPlant', x: 0.88, y: 0.44, scale: 0.7 },
      ],
    },
  },
};
