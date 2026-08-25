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
 * First-person table backdrop. No live blur / smoke here — those were melting the
 * phone. Painted-in hero gloves are already removed from the garden artwork; the
 * rail patch is a second cover so they cannot show through on any skin.
 */
export function TableScene({ skin, width, height }: TableSceneProps) {
  const config = SKINS[skin];
  const layout = getBackdropLayout(config.backgroundSize, { width, height }, config.fit);
  const railHeight = height * 0.4;

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
        colors={['rgba(17,23,20,0.28)', 'rgba(17,23,20,0)', 'rgba(17,23,20,0.12)']}
        locations={[0, 0.24, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.rail, { height: railHeight, width }]}>
        <LinearGradient
          colors={['rgba(20,16,10,0)', 'rgba(20,16,10,0.88)', 'rgba(16,12,8,1)']}
          locations={[0, 0.22, 1]}
          style={StyleSheet.absoluteFill}
        />
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
