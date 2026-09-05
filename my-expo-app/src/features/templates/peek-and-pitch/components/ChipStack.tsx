import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';

import {
  HERO_PLAY_CHIPS,
  layoutHeroChipCluster,
  remainingPileChips,
} from '../../../../../lib/chipPileLayout';
import { artStyle } from '../../../../../theme/artStyle';
import { CHIP_3Q_ASPECT, CHIP_EDGE_RATIO } from '../../../../../theme/chipArt';
import { ChipPile } from './ChipPile';

export const CHIP_SIZE = 44;

/** Chips the hero lifts off the stack while committing a decision. */
export const HELD_CHIPS = 2;

type ChipStackProps = {
  stackLabel: string;
  disabled: boolean;
  pushed: number;
  press: SharedValue<number>;
  dragX: SharedValue<number>;
  dragY: SharedValue<number>;
  chipSize?: number;
};

export function ChipStack({
  stackLabel,
  disabled,
  pushed,
  press,
  dragX,
  dragY,
  chipSize = CHIP_SIZE,
}: ChipStackProps) {
  const held = useDerivedValue(() => withSpring(press.value, { damping: 18, stiffness: 300 }));

  const playCount = remainingPileChips(HERO_PLAY_CHIPS, pushed);
  const overlapOffset = chipSize * CHIP_EDGE_RATIO;
  const chipHeight = chipSize * CHIP_3Q_ASPECT;
  const cluster = layoutHeroChipCluster(chipSize, chipHeight, overlapOffset, playCount);
  const playPile = cluster.playPile;

  const baseStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: held.value * 2 }, { scaleY: 1 - held.value * 0.035 }],
  }));

  const heldStyle = useAnimatedStyle(() => ({
    opacity: held.value,
    transform: [
      { translateX: dragX.value },
      { translateY: dragY.value - held.value * 16 },
      { rotate: `${held.value * -6}deg` },
      { scale: 0.94 + held.value * 0.1 },
    ],
  }));

  return (
    <View style={styles.root}>
      <View style={{ width: cluster.width, height: cluster.height }}>
        <Animated.View style={[styles.cluster, baseStyle]}>
          {cluster.piles.map((pile) => (
            <View
              key={pile.key}
              style={{
                position: 'absolute',
                left: pile.x,
                bottom: pile.bottom,
                zIndex: pile.zIndex,
              }}>
              <ChipPile
                chipCount={pile.chips}
                size={chipSize}
                overlapOffset={overlapOffset}
                rotate={pile.rotate}
              />
            </View>
          ))}
        </Animated.View>

        {playPile ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.heldSlot,
              {
                left: playPile.x,
                bottom: playPile.bottom + playPile.height,
                zIndex: playPile.zIndex + 6,
              },
              heldStyle,
            ]}>
            <ChipPile
              chipCount={HELD_CHIPS}
              size={chipSize}
              overlapOffset={overlapOffset}
              showShadow={false}
            />
          </Animated.View>
        ) : null}

        <View style={[styles.badge, disabled && styles.badgeDisabled]}>
          <Text style={styles.badgeText} numberOfLines={1}>
            {stackLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    alignItems: 'center',
  },
  cluster: {
    ...StyleSheet.absoluteFill,
  },
  heldSlot: {
    position: 'absolute',
  },
  badge: {
    position: 'absolute',
    top: -26,
    left: -8,
    right: -8,
    minHeight: 22,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(17,23,20,0.72)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(200,155,60,0.55)',
    alignItems: 'center',
  },
  badgeDisabled: {
    opacity: 0.45,
  },
  badgeText: {
    color: artStyle.colors.cream,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
