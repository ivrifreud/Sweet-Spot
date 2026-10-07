import { Boogaloo_400Regular, useFonts as useBoogalooFonts } from '@expo-google-fonts/boogaloo';
import { Chewy_400Regular, useFonts } from '@expo-google-fonts/chewy';

/** Short labels, titles, and CTAs. */
export const displayFontFamily = 'Chewy_400Regular';

/** Explanation cards, tutorial writing, and settings-menu labels. */
export const boogalooFontFamily = 'Boogaloo_400Regular';

export type DesignFont = {
  fontFamily: string;
  fontWeight: '400';
};

const displayFace: DesignFont = {
  fontFamily: displayFontFamily,
  fontWeight: '400',
};

const readingFace: DesignFont = {
  fontFamily: boogalooFontFamily,
  fontWeight: '400',
};

export function useDisplayFont(): DesignFont | null {
  const [loaded] = useFonts({ Chewy_400Regular });
  return loaded ? displayFace : null;
}

export function useBoogalooFont(): DesignFont | null {
  const [loaded] = useBoogalooFonts({ Boogaloo_400Regular });
  return loaded ? readingFace : null;
}
