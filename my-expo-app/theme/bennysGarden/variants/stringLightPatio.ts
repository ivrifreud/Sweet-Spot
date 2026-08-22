import { lightPalette, nightPalette } from '../palette';
import type { GardenThemeVariant } from '../types';

/** Example 1 — fenced patio with overhead string lights and trestle table. */
export const stringLightPatio: GardenThemeVariant = {
  id: 'string-light-patio',
  name: 'String Light Patio',
  description:
    'Classic backyard fence, zig-zag bulbs, and a weathered trestle table — closest to the dusk patio reference.',
  night: {
    palette: nightPalette,
    stringLightsOn: true,
    showCelestial: true,
    layout: {
      table: 'trestle',
      fenceHeight: 0.42,
      showTreeCanopy: true,
      showBench: true,
      stringLights: [
        { x: 0.08, y: 0.14, radius: 0.022 },
        { x: 0.22, y: 0.1, radius: 0.024 },
        { x: 0.38, y: 0.08, radius: 0.026 },
        { x: 0.55, y: 0.09, radius: 0.024 },
        { x: 0.7, y: 0.11, radius: 0.022 },
        { x: 0.84, y: 0.15, radius: 0.02 },
        { x: 0.92, y: 0.2, radius: 0.018 },
      ],
      stars: [
        { x: 0.12, y: 0.06, size: 2.2, opacity: 0.9 },
        { x: 0.28, y: 0.04, size: 1.6, opacity: 0.7 },
        { x: 0.45, y: 0.05, size: 2, opacity: 0.85 },
        { x: 0.62, y: 0.03, size: 1.4, opacity: 0.6 },
        { x: 0.78, y: 0.05, size: 2.4, opacity: 0.95 },
        { x: 0.9, y: 0.08, size: 1.8, opacity: 0.75 },
        { x: 0.18, y: 0.12, size: 1.2, opacity: 0.5 },
        { x: 0.52, y: 0.02, size: 1.5, opacity: 0.65 },
      ],
      clouds: [],
      props: [
        { kind: 'pottedPlant', x: 0.78, y: 0.52, scale: 0.9 },
        { kind: 'mug', x: 0.62, y: 0.68, scale: 0.85 },
        { kind: 'mug', x: 0.7, y: 0.7, scale: 0.8 },
      ],
    },
  },
  light: {
    palette: lightPalette,
    stringLightsOn: false,
    showCelestial: true,
    layout: {
      table: 'trestle',
      fenceHeight: 0.42,
      showTreeCanopy: true,
      showBench: true,
      stringLights: [
        { x: 0.08, y: 0.14, radius: 0.022 },
        { x: 0.22, y: 0.1, radius: 0.024 },
        { x: 0.38, y: 0.08, radius: 0.026 },
        { x: 0.55, y: 0.09, radius: 0.024 },
        { x: 0.7, y: 0.11, radius: 0.022 },
        { x: 0.84, y: 0.15, radius: 0.02 },
        { x: 0.92, y: 0.2, radius: 0.018 },
      ],
      stars: [],
      clouds: [
        { x: 0.15, y: 0.12, scale: 1 },
        { x: 0.45, y: 0.08, scale: 1.2 },
        { x: 0.72, y: 0.14, scale: 0.9 },
      ],
      props: [
        { kind: 'pottedPlant', x: 0.78, y: 0.52, scale: 0.9 },
        { kind: 'mug', x: 0.62, y: 0.68, scale: 0.85 },
        { kind: 'mug', x: 0.7, y: 0.7, scale: 0.8 },
      ],
    },
  },
};
