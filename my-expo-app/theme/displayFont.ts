import { Boogaloo_400Regular, useFonts as useBoogalooFonts } from '@expo-google-fonts/boogaloo';
import { Chewy_400Regular, useFonts } from '@expo-google-fonts/chewy';

/** Hand-drawn cartoon face for short labels and CTAs. */
export const displayFontFamily = 'Chewy_400Regular';

/** Hand-drawn face for explanation cards and tutorial instructions. */
export const boogalooFontFamily = 'Boogaloo_400Regular';

export function useDisplayFont(): { fontFamily: typeof displayFontFamily } | null {
  const [loaded] = useFonts({ Chewy_400Regular });
  return loaded ? { fontFamily: displayFontFamily } : null;
}

export function useBoogalooFont(): { fontFamily: typeof boogalooFontFamily } | null {
  const [loaded] = useBoogalooFonts({ Boogaloo_400Regular });
  return loaded ? { fontFamily: boogalooFontFamily } : null;
}
