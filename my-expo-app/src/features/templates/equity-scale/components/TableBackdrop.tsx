import { Image, StyleSheet, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { backgroundForSkin } from '../equityScaleArt';
import type { EquityWorldSkin } from '../types';

/** Portrait table art pinned to the felt so wide web previews don't crop onto Benny's face. */
export function TableBackdrop({ skin }: { skin: EquityWorldSkin }) {
  const { width, height } = useWindowDimensions();
  const imageAspect = 9 / 16;
  const screenAspect = width / Math.max(height, 1);
  const frame =
    screenAspect > imageAspect
      ? { width, height: width / imageAspect, left: 0, top: height - width / imageAspect }
      : {
          height,
          width: height * imageAspect,
          left: (width - height * imageAspect) / 2,
          top: 0,
        };

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Image
        source={backgroundForSkin(skin)}
        resizeMode="cover"
        style={[styles.art, frame]}
        accessibilityElementsHidden
      />
      <LinearGradient
        colors={['rgba(17,23,20,0.28)', 'rgba(17,23,20,0.04)', 'rgba(17,23,20,0.42)']}
        locations={[0, 0.42, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  art: {
    position: 'absolute',
  },
});
