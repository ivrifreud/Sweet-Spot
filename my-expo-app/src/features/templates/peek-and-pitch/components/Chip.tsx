import { Image, StyleSheet, View } from 'react-native';

const CHIP_ART = require('../../../../../assets/brand/poker-chip-sm.png');
const CHIP_SHADOW = require('../../../../../assets/brand/poker-chip-shadow-sm.png');

/** Native pixel size of `poker-chip-sm.png`. */
export const CHIP_ART_ASPECT = 213 / 180;

type ChipProps = {
  size: number;
  rotate?: number;
  shadow?: boolean;
  shadowStrength?: number;
};

export function Chip({ size, rotate = 0, shadow = false, shadowStrength = 0.7 }: ChipProps) {
  const height = size * CHIP_ART_ASPECT;

  return (
    <View style={{ width: size, height }}>
      {shadow ? (
        <Image
          source={CHIP_SHADOW}
          resizeMode="contain"
          style={[
            styles.shadow,
            {
              width: size * 1.08,
              height: height * 0.45,
              opacity: shadowStrength,
            },
          ]}
        />
      ) : null}
      <Image
        source={CHIP_ART}
        resizeMode="contain"
        style={[styles.art, { width: size, height, transform: [{ rotate: `${rotate}deg` }] }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  art: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  shadow: {
    position: 'absolute',
    left: '2%',
    bottom: -2,
  },
});
