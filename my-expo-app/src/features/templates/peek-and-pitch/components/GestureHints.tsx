import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { STRINGS } from '../strings';

type GestureHintsProps = {
  /** Drives the peek hint out of the way as soon as the player starts lifting. */
  peek: SharedValue<number>;
  peeked: boolean;
  visible: boolean;
};

/** Teaching layer: the three gestures, shown until the player uses them. */
export function GestureHints({ peek, peeked, visible }: GestureHintsProps) {
  const peekStyle = useAnimatedStyle(() => ({
    opacity: interpolate(peek.value, [0, 0.25], [1, 0]),
  }));

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.root} pointerEvents="none">
      {peeked ? (
        <View style={styles.postPeek}>
          <Hint label={STRINGS.muckHint} glyph={'\u2191'} direction={-1} />
          <Hint label={STRINGS.raiseHint} glyph={'\u25cf'} direction={0} />
        </View>
      ) : (
        <Animated.View style={peekStyle}>
          <Hint label={STRINGS.peekHint} glyph={'\u2193'} direction={1} />
        </Animated.View>
      )}
    </View>
  );
}

function Hint({ label, glyph, direction }: { label: string; glyph: string; direction: number }) {
  const loop = useSharedValue(0);

  useEffect(() => {
    loop.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [loop]);

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(loop.value, [0, 1], [0.55, 1]),
    transform: [{ translateY: direction * interpolate(loop.value, [0, 1], [0, 7]) }],
  }));

  return (
    <Animated.View style={[styles.hint, style]}>
      <Text style={styles.glyph}>{glyph}</Text>
      <Text style={styles.label}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '46%',
    alignItems: 'center',
  },
  postPeek: {
    alignItems: 'center',
    rowGap: 6,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(8,10,14,0.5)',
  },
  glyph: {
    color: '#f0c15c',
    fontSize: 14,
    fontWeight: '800',
  },
  label: {
    color: 'rgba(244,244,245,0.9)',
    fontSize: 12,
    letterSpacing: 0.3,
  },
});
