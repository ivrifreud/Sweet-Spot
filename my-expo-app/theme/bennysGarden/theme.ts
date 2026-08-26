import type { BennysGardenTheme } from './types';

/** Single canonical Benny's Garden POV background — swap art per lighting mode. */
export const bennysGardenTheme: BennysGardenTheme = {
  id: 'bennys-garden',
  name: "Benny's Garden",
  modes: {
    night: {
      background: require('../../assets/themes/bennys-garden/night-mobile.png'),
      statusBar: 'light',
    },
    light: {
      background: require('../../assets/themes/bennys-garden/light-mobile.png'),
      statusBar: 'dark',
    },
  },
};
