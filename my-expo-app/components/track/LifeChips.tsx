import { Image, StyleSheet, View } from 'react-native';

import { MAX_CHIPS, chipSlots } from '../../lib/track/chips';

const CHIP_ART = require('../../assets/brand/casino-chip-3d.png');
/** Three-quarter 3D chip from the art-style guide. */
const CHIP_ASPECT = 1.12;

type Props = {
  remaining: number;
  size?: number;
};

export function LifeChips({ remaining, size = 26 }: Props) {
  const slots = chipSlots(remaining);
  const burned = MAX_CHIPS - remaining;
  const height = size * CHIP_ASPECT;

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLiveRegion="polite"
      accessibilityLabel={
        burned === 0
          ? `${remaining} chips remaining`
          : `${remaining} chips remaining, ${burned} burned`
      }
      style={styles.row}>
      {slots.map((filled, index) => (
        <View
          key={index}
          style={[
            styles.slot,
            { width: size, height, marginLeft: index > 0 ? 4 : 0 },
            !filled && styles.emptySlot,
          ]}>
          <Image
            source={CHIP_ART}
            resizeMode="contain"
            style={[styles.art, { width: size, height, opacity: filled ? 1 : 0.22 }]}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  slot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySlot: {
    borderRadius: 14,
    backgroundColor: 'rgba(17,23,20,0.28)',
  },
  art: {
    backgroundColor: 'transparent',
  },
});
