import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';

import { getChipPileHeight } from '../../../../../lib/chipPileLayout';
import { artStyle } from '../../../../../theme/artStyle';
import { CHIP_3Q_ASPECT } from '../../../../../theme/chipArt';
import { ChipPile } from './ChipPile';

export const CHIP_SIZE = 44;

/** Chips the hero lifts off the stack while committing a decision. */
export const HELD_CHIPS = 2;

/**
 * Clustered columns, tallest at the back, so the hero stack reads like the
 * moodboard pitch reference instead of one machine-perfect tower.
 */
const COLUMNS: { chips: number; lean: number }[] = [
  { chips: 8, lean: -2 },
  { chips: 5, lean: 1.5 },
  { chips: 3, lean: -1 },
];

/** Columns overlap slightly so the cluster stays inside the hit box. */
const COLUMN_STEP = 0.82;
/** Ten pixels at the default 44px chip size, scaled for smaller phones. */
const CHIP_OVERLAP_RATIO = 10 / CHIP_SIZE;

type ChipStackProps = {
  stackLabel: string;
  disabled: boolean;
  pushed: number;
  press: SharedValue<number>;
  dragX: SharedValue<number>;
  dragY: SharedValue<number>;
  chipSize?: number;
};

/** Spends `pushed` chips off the front columns first; every column keeps one chip. */
function spendChips(pushed: number) {
  const counts = COLUMNS.map((column) => column.chips);
  let left = Math.max(0, pushed);

  for (let index = counts.length - 1; index >= 0 && left > 0; index -= 1) {
    const take = Math.min(left, Math.max(0, counts[index] - 1));
    counts[index] -= take;
    left -= take;
  }

  return counts;
}

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

  const counts = spendChips(pushed);
  const step = chipSize * COLUMN_STEP;
  const overlapOffset = chipSize * CHIP_OVERLAP_RATIO;
  const chipHeight = chipSize * CHIP_3Q_ASPECT;
  const pileHeight = (count: number) => getChipPileHeight(chipHeight, count, overlapOffset);
  const clusterWidth = step * (COLUMNS.length - 1) + chipSize;
  const clusterHeight = Math.max(...counts.map(pileHeight));

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
      <View style={{ width: clusterWidth, height: clusterHeight }}>
        <Animated.View style={[styles.cluster, baseStyle]}>
          {counts.map((count, index) => (
            <View
              key={index}
              style={[styles.columnSlot, { left: index * step, zIndex: COLUMNS.length - index }]}>
              <ChipPile
                chipCount={count}
                size={chipSize}
                overlapOffset={overlapOffset}
                rotate={COLUMNS[index].lean}
              />
            </View>
          ))}
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={[
            styles.heldSlot,
            { bottom: pileHeight(counts[0]), zIndex: COLUMNS.length + 1 },
            heldStyle,
          ]}>
          <ChipPile
            chipCount={HELD_CHIPS}
            size={chipSize}
            overlapOffset={overlapOffset}
            showShadow={false}
          />
        </Animated.View>

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
    alignItems: 'flex-start',
  },
  cluster: {
    ...StyleSheet.absoluteFillObject,
  },
  columnSlot: {
    position: 'absolute',
    bottom: 0,
  },
  heldSlot: {
    position: 'absolute',
    left: 0,
  },
  badge: {
    position: 'absolute',
    top: -26,
    right: 0,
    maxWidth: '58%',
    minHeight: 22,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(17,23,20,0.72)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(200,155,60,0.55)',
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
