import { Image, StyleSheet, View } from 'react-native';

import { getChipLayers, getChipPileHeight } from '../../../../../lib/chipPileLayout';
import { CHIP_3Q_ASPECT, chipArt } from '../../../../../theme/chipArt';

type ChipPileProps = {
  chipCount: number;
  size: number;
  overlapOffset?: number;
  rotate?: number;
  showShadow?: boolean;
};

/**
 * A realistic pile built from one three-quarter chip asset. Every chip is
 * absolutely positioned and shifted upward; later chips render above earlier
 * ones so the uppermost chip stays visually on top.
 */
export function ChipPile({
  chipCount,
  size,
  overlapOffset = 10,
  rotate = 0,
  showShadow = true,
}: ChipPileProps) {
  const chipHeight = size * CHIP_3Q_ASPECT;
  const layers = getChipLayers(chipCount, overlapOffset);
  const pileHeight = getChipPileHeight(chipHeight, chipCount, overlapOffset);

  return (
    <View style={{ width: size, height: pileHeight }}>
      {showShadow && layers.length > 0 ? (
        <View
          style={[
            styles.shadow,
            {
              left: size * 0.08,
              bottom: -size * 0.03,
              width: size * 0.84,
              height: size * 0.22,
            },
          ]}
        />
      ) : null}

      {layers.map((layer) => (
        <Image
          key={layer.index}
          source={chipArt.threeQuarter}
          resizeMode="contain"
          accessibilityElementsHidden
          style={[
            styles.chip,
            {
              width: size,
              height: chipHeight,
              zIndex: layer.zIndex,
              transform: [
                { translateY: layer.translateY },
                { rotate: `${rotate + (layer.index % 2 === 0 ? -0.8 : 0.8)}deg` },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    position: 'absolute',
    left: 0,
    bottom: 0,
  },
  shadow: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(10,14,12,0.38)',
    transform: [{ scaleX: 1.12 }],
  },
});
