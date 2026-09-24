import type { ReactNode } from 'react';
import { Image, type ImageSourcePropType, StyleSheet, View } from 'react-native';

import {
  MEDALLION_INK_WIDTH,
  MEDALLION_RIM_WIDTH,
  type MedallionCrop,
  medallionImageBox,
} from '../../lib/hud/medallion';
import { artStyle } from '../../theme/artStyle';

type Props = {
  source: ImageSourcePropType;
  size: number;
  crop?: MedallionCrop;
  /** Rendered above the art, outside the clip (badges, numbers). */
  children?: ReactNode;
};

/** Shared HUD button base: circular art inside an inked antique-gold rim. */
export function HudMedallion({ source, size, crop, children }: Props) {
  const box = medallionImageBox(size, crop);
  const radius = size / 2;

  return (
    <View style={[styles.shell, { width: size, height: size, borderRadius: radius }]}>
      <View style={[styles.rim, { borderRadius: radius }]}>
        <Image
          source={source}
          style={[styles.art, box]}
          resizeMode="stretch"
          accessibilityElementsHidden
        />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderWidth: MEDALLION_INK_WIDTH,
    borderColor: artStyle.colors.projectorBlack,
    backgroundColor: artStyle.colors.cream,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  rim: {
    flex: 1,
    overflow: 'hidden',
    borderWidth: MEDALLION_RIM_WIDTH,
    borderColor: artStyle.colors.gold,
  },
  art: {
    position: 'absolute',
  },
});
