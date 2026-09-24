import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, type ReactElement } from 'react';
import { Image, Platform, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { agentDebugLog } from '../../lib/agentDebugLog';
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
  effectsActive?: boolean;
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
export function WorldMapArtLayer({
  width,
  height,
  top,
  chunk,
  completedCount,
  film,
  effectsActive = true,
}: Props) {
  const overlays = visibleProgressionLayers(chunk, completedCount);
  const frame = worldMapChunkFrame(width, height, top);
  const imageSize = worldMapChunkImageSize(width, height);
  // #region agent log
  agentDebugLog({
    hypothesisId: 'E',
    location: 'WorldMapArtLayer.tsx:render',
    message: 'art layer frame',
    data: {
      chunkId: chunk.id,
      frame,
      imageSize,
      srcType: typeof chunk.background,
      overlayCount: overlays.length,
      hasFilm: Boolean(film),
    },
  });
  // #endregion

  const imageBox = {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    width: imageSize.width,
    height: imageSize.height,
  };

  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      collapsable={false}
      style={[
        styles.stack,
        frame,
        Platform.OS === 'web' ? null : { overflow: 'visible' as const },
      ]}>
      <Image
        source={chunk.background}
        resizeMode="stretch"
        accessible={false}
        style={imageBox}
        onLayout={(event) => {
          // #region agent log
          agentDebugLog({
            hypothesisId: 'E',
            location: 'WorldMapArtLayer.tsx:image-onLayout',
            message: 'background image laid out',
            data: { chunkId: chunk.id, layout: event.nativeEvent.layout },
          });
          // #endregion
        }}
        onLoad={(event) => {
          // #region agent log
          agentDebugLog({
            hypothesisId: 'B',
            location: 'WorldMapArtLayer.tsx:image-onLoad',
            message: 'background image loaded',
            data: { chunkId: chunk.id, source: event.nativeEvent.source },
          });
          // #endregion
        }}
        onError={(event) => {
          // #region agent log
          agentDebugLog({
            hypothesisId: 'B',
            location: 'WorldMapArtLayer.tsx:image-onError',
            message: 'background image failed',
            data: { chunkId: chunk.id, error: event.nativeEvent.error },
          });
          // #endregion
        }}
      />
      {overlays.map((layer) => (
        <Image
          key={`progress-${layer.unlockAfterStage}`}
          source={layer.source}
          resizeMode="stretch"
          accessible={false}
          style={imageBox}
        />
      ))}
      {film ? (
        <>
          <Image
            source={film.grain}
            resizeMode="stretch"
            accessible={false}
            style={[imageBox, { opacity: localCasinoMapTheme.film.grainOpacity }]}
          />
          <View
            pointerEvents="none"
            style={[
              styles.wash,
              styles.creamWash,
              { opacity: localCasinoMapTheme.film.dustOpacity },
            ]}
          />
          {effectsActive ? <FilmFlicker maxFlicker={localCasinoMapTheme.film.maxFlicker} /> : null}
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
