import { Image, StyleSheet, View } from 'react-native';

/** Approved tactile 3D chip — thick teal/gold with a beveled spade. */
const CHIP_ART = require('../../../../../assets/brand/poker-chip.png');

/** Native pixel size of `poker-chip.png` (three-quarter view, taller than it is wide). */
export const CHIP_ART_ASPECT = 512 / 432;

type ChipProps = {
  size: number;
  rotate?: number;
};

export function Chip({ size, rotate = 0 }: ChipProps) {
  const height = size * CHIP_ART_ASPECT;

  return (
    <View style={{ width: size, height }}>
      <Image
        source={CHIP_ART}
        resizeMode="contain"
        style={[
          styles.art,
          { width: size, height, backgroundColor: 'transparent', transform: [{ rotate: `${rotate}deg` }] },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  art: {
    width: '100%',
    height: '100%',
  },
});
