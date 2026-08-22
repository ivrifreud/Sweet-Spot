import type { LightingMode } from './palette';
import type { GardenThemeVariant, ResolvedGardenTheme } from './types';
import { eveningTrestle } from './variants/eveningTrestle';
import { moonlitClub } from './variants/moonlitClub';
import { stringLightPatio } from './variants/stringLightPatio';

export const BENNYS_GARDEN_VARIANTS: GardenThemeVariant[] = [
  stringLightPatio,
  moonlitClub,
  eveningTrestle,
];

export function getGardenVariant(id: string): GardenThemeVariant | undefined {
  return BENNYS_GARDEN_VARIANTS.find((variant) => variant.id === id);
}

export function resolveGardenTheme(
  variantId: string,
  mode: LightingMode
): ResolvedGardenTheme | undefined {
  const variant = getGardenVariant(variantId);
  if (!variant) return undefined;

  const resolved = mode === 'night' ? variant.night : variant.light;

  return {
    ...resolved,
    variantId: variant.id,
    variantName: variant.name,
    mode,
  };
}

export * from './palette';
export * from './types';
export { eveningTrestle, moonlitClub, stringLightPatio };
