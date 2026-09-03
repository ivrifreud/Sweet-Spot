import { Image, StyleSheet, View } from 'react-native';

import { MAX_CHIPS, chipSlots } from '../../lib/track/chips';
import { CHIP_FACE_ASPECT, chipArt } from '../../theme/chipArt';

type Props = {
  remaining: number;
  size?: number;
};

export function LifeChips({ remaining, size = 26 }: Props) {
  const slots = chipSlots(remaining);
  const burned = MAX_CHIPS - remaining;
  const height = size * CHIP_FACE_ASPECT;

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
        <Image
          key={index}
          source={filled ? chipArt.face : chipArt.faceEmpty}
          resizeMode="contain"
          style={{ width: size, height, marginLeft: index > 0 ? 5 : 0 }}
          accessibilityElementsHidden
        />
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
});
