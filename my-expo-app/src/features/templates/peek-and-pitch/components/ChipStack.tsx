import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';

import { artStyle } from '../../../../../theme/artStyle';
import { Chip, CHIP_ART_ASPECT } from './Chip';

export const CHIP_SIZE = 82;
export const CHIP_STACK_STEP = 11;

const CHIP_HEIGHT = CHIP_SIZE * CHIP_ART_ASPECT;

/** Two short columns sitting on the felt, just left of the hole cards. */
const COLUMNS: { count: number; rotate: number }[] = [
  { count: 3, rotate: -4 },
  { count: 3, rotate: 3 },
];

type ChipStackProps = {
  stackLabel: string;
  disabled: boolean;
  pushed: number;
  press: SharedValue<number>;
  dragX: SharedValue<number>;
  dragY: SharedValue<number>;
};

export function ChipStack({ stackLabel, disabled, pushed, press, dragX, dragY }: ChipStackProps) {
  const held = useDerivedValue(() => withSpring(press.value, { damping: 18, stiffness: 300 }));

  const pressStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: dragX.value },
      { translateY: dragY.value + held.value * 4 },
      { scale: 1 - held.value * 0.03 },
    ],
  }));

  return (
    <Animated.View style={[styles.root, pressStyle]}>
      <View style={styles.columns}>
        {COLUMNS.map((column, columnIndex) => {
          const taken = columnIndex === 1 ? Math.min(pushed, column.count - 1) : 0;
          const remaining = Math.max(1, column.count - taken);
          const stackHeight = CHIP_HEIGHT + (remaining - 1) * CHIP_STACK_STEP;

          return (
            <View
              key={columnIndex}
              style={[
                styles.column,
                { width: CHIP_SIZE, height: stackHeight },
                columnIndex === 1 && styles.columnFront,
              ]}>
              {Array.from({ length: remaining }).map((_, chipIndex) => (
                <View
                  key={chipIndex}
                  style={[
                    styles.chipSlot,
                    { bottom: chipIndex * CHIP_STACK_STEP, zIndex: chipIndex },
                  ]}>
                  <Chip size={CHIP_SIZE} rotate={column.rotate} />
                </View>
              ))}
            </View>
          );
        })}
      </View>

      <View style={[styles.badge, disabled && styles.badgeDisabled]}>
        <Text style={styles.badgeText}>{stackLabel}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'flex-end',
  },
  columns: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  column: {
    position: 'relative',
  },
  columnFront: {
    marginLeft: -20,
    marginBottom: 4,
    zIndex: 3,
  },
  chipSlot: {
    position: 'absolute',
    left: 0,
  },
  badge: {
    marginTop: 2,
    paddingHorizontal: 10,
    paddingVertical: 3,
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
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});
