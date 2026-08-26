import { Image, StyleSheet, View } from 'react-native';

/**
 * In-scene chip uses the approved teal/gold 3/4 asset (same as the tactile
 * reference). Stacks are built from many of these, not one merged stamp.
 */
const CHIP_ART = require('../../../../../assets/brand/poker-chip.png');

/** Native pixel size of `poker-chip.png` (three-quarter view). */
export const CHIP_ART_ASPECT = 512 / 432;

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
