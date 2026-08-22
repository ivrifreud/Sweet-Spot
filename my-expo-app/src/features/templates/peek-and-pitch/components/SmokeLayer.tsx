import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type Puff = {
  x: number;
  y: number;
  size: number;
  drift: number;
  duration: number;
  delay: number;
};

const PUFFS: Puff[] = [
  { x: 0.12, y: 0.46, size: 90, drift: 26, duration: 11000, delay: 0 },
  { x: 0.18, y: 0.42, size: 64, drift: -18, duration: 9000, delay: 3200 },
  { x: 0.74, y: 0.4, size: 78, drift: 20, duration: 12500, delay: 1600 },
  { x: 0.5, y: 0.3, size: 120, drift: -30, duration: 15000, delay: 5200 },
];

type SmokeLayerProps = {
  width: number;
  height: number;
};

/** Cigarette haze drifting up through the overhead light. Purely atmospheric. */
export function SmokeLayer({ width, height }: SmokeLayerProps) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {PUFFS.map((puff, index) => (
        <SmokePuff key={index} puff={puff} width={width} height={height} />
      ))}
    </View>
  );
}

function SmokePuff({ puff, width, height }: { puff: Puff; width: number; height: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      puff.delay,
      withRepeat(withTiming(1, { duration: puff.duration, easing: Easing.linear }), -1, false)
    );
  }, [progress, puff.delay, puff.duration]);

  const style = useAnimatedStyle(() => {
    const p = progress.value;

    return {
      opacity: interpolate(p, [0, 0.25, 0.7, 1], [0, 0.16, 0.09, 0]),
      transform: [
        { translateY: -p * height * 0.3 },
        { translateX: puff.drift * p },
        { scale: interpolate(p, [0, 1], [0.6, 2.1]) },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.puff,
        {
          left: width * puff.x - puff.size / 2,
          top: height * puff.y - puff.size / 2,
          width: puff.size,
          height: puff.size,
        },
        style,
      ]}>
      {[1, 0.72, 0.44].map((scale) => (
        <View
          key={scale}
          style={[
            styles.ring,
            {
              width: puff.size * scale,
              height: puff.size * scale,
              borderRadius: (puff.size * scale) / 2,
            },
          ]}
        />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  puff: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    backgroundColor: 'rgba(226,232,240,0.5)',
  },
});
