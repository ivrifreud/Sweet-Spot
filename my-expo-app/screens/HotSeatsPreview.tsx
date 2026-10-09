import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  DecisionFeedbackOverlay,
  ScreenShakeHost,
  type DecisionFeedbackCopy,
  type FeedbackSeatRow,
} from '../src/features/decision-feedback';
import { buildHotSeatFeedback } from '../src/features/templates/hot-seats/feedback';
import { HotSeatsTemplate } from '../src/features/templates/hot-seats/HotSeatsTemplate';
import { LEAVE_BUTTON } from '../src/features/templates/hot-seats/sceneLayout';
import type { HotSeatStory } from '../src/features/templates/hot-seats/types';
import { artStyle } from '../theme/artStyle';

const EXIT_X = require('../assets/brand/hud/exit-x.png');

type Pending = {
  copy: DecisionFeedbackCopy;
  key: string;
  rows: FeedbackSeatRow[];
};

type Props = {
  story: HotSeatStory;
  onClose: () => void;
};

/** Settings preview. One story, then back to the map. It does not burn a Chip or record a spot. */
export function HotSeatsPreview({ story, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [feedback, setFeedback] = useState<Pending | null>(null);

  return (
    <ScreenShakeHost
      outcome={feedback?.copy.outcome ?? null}
      restartKey={feedback?.key}
      tempo="default"
      style={styles.root}>
      <HotSeatsTemplate
        story={story}
        disabled={Boolean(feedback)}
        onStoryComplete={(play) => {
          if (play.outcome !== 'win' && play.outcome !== 'loss') return;
          const built = buildHotSeatFeedback(play, 'Back to the map');
          setFeedback({
            copy: built.copy,
            rows: built.rows,
            key: `${play.story.id}-${play.outcome}`,
          });
        }}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Leave Hot Seats"
        hitSlop={8}
        onPress={onClose}
        style={[styles.exitButton, { top: LEAVE_BUTTON.top(insets.top) }]}>
        <Image source={EXIT_X} style={styles.exitArt} resizeMode="contain" />
      </Pressable>
      <DecisionFeedbackOverlay
        visible={Boolean(feedback)}
        outcome={feedback?.copy.outcome ?? 'correct'}
        title={feedback?.copy.title ?? ''}
        kicker={feedback?.copy.kicker ?? ''}
        explanation={feedback?.copy.explanation ?? ''}
        continueLabel={feedback?.copy.continueLabel ?? 'Back to the map'}
        rows={feedback?.rows}
        feedbackKey={feedback?.key}
        tempo="default"
        shakeScreen={false}
        celebrateJackpot={feedback?.copy.title === 'SWEET SPOT!'}
        onContinue={onClose}
      />
    </ScreenShakeHost>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 40,
    backgroundColor: artStyle.colors.projectorBlack,
  },
  exitButton: {
    position: 'absolute',
    left: 12,
    zIndex: 90,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitArt: {
    width: 48,
    height: 48,
  },
});
