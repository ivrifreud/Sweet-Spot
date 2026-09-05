import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import { StyleSheet, Text, View } from 'react-native';

import { MAP_NODE_CHIP_SIZE, type StageStatus } from '../../lib/track/tree';
import { ChipSprite } from '../../src/features/templates/peek-and-pitch/components/ChipSprite';
import { artStyle } from '../../theme/artStyle';
import { CHIP_3Q_ASPECT } from '../../theme/chipArt';

type Props = {
  number: number;
  status: StageStatus;
  size?: number;
};

/**
 * Three-quarter chip on the path — baked thickness from chip-3q, plus a contact
 * shadow so it sits on the road with volume instead of a flat decal.
 */
export function MapNodeMedallion({ number, status, size = MAP_NODE_CHIP_SIZE }: Props) {
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular });
  const display = fontsLoaded ? { fontFamily: 'BebasNeue_400Regular' } : null;
  const chipSize = size;
  const chipHeight = chipSize * CHIP_3Q_ASPECT;
  const locked = status === 'locked';
  const completed = status === 'completed';
  const numberColor = locked
    ? 'rgba(232,215,167,0.6)'
    : completed
      ? artStyle.colors.cream
      : artStyle.colors.projectorBlack;

  return (
    <View style={[styles.wrap, { width: chipSize, height: chipHeight }]}>
      <View
        style={[
          styles.shadow,
          {
            width: chipSize * 0.78,
            height: chipSize * 0.22,
            bottom: -chipSize * 0.02,
          },
        ]}
      />
      <View style={styles.chipBody} pointerEvents="none">
        <ChipSprite size={chipSize} view="threeQuarter" />
        {completed ? <View style={[styles.tint, styles.completedTint]} /> : null}
        {status === 'current' ? <View style={[styles.tint, styles.currentTint]} /> : null}
        {locked ? <View style={[styles.tint, styles.lockedTint]} /> : null}
        <Text
          style={[
            styles.number,
            display,
            {
              color: numberColor,
              fontSize: chipSize * 0.42,
              top: chipHeight * 0.18,
            },
          ]}>
          {number}
        </Text>
        {locked ? (
          <View style={[styles.lock, { bottom: chipHeight * 0.18 }]} accessibilityElementsHidden>
            <View style={styles.shackle} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  shadow: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(17,23,20,0.4)',
    alignSelf: 'center',
    transform: [{ scaleX: 1.05 }],
  },
  chipBody: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tint: {
    ...StyleSheet.absoluteFill,
    borderRadius: 8,
  },
  completedTint: {
    backgroundColor: 'rgba(77,138,91,0.38)',
  },
  currentTint: {
    backgroundColor: 'rgba(77,138,91,0.22)',
  },
  lockedTint: {
    backgroundColor: 'rgba(79,88,84,0.55)',
  },
  number: {
    position: 'absolute',
    letterSpacing: 0.6,
    textShadowColor: 'rgba(17,23,20,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1.5,
  },
  lock: {
    position: 'absolute',
    width: 8,
    height: 6,
    borderRadius: 1.5,
    backgroundColor: artStyle.colors.gold,
    borderWidth: 1,
    borderColor: artStyle.colors.tobacco,
    alignItems: 'center',
  },
  shackle: {
    position: 'absolute',
    top: -3,
    width: 5,
    height: 4,
    borderTopLeftRadius: 2.5,
    borderTopRightRadius: 2.5,
    borderWidth: 1.2,
    borderBottomWidth: 0,
    borderColor: artStyle.colors.gold,
  },
});
