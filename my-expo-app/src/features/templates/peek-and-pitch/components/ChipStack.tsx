import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Chip, type ChipTone } from './Chip';

export const CHIP_SIZE = 68;
export const CHIP_FLATTEN = 0.32;

const COLUMNS: { tone: ChipTone; count: number }[] = [
  { tone: 'red', count: 9 },
  { tone: 'blue', count: 6 },
  { tone: 'black', count: 4 },
];

type ChipStackProps = {
  stackLabel: string;
  disabled: boolean;
  /** Chips already pushed into the pot — they disappear off the top of the stack. */
  pushed: number;
  onRaise: () => void;
};

/**
 * The player's own stack in the foreground. Tapping it pushes chips towards the pot —
 * no sizing maths, the tap itself is the raise.
 */
export function ChipStack({ stackLabel, disabled, pushed, onRaise }: ChipStackProps) {
  const press = useSharedValue(0);

  const tap = Gesture.Tap()
    .enabled(!disabled)
    .maxDuration(600)
    .onBegin(() => {
      press.value = withSpring(1, { damping: 18, stiffness: 320 });
    })
    .onEnd((_event, success) => {
      if (success) {
        onRaise();
      }
    })
    .onFinalize(() => {
      press.value = withSpring(0, { damping: 16, stiffness: 220 });
    });

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: press.value * 4 }, { scale: 1 - press.value * 0.03 }],
  }));

  const chipStep = CHIP_SIZE * CHIP_FLATTEN * 0.42;

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[styles.root, pressStyle]}>
        <View style={styles.columns}>
          {COLUMNS.map((column, columnIndex) => {
            const remaining = columnIndex === 0 ? Math.max(2, column.count - pushed) : column.count;

            return (
              <View key={column.tone} style={styles.column}>
                {Array.from({ length: remaining }).map((_, chipIndex) => (
                  <View key={chipIndex} style={{ marginBottom: chipIndex === 0 ? 0 : -chipStep }}>
                    <Chip tone={column.tone} size={CHIP_SIZE} flatten={CHIP_FLATTEN} />
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
    </GestureDetector>
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
    marginTop: 8,
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
