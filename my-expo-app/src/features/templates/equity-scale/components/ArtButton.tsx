import { Image, Pressable, StyleSheet, type ImageSourcePropType } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  source: ImageSourcePropType;
  label: string;
  enabled: boolean;
  size?: number;
  round?: boolean;
  onPress: () => void;
};

export function ArtButton({ source, label, enabled, size = 108, round = true, onPress }: Props) {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pressIn = () => {
    if (!enabled) return;
    scale.value = reducedMotion ? 0.96 : withTiming(0.96, { duration: 100 });
  };

  const pressOut = () => {
    scale.value = reducedMotion
      ? 1
      : withSequence(
          withTiming(1.06, { duration: 90 }),
          withTiming(1, { duration: 110, easing: Easing.out(Easing.cubic) })
        );
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={!enabled}
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      style={[
        styles.hit,
        {
          width: size,
          height: size,
          borderRadius: round ? size / 2 : 0,
          overflow: round ? 'hidden' : 'visible',
          opacity: enabled ? 1 : 0.48,
        },
        pressStyle,
      ]}>
      <Image source={source} resizeMode="contain" style={styles.art} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  hit: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  art: {
    width: '100%',
    height: '100%',
  },
});
