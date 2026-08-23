import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';

import { Chip, CHIP_ART_ASPECT } from './Chip';

export const CHIP_SIZE = 56;
export const CHIP_STACK_STEP = 11;

const CHIP_HEIGHT = CHIP_SIZE * CHIP_ART_ASPECT;

const COLUMNS: { count: number; rotate: number }[] = [
  { count: 4, rotate: -6 },
  { count: 5, rotate: 3 },
  { count: 3, rotate: 9 },
];

type ChipStackProps = {
  stackLabel: string;
  disabled: boolean;
  pushed: number;
  press: SharedValue<number>;
};

export function ChipStack({ stackLabel, disabled, pushed, press }: ChipStackProps) {
  const held = useDerivedValue(() => withSpring(press.value, { damping: 18, stiffness: 300 }));

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: held.value * 5 }, { scale: 1 - held.value * 0.04 }],
  }));

  return (
    <Animated.View style={[styles.root, pressStyle]}>
      <View style={styles.columns}>
        {COLUMNS.map((column, columnIndex) => {
          const taken = columnIndex === 1 ? Math.min(pushed, column.count - 2) : 0;
          const remaining = Math.max(2, column.count - taken);
          const stackHeight = CHIP_HEIGHT + (remaining - 1) * CHIP_STACK_STEP;

          return (
            <View
              key={columnIndex}
              style={[
                styles.column,
                { width: CHIP_SIZE, height: stackHeight },
                columnIndex === 1 && styles.columnFront,
                columnIndex === 2 && styles.columnRight,
              ]}>
              {Array.from({ length: remaining }).map((_, chipIndex) => (
                <View
                  key={chipIndex}
                  style={[
                    styles.chipSlot,
                    { bottom: chipIndex * CHIP_STACK_STEP, zIndex: chipIndex },
                  ]}>
                  <Chip
                    size={CHIP_SIZE}
                    rotate={column.rotate}
                    shadow={chipIndex === 0}
                    shadowStrength={0.85}
                  />
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
    alignItems: 'center',
  },
  columns: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingLeft: 8,
  },
  column: {
    position: 'relative',
  },
  columnFront: {
    marginLeft: -22,
    marginBottom: 10,
    zIndex: 3,
  },
  columnRight: {
    marginLeft: -20,
    marginBottom: 4,
    zIndex: 2,
  },
  chipSlot: {
    position: 'absolute',
    left: 0,
  },
  badge: {
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(8,10,14,0.72)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(240,193,92,0.55)',
  },
  badgeDisabled: {
    opacity: 0.45,
  },
  badgeText: {
    color: '#f4e6c4',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});
