/* eslint-disable react-hooks/immutability -- Expo VideoPlayer is mutable media state. */
import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { isMuted } from '../../../../../lib/audio';
import {
  resultClipMuted,
  resultClipStartTime,
  type ResultClipKind,
} from '../../../../../lib/equity-scale/resultPresentation';
import { artStyle } from '../../../../../theme/artStyle';

const CHEERING_VIDEO = require('../../../../../assets/videos/equity-scale-cheering.mp4');
const SAD_SCALE_VIDEO = require('../../../../../assets/tables/equity-scale/sad scale.mp4');
const PLAYBACK_FALLBACK_MS = 12_000;
const MIN_PLAY_MS = 1_200;

const CLIP = {
  perfect: {
    source: CHEERING_VIDEO,
    border: artStyle.colors.goldBright,
    label: 'Perfect scale celebration',
  },
  miss: {
    source: SAD_SCALE_VIDEO,
    border: artStyle.colors.oxblood,
    label: 'Sad scale result',
  },
} as const;

type Props = {
  variant: ResultClipKind;
  onFinished: () => void;
};

export function ScaleResultClip({ variant, onFinished }: Props) {
  const clip = CLIP[variant];
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;

  const sawFrame = useRef(false);
  const sought = useRef(false);
  const finishedRef = useRef(false);
  const startedAt = useRef(0);

  const player = useVideoPlayer(clip.source, (nextPlayer) => {
    nextPlayer.loop = false;
    nextPlayer.muted = true;
  });

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    player.pause();
    onFinishedRef.current();
  }, [player]);

  const startOrResume = useCallback(
    (loadedDuration?: number) => {
      const duration = loadedDuration && loadedDuration > 0 ? loadedDuration : player.duration;
      const startAt = resultClipStartTime(variant, duration);
      if (startAt !== null && !sought.current) {
        player.currentTime = startAt;
        sought.current = true;
        player.muted = resultClipMuted(variant) || isMuted();
      }
      if (!player.playing) player.play();
    },
    [player, variant]
  );

  useEventListener(player, 'playToEnd', () => {
    if (!sawFrame.current) return;
    if (Date.now() - startedAt.current < MIN_PLAY_MS) return;
    finish();
  });
  useEventListener(player, 'statusChange', ({ status }) => {
    if (status !== 'readyToPlay') return;
    startOrResume();
  });

  useEffect(() => {
    startedAt.current = Date.now();
    player.play();
    const fallback = setTimeout(finish, PLAYBACK_FALLBACK_MS);
    return () => {
      clearTimeout(fallback);
      player.pause();
    };
  }, [finish, player]);

  return (
    <View accessibilityLabel={clip.label} style={[styles.box, { borderColor: clip.border }]}>
      <VideoView
        player={player}
        nativeControls={false}
        contentFit="cover"
        playsInline
        surfaceType="textureView"
        onFirstFrameRender={() => {
          sawFrame.current = true;
          startOrResume();
        }}
        style={styles.video}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: '92%',
    aspectRatio: 16 / 9,
    overflow: 'hidden',
    borderWidth: 4,
    borderRadius: 18,
    backgroundColor: artStyle.colors.projectorBlack,
  },
  video: {
    width: '100%',
    height: '100%',
  },
});
