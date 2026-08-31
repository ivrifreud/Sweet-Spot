import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';

import { artStyle } from '../../../../../theme/artStyle';
import { Chip, CHIP_ART_ASPECT } from './Chip';

export const CHIP_SIZE = 44;

type ChipStackProps = {
  stackLabel: string;
  disabled: boolean;
  pushed: number;
  press: SharedValue<number>;
  dragX: SharedValue<number>;
  dragY: SharedValue<number>;
  chipSize?: number;
};

/** Two short 3/4 columns — each PNG chip is its own object, rims stacked. */
const COLUMNS: { count: number; rotate: number; nudgeX: number }[] = [
  { count: 5, rotate: -8, nudgeX: 0 },
  { count: 4, rotate: 6, nudgeX: 8 },
];

export function ChipStack({
  stackLabel,
  disabled,
  pushed,
  press,
  dragX,
  dragY,
  chipSize = CHIP_SIZE,
}: ChipStackProps) {
  const chipHeight = chipSize * CHIP_ART_ASPECT;
  const stackStep = Math.max(8, Math.round(chipHeight * 0.2));
  const held = useDerivedValue(() => withSpring(press.value, { damping: 18, stiffness: 300 }));

  const pressStyle = useAnimatedStyle(() => ({
    opacity: 1 - held.value * 0.22,
    transform: [
      { translateX: dragX.value },
      { translateY: dragY.value },
      { scale: 1 - held.value * 0.07 },
    ],
  }));

  return (
    <Animated.View style={[styles.root, pressStyle]}>
      <View style={styles.columns}>
        {COLUMNS.map((column, columnIndex) => {
          const taken =
            columnIndex === 1
              ? Math.min(pushed, Math.max(0, column.count - 1))
              : Math.min(Math.max(0, pushed - 2), Math.max(0, column.count - 1));
          const remaining = Math.max(1, column.count - taken);
          const stackHeight = chipHeight + (remaining - 1) * stackStep;

          return (
            <View
              key={columnIndex}
              style={[
                styles.column,
                {
                  width: chipSize,
                  height: stackHeight,
                  marginLeft: column.nudgeX,
                  marginBottom: columnIndex === 1 ? 3 : 0,
                  zIndex: columnIndex + 1,
                },
              ]}>
              {Array.from({ length: remaining }).map((_, chipIndex) => (
                <View
                  key={chipIndex}
                  style={[
                    styles.chipSlot,
                    {
                      bottom: chipIndex * stackStep,
                      zIndex: chipIndex,
                      left: ((chipIndex % 2) - 0.5) * 1.5,
                    },
                  ]}>
                  <Chip size={chipSize} rotate={column.rotate} />
                </View>
              ))}
            </View>
          );
        })}
      </View>

      <View style={[styles.badge, disabled && styles.badgeDisabled]}>
        <Text style={styles.badgeText} numberOfLines={1}>
          {stackLabel}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'flex-start',
  },
  columns: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  column: {
    position: 'relative',
  },
  chipSlot: {
    position: 'absolute',
  },
  badge: {
    marginTop: 4,
    minHeight: 22,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(17,23,20,0.72)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(200,155,60,0.55)',
    alignSelf: 'flex-start',
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
