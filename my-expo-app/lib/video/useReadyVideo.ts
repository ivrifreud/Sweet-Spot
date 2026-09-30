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
  const stateRef = useRef(
    planPlayback(initialPlaybackState(), { type: 'request', generation: 1, muted: options.muted ?? true })
      .state
  );
  const [showPoster, setShowPoster] = useState(true);
  const [fallback, setFallback] = useState(false);

  const player = useVideoPlayer(options.source, (nextPlayer) => {
    nextPlayer.loop = options.loop ?? true;
    nextPlayer.muted = muted;
  });

  const depth = useRef(0);
  const apply = (event: PlaybackEvent) => {
    if (depth.current > 2) return;
    depth.current += 1;
    try {
      const planned = planPlayback(stateRef.current, event, resolveSeek);
      stateRef.current = planned.state;
      if (planned.command.ignore) return;
      setShowPoster(planned.command.showPoster);
      setFallback(planned.command.fallback);
      if (planned.command.muted != null) player.muted = planned.command.muted;
      const seekTo = planned.command.seekTo;
      const begin = planned.command.shouldPlay && !player.playing;
      if (seekTo == null && !begin) return;
      try {
        if (player.playing && seekTo != null) player.pause();
        if (seekTo != null) player.currentTime = seekTo;
        if (begin) {
          markPerf(`video-play-${generationId}`);
          player.play();
        }
      } catch {
        if (!player.playing) {
          apply({ type: 'timeout', generation: generationId });
        }
      }
    } finally {
      depth.current -= 1;
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
  useEventListener(player, 'playingChange', ({ isPlaying }) => {
    if (isPlaying) {
      apply({ type: 'playing', generation: generationId });
    }
  });

  useEffect(() => {
    markPerf(`video-request-${generationId}`);
    apply({ type: 'request', generation: generationId, muted });
    // A local file is often already ready before this effect subscribes, so the
    // load event never arrives and the cue would sit on a black frame.
    try {
      if (player.status === 'readyToPlay' || player.status === 'error') {
        apply({
          type: 'status',
          generation: generationId,
          status: player.status,
          duration: player.duration > 0 ? player.duration : 0,
        });
      }
    } catch {
      apply({ type: 'timeout', generation: generationId });
    }
    const timeout = setTimeout(() => {
      if (player.playing) return;
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
    showPoster,
    fallback,
    onFirstFrame: () => {
      markPerf(`video-first-frame-${generationId}`);
      apply({ type: 'firstFrame', generation: generationId });
    },
  };
}
