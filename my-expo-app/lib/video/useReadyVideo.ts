/* eslint-disable react-hooks/immutability -- Expo VideoPlayer is mutable media state. */
import { useEventListener } from 'expo';
import { useVideoPlayer } from 'expo-video';
import { useEffect, useRef, useState } from 'react';

import { markPerf } from '../performance/marks';
import { initialPlaybackState, planPlayback, type PlaybackEvent } from './playbackPlan';
import { safePauseVideoPlayer } from './safePause';

const FIRST_FRAME_TIMEOUT_MS = 4000;

export function useReadyVideo(options: {
  source: number;
  generation: number | string;
  muted?: boolean;
  loop?: boolean;
  resolveSeek?: (duration: number) => number | null;
  timeoutMs?: number;
}) {
  const generationKey = String(options.generation);
  const [generationId, setGenerationId] = useState(1);
  const previousKey = useRef(generationKey);
  useEffect(() => {
    if (previousKey.current === generationKey) return;
    previousKey.current = generationKey;
    setGenerationId((current) => current + 1);
  }, [generationKey]);
  const resolveSeek = options.resolveSeek ?? (() => 0);
  const muted = options.muted ?? true;
  const stateRef = useRef(initialPlaybackState());
  const [showPoster, setShowPoster] = useState(true);
  const [fallback, setFallback] = useState(false);

  const player = useVideoPlayer(options.source, (nextPlayer) => {
    nextPlayer.loop = options.loop ?? true;
    nextPlayer.muted = muted;
  });

  const apply = (event: PlaybackEvent) => {
    const planned = planPlayback(stateRef.current, event, resolveSeek);
    stateRef.current = planned.state;
    if (planned.command.ignore) return;
    setShowPoster(planned.command.showPoster);
    setFallback(planned.command.fallback);
    if (planned.command.muted != null) player.muted = planned.command.muted;
    if (planned.command.seekTo != null) player.currentTime = planned.command.seekTo;
    if (planned.command.shouldPlay && !player.playing) {
      markPerf(`video-play-${generationId}`);
      player.play();
    }
  };

  useEventListener(player, 'statusChange', ({ status }) => {
    apply({
      type: 'status',
      generation: generationId,
      status,
      duration: player.duration,
    });
  });
  useEventListener(player, 'sourceLoad', (event) => {
    apply({ type: 'sourceLoad', generation: generationId, duration: event.duration });
  });

  useEffect(() => {
    markPerf(`video-request-${generationId}`);
    apply({ type: 'request', generation: generationId, muted });
    const timeout = setTimeout(() => {
      apply({ type: 'timeout', generation: generationId });
    }, options.timeoutMs ?? FIRST_FRAME_TIMEOUT_MS);
    return () => {
      clearTimeout(timeout);
      apply({ type: 'dispose', generation: generationId });
      safePauseVideoPlayer(player);
    };
    // Player and generation own the playback session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generationId, muted, player]);

  return {
    player,
    showPoster: showPoster || fallback,
    fallback,
    onFirstFrame: () => {
      markPerf(`video-first-frame-${generationId}`);
      apply({ type: 'firstFrame', generation: generationId });
    },
  };
}
