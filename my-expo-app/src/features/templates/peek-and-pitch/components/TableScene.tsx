import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { SKINS } from '../config';
import type { TableSkin } from '../types';
import { SmokeLayer } from './SmokeLayer';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

type TableSceneProps = {
  skin: TableSkin;
  /** 0 = wide awake at the table, 1 = tunnel vision on the cards. */
  focus: SharedValue<number>;
  width: number;
  height: number;
};

/**
 * The first-person table: art backdrop (dealer pitching, blurred players, drinks, ashtray),
 * drifting smoke, and a focus pass that blurs everything while the player peeks.
 */
export function TableScene({ skin, focus, width, height }: TableSceneProps) {
  const config = SKINS[skin];

  const blurStyle = useAnimatedStyle(() => ({
    opacity: interpolate(focus.value, [0, 1], [0, 0.9], Extrapolation.CLAMP),
  }));

  const tintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(focus.value, [0, 1], [0, 0.24], Extrapolation.CLAMP),
  }));

  return (
    <Animated.View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Image source={config.background} style={StyleSheet.absoluteFill} resizeMode="cover" />

      <SmokeLayer width={width} height={height} />

      <LinearGradient
        colors={['rgba(0,0,0,0.42)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.28)', 'rgba(0,0,0,0.7)']}
        locations={[0, 0.22, 0.72, 1]}
        style={StyleSheet.absoluteFill}
      />

      <AnimatedBlurView
        intensity={20}
        tint="dark"
        experimentalBlurMethod="dimezisBlurView"
        style={[StyleSheet.absoluteFill, blurStyle]}
      />
      <Animated.View
        style={[StyleSheet.absoluteFill, { backgroundColor: config.feltTint }, tintStyle]}
      />
    </Animated.View>
  );
}
