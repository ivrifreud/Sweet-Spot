import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, View } from 'react-native';

import { getBackdropLayout, SKINS } from '../config';
import type { TableSkin } from '../types';

type TableSceneProps = {
  skin: TableSkin;
  width: number;
  height: number;
};

/**
 * First-person table backdrop. Garden (and casino) use cover so the painted
 * table fills a portrait phone instead of letterboxing a wide web frame.
 */
export function TableScene({ skin, width, height }: TableSceneProps) {
  const config = SKINS[skin];
  const layout = getBackdropLayout(
    config.backgroundSize,
    { width, height },
    config.fit,
    config.coverAnchor
  );
  const railHeight = height * 0.05;
  const railColors = [config.railCover[0], config.railCover[1], config.railCover[1]] as [
    string,
    string,
    string,
  ];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Image
        source={config.background}
        resizeMode="stretch"
        style={{
          position: 'absolute',
          left: layout.left,
          top: layout.top,
          width: layout.width,
          height: layout.height,
        }}
      />

      <LinearGradient
        colors={['rgba(17,23,20,0.18)', 'rgba(17,23,20,0)', 'rgba(17,23,20,0.08)']}
        locations={[0, 0.22, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.rail, { height: railHeight, width }]}>
        <LinearGradient colors={railColors} locations={[0, 0.55, 1]} style={StyleSheet.absoluteFill} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
