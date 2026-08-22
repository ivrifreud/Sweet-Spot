import type { LightingMode } from './types';
import { bennysGardenTheme } from './theme';

export { bennysGardenTheme } from './theme';
export type { BennysGardenTheme, LightingMode } from './types';

export function resolveBennysGardenMode(mode: LightingMode) {
  return bennysGardenTheme.modes[mode];
}
