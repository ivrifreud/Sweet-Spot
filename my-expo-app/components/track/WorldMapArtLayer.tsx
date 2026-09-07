import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, type ReactElement } from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { worldMapChunkFrame, worldMapChunkImageSize } from '../../lib/track/tree';
import { visibleProgressionLayers } from '../../lib/track/worldProgression';
import { artStyle } from '../../theme/artStyle';
import { localCasinoMapTheme } from '../../theme/localCasinoMap';
import type { WorldMapChunk } from './worldMapTemplates';

export type WorldMapFilm = {
  grain: ImageSourcePropType;
};

type Props = {
  width: number;
  height: number;
  top: number;
  chunk: WorldMapChunk;
  completedCount: number;
  film?: WorldMapFilm;
};

function FilmFlicker({ maxFlicker }: { maxFlicker: number }): ReactElement {
  const reducedMotion = useReducedMotion();
  const pulse = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(pulse);
    if (reducedMotion) {
      pulse.value = 0;
      return;
    }
    let alive = true;
    const drift = () => {
      if (!alive) return;
      pulse.value = withTiming(Math.random(), {
        duration: 900 + Math.floor(Math.random() * 1400),
        easing: Easing.inOut(Easing.quad),
      });
    };
    drift();
    const id = setInterval(drift, 1800);
    return () => {
      alive = false;
      clearInterval(id);
      cancelAnimation(pulse);
    };
  }, [pulse, reducedMotion]);

  const creamStyle = useAnimatedStyle(() => {
    const pulseValue = reducedMotion ? 0 : Math.min(1, Math.max(0, pulse.value));
    return { opacity: pulseValue * maxFlicker };
  });
  const inkStyle = useAnimatedStyle(() => {
    const pulseValue = reducedMotion ? 0 : Math.min(1, Math.max(0, 1 - pulse.value));
    return { opacity: pulseValue * maxFlicker };
  });

  return (
    <>
      <Animated.View pointerEvents="none" style={[styles.wash, creamStyle, styles.creamWash]} />
      <Animated.View pointerEvents="none" style={[styles.wash, inkStyle, styles.inkWash]} />
    </>
  );
}

/** Inaccessible scenery stack: base chunk, unlocked overlays, then optional film. */
export function WorldMapArtLayer({ width, height, top, chunk, completedCount, film }: Props) {
  const overlays = visibleProgressionLayers(chunk, completedCount);

  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.stack, worldMapChunkFrame(width, height, top)]}>
      <Image
        source={chunk.background}
        resizeMode="cover"
        accessible={false}
        style={[styles.fill, worldMapChunkImageSize(width, height)]}
      />
      {overlays.map((layer) => (
        <Image
          key={`progress-${layer.unlockAfterStage}`}
          source={layer.source}
          resizeMode="cover"
          accessible={false}
          style={[styles.fill, worldMapChunkImageSize(width, height)]}
        />
      ))}
      {film ? (
        <>
          <Image
            source={film.grain}
            resizeMode="cover"
            accessible={false}
            style={[
              styles.fill,
              worldMapChunkImageSize(width, height),
              { opacity: localCasinoMapTheme.film.grainOpacity },
            ]}
          />
          <View
            pointerEvents="none"
            style={[
              styles.wash,
              styles.creamWash,
              { opacity: localCasinoMapTheme.film.dustOpacity },
            ]}
          />
          <FilmFlicker maxFlicker={localCasinoMapTheme.film.maxFlicker} />
          <LinearGradient
            colors={[
              `${artStyle.colors.projectorBlack}14`,
              `${artStyle.colors.projectorBlack}00`,
              `${artStyle.colors.projectorBlack}47`,
            ]}
            locations={[0, 0.5, 1]}
            pointerEvents="none"
            style={styles.fill}
          />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    position: 'absolute',
    left: 0,
    overflow: 'hidden',
    zIndex: 0,
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
  },
  wash: {
    ...StyleSheet.absoluteFillObject,
  },
  creamWash: {
    backgroundColor: artStyle.colors.cream,
  },
  inkWash: {
    backgroundColor: artStyle.colors.projectorBlack,
  },
});
