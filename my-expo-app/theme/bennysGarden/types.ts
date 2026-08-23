import type { ImageSourcePropType } from 'react-native';

export type LightingMode = 'night' | 'light';

export type BennysGardenTheme = {
  id: 'bennys-garden';
  name: "Benny's Garden";
  modes: Record<
    LightingMode,
    {
      background: ImageSourcePropType;
      statusBar: 'light' | 'dark';
    }
  >;
};
