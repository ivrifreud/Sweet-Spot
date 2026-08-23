import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';

import { Chip, type ChipTone } from './Chip';

export const CHIP_SIZE = 58;
export const CHIP_FLATTEN = 0.34;

const COLUMNS: { tone: ChipTone; count: number }[] = [
  { tone: 'red', count: 8 },
  { tone: 'blue', count: 5 },
];

type ChipStackProps = {
  stackLabel: string;
  disabled: boolean;
  /** Chips already pushed into the pot — they disappear off the top of the stack. */
  pushed: number;
  /** 1 while the player is holding the stack. Owned by the template's gesture layer. */
  press: SharedValue<number>;
};

/**
 * The player's own stack in the foreground. Tapping it pushes chips towards the pot —
 * no sizing maths, the tap itself is the raise. The tap gesture lives in the template so
 * that a swipe starting on the chips can still muck the hand.
 */
export function ChipStack({ stackLabel, disabled, pushed, press }: ChipStackProps) {
  const held = useDerivedValue(() => withSpring(press.value, { damping: 18, stiffness: 300 }));

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: held.value * 4 }, { scale: 1 - held.value * 0.03 }],
  }));

  const chipStep = CHIP_SIZE * CHIP_FLATTEN * 0.42;

  return (
    <Animated.View style={[styles.root, pressStyle]}>
      <View style={styles.columns}>
        {COLUMNS.map((column, columnIndex) => {
          const remaining = columnIndex === 0 ? Math.max(2, column.count - pushed) : column.count;

          return (
            <View key={column.tone} style={styles.column}>
              {Array.from({ length: remaining }).map((_, chipIndex) => (
                <View key={chipIndex} style={{ marginBottom: chipIndex === 0 ? 0 : -chipStep }}>
                  <Chip
                    tone={column.tone}
                    size={CHIP_SIZE}
                    flatten={CHIP_FLATTEN}
                    cap={chipIndex === remaining - 1}
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
    columnGap: 6,
  },
  column: {
    flexDirection: 'column-reverse',
    alignItems: 'center',
  },
  badge: {
    marginTop: 6,
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
