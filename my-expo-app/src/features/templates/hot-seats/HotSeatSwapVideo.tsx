/* eslint-disable react-hooks/immutability -- expo-video and Reanimated are imperative mutable APIs. */
import { useEventListener } from 'expo';
import * as Haptics from 'expo-haptics';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useEffect, useRef } from 'react';
import { AppState, Platform, StyleSheet } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { playSfx, type SfxName } from '../../../../lib/audio';
import { safePauseVideoPlayer } from '../../../../lib/video/safePause';
import { GARDEN_SWAP_CUE, swapCueAt, swapSoundsDue, type SwapSound } from './hotSeatSwapVideoPlan';
import type { HotSeatSkin } from './types';

const GARDEN_SWAP_VIDEO = require('../../../../assets/hot-seats/garden-seat-swap.mp4');

const SWAP_SFX: Record<SwapSound, SfxName> = {
  'enter-body': 'hotSeatEnterBody',
  swish: 'hotSeatSwish',
};

export type HotSeatSwapVideoProps = {
  active: boolean;
  generation: string;
  skin: HotSeatSkin;
  reducedMotion: boolean;
  onCovered: () => void;
  onComplete: () => void;
  onUnavailable: () => void;
  onProgress?: (sourceTime: number) => void;
};

export function HotSeatSwapVideo({
  active,
  generation,
  skin,
  reducedMotion,
  onCovered,
  onComplete,
  onUnavailable,
  onProgress,
}: HotSeatSwapVideoProps) {
  const opacity = useSharedValue(0);
  const generationRef = useRef(generation);
  const sessionRef = useRef<string | null>(null);
  const readyRef = useRef(false);
  const frameReadyRef = useRef(false);
  const coveredRef = useRef(false);
  const completedRef = useRef(false);
  const landingDoneRef = useRef(false);
  const sourceFinishedRef = useRef(false);
  const startedRef = useRef(false);
  const revealedRef = useRef(false);
  const soundHeardRef = useRef(0);
  const mountedRef = useRef(true);
  const cueTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCoveredRef = useRef(onCovered);
  const onCompleteRef = useRef(onComplete);
  const onUnavailableRef = useRef(onUnavailable);
  const onProgressRef = useRef(onProgress);

  useEffect(() => {
    onCoveredRef.current = onCovered;
    onCompleteRef.current = onComplete;
    onUnavailableRef.current = onUnavailable;
    onProgressRef.current = onProgress;
    generationRef.current = generation;
  }, [generation, onComplete, onCovered, onProgress, onUnavailable]);

  const player = useVideoPlayer(GARDEN_SWAP_VIDEO, (next) => {
    next.loop = false;
    next.muted = true;
    next.playbackRate = GARDEN_SWAP_CUE.playbackRate;
    next.timeUpdateEventInterval = 0.05;
  });

  const clearCue = () => {
    if (cueTimeoutRef.current == null) return;
    clearTimeout(cueTimeoutRef.current);
    cueTimeoutRef.current = null;
  };

  const park = () => {
    try {
      player.pause();
      player.currentTime = GARDEN_SWAP_CUE.sourceInSeconds;
    } catch {
      readyRef.current = false;
    }
  };

  const finish = (session: string) => {
    if (completedRef.current) return;
    if (sessionRef.current !== session || generationRef.current !== session) return;
    if (!sourceFinishedRef.current || !landingDoneRef.current) return;
    completedRef.current = true;
    sessionRef.current = null;
    clearCue();
    opacity.value = 0;
    park();
    if (!mountedRef.current) return;
    onCompleteRef.current();
  };

  const fail = (session: string) => {
    if (completedRef.current) return;
    if (sessionRef.current !== session) return;
    completedRef.current = true;
    sessionRef.current = null;
    clearCue();
    opacity.value = 0;
    safePauseVideoPlayer(player);
    if (!mountedRef.current) return;
    onUnavailableRef.current();
  };

  const markLanding = (session: string) => {
    if (sessionRef.current !== session || completedRef.current) return;
    landingDoneRef.current = true;
    finish(session);
  };

  const reveal = (session: string) => {
    if (revealedRef.current || completedRef.current || sessionRef.current !== session) return;
    revealedRef.current = true;
    opacity.value = withTiming(1, { duration: GARDEN_SWAP_CUE.revealMs });
  };

  const armCueTimeout = (session: string) => {
    clearCue();
    cueTimeoutRef.current = setTimeout(() => {
      if (sessionRef.current !== session || completedRef.current || startedRef.current) return;
      fail(session);
    }, GARDEN_SWAP_CUE.timeoutMs);
  };

  const playSwapSounds = (sourceTime: number) => {
    const due = swapSoundsDue(soundHeardRef.current, sourceTime);
    if (sourceTime > soundHeardRef.current) soundHeardRef.current = sourceTime;
    due.forEach((sound) => playSfx(SWAP_SFX[sound]));
  };

  const playerReady = () => {
    try {
      return readyRef.current && player.status === 'readyToPlay';
    } catch {
      return false;
    }
  };

  const startPlayback = (session: string) => {
    if (completedRef.current || sessionRef.current !== session || generationRef.current !== session) {
      return;
    }
    if (skin !== 'garden' || reducedMotion) {
      fail(session);
      return;
    }
    if (!playerReady()) {
      armCueTimeout(session);
      return;
    }
    try {
      player.muted = true;
      player.playbackRate = GARDEN_SWAP_CUE.playbackRate;
      player.currentTime = GARDEN_SWAP_CUE.sourceInSeconds;
      playSwapSounds(GARDEN_SWAP_CUE.sourceInSeconds);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      player.play();
      if (frameReadyRef.current) reveal(session);
      armCueTimeout(session);
    } catch {
      fail(session);
    }
  };

  useEventListener(player, 'statusChange', ({ status }) => {
    if (status === 'readyToPlay') {
      readyRef.current = true;
      const session = sessionRef.current;
      if (session && !startedRef.current && !completedRef.current) {
        startPlayback(session);
      } else if (!session) {
        park();
      }
      return;
    }
    if (status === 'error') {
      readyRef.current = false;
      const session = sessionRef.current;
      if (session) fail(session);
    }
  });

  useEventListener(player, 'playingChange', ({ isPlaying }) => {
    const session = sessionRef.current;
    if (!session || completedRef.current) return;
    if (isPlaying) {
      startedRef.current = true;
      clearCue();
      if (frameReadyRef.current) reveal(session);
    }
  });

  useEventListener(player, 'timeUpdate', ({ currentTime }) => {
    const session = sessionRef.current;
    if (!session || completedRef.current || generationRef.current !== session) return;
    playSwapSounds(currentTime);
    onProgressRef.current?.(currentTime);
    const cue = swapCueAt(currentTime);
    if (cue.showNextHand && !coveredRef.current) {
      coveredRef.current = true;
      onCoveredRef.current();
      opacity.value = withTiming(0, { duration: GARDEN_SWAP_CUE.landingMs }, (finished) => {
        if (finished) runOnJS(markLanding)(session);
      });
    }
    if (cue.finishSource && !sourceFinishedRef.current) {
      sourceFinishedRef.current = true;
      safePauseVideoPlayer(player);
      finish(session);
    }
  });

  useEffect(() => {
    mountedRef.current = true;
    try {
      if (player.status === 'readyToPlay') {
        readyRef.current = true;
        if (!sessionRef.current) park();
      } else if (player.status === 'error') {
        readyRef.current = false;
      }
    } catch {
      readyRef.current = false;
    }
    return () => {
      mountedRef.current = false;
      clearCue();
      safePauseVideoPlayer(player);
    };
    // The player owns this preload session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active') return;
      const session = sessionRef.current;
      safePauseVideoPlayer(player);
      if (session && !completedRef.current && !sourceFinishedRef.current) fail(session);
    });
    return () => subscription.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player]);

  useEffect(() => {
    if (!active) {
      if (sessionRef.current && !completedRef.current && !sourceFinishedRef.current) {
        sessionRef.current = null;
        clearCue();
        opacity.value = 0;
        park();
      }
      return;
    }
    if (sessionRef.current === generation) return;

    coveredRef.current = false;
    completedRef.current = false;
    landingDoneRef.current = false;
    sourceFinishedRef.current = false;
    startedRef.current = false;
    revealedRef.current = false;
    soundHeardRef.current = 0;
    opacity.value = 0;
    sessionRef.current = generation;
    startPlayback(generation);
    // Playback starts only on the active edge for this generation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, generation, player, reducedMotion, skin]);

  const veil = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[StyleSheet.absoluteFill, { zIndex: 20 }, veil]}>
      <VideoView
        player={player}
        nativeControls={false}
        contentFit="cover"
        playsInline
        {...(Platform.OS === 'android' ? { surfaceType: 'textureView' as const } : null)}
        onFirstFrameRender={() => {
          frameReadyRef.current = true;
          const session = sessionRef.current;
          if (session) reveal(session);
        }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}
