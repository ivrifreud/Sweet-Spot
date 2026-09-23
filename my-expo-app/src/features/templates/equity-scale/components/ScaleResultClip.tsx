import { VideoView } from 'expo-video';
import { Platform, StyleSheet, View } from 'react-native';

import { isMuted } from '../../../../../lib/audio';
import {
  resultClipMuted,
  resultClipStartTime,
  type ResultClipKind,
} from '../../../../../lib/equity-scale/resultPresentation';
import { useReadyVideo } from '../../../../../lib/video/useReadyVideo';
import { artStyle } from '../../../../../theme/artStyle';

const CHEERING_VIDEO = require('../../../../../assets/videos/equity-scale-cheering.mp4');
const SAD_SCALE_VIDEO = require('../../../../../assets/tables/equity-scale/sad scale.mp4');

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
  onFinished?: () => void;
};

export function ScaleResultClip({ variant }: Props) {
  const clip = CLIP[variant];
  const { player, onFirstFrame } = useReadyVideo({
    source: clip.source,
    generation: variant,
    muted: resultClipMuted(variant) || isMuted(),
    resolveSeek: (duration) => resultClipStartTime(variant, duration),
  });

  return (
    <View accessibilityLabel={clip.label} style={[styles.box, { borderColor: clip.border }]}>
      <VideoView
        player={player}
        nativeControls={false}
        contentFit="cover"
        playsInline
        {...(Platform.OS === 'android' ? { surfaceType: 'textureView' as const } : null)}
        onFirstFrameRender={onFirstFrame}
        style={styles.video}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: '74%',
    maxWidth: 320,
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
