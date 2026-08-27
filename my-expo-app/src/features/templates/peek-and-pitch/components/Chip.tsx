import { Image, StyleSheet, View } from 'react-native';

/**
 * In-scene chip uses the approved teal/gold 3D spade token from the art style
 * (three-quarter clay chip with gold rim inserts).
 */
const CHIP_ART = require('../../../../../assets/brand/casino-chip-3d.png');

/** Native pixel size of `casino-chip-3d.png` (three-quarter view). */
export const CHIP_ART_ASPECT = 1.12;

export type ChipTone = 'teal' | 'tobacco' | 'gold';

type ChipProps = {
  size: number;
  rotate?: number;
  /** Kept for stack/held-chip call sites; the PNG is teal/gold. */
  tone?: ChipTone;
};

export function Chip({ size, rotate = 0 }: ChipProps) {
  const height = size * CHIP_ART_ASPECT;

  return (
    <View style={{ width: size, height, transform: [{ rotate: `${rotate}deg` }] }}>
      <Image
        source={CHIP_ART}
        resizeMode="contain"
        style={[styles.art, { width: size, height, backgroundColor: 'transparent' }]}
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
