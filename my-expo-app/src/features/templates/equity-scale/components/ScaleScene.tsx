import { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { artStyle } from '../../../../../theme/artStyle';
import { ChipSprite } from '../../peek-and-pitch/components/ChipSprite';
import { CARD_ASPECT, CardBack } from '../../peek-and-pitch/components/PlayingCard';
import type { DecisionOutcome } from '../../../decision-feedback/types';
import { ScaleBeam, ScaleLyre, ScalePlate, ScaleStand } from './ScaleRig';
import { SCALE_RIG } from './scaleRigArt';

type Props = {
  tilt: number;
  outcome: DecisionOutcome | null;
};

const DECK_COUNT = 16;
const DECK_CARD_WIDTH = 52;
const DECK_EDGE = 2.4;
const DECK_CARD_HEIGHT = DECK_CARD_WIDTH * CARD_ASPECT;
const DECK_STACK_HEIGHT = DECK_CARD_HEIGHT + (DECK_COUNT - 1) * DECK_EDGE;
/** Pitch the pile onto the plate: 0 is standing, 90 is fully flat. */
const DECK_ROTATE_X = 68;

export function ScaleScene({ tilt, outcome }: Props) {
  const reducedMotion = useReducedMotion();
  const beamAngle = useSharedValue(tilt);
  const outcomeProgress = useSharedValue(0);

  useEffect(() => {
    if (outcome === 'correct') {
      beamAngle.value = reducedMotion
        ? 0
        : withSequence(
            withTiming(0, { duration: 250, easing: Easing.out(Easing.cubic) }),
            withTiming(-2.2, { duration: 150 }),
            withTiming(1.4, { duration: 150 }),
            withTiming(0, { duration: 210 })
          );
      outcomeProgress.value = withTiming(1, { duration: reducedMotion ? 180 : 700 });
      return;
    }
    if (outcome === 'incorrect') {
      outcomeProgress.value = withTiming(1, {
        duration: reducedMotion ? 240 : 1500,
        easing: Easing.in(Easing.quad),
      });
      return;
    }
    beamAngle.value = withTiming(tilt, { duration: 100, easing: Easing.out(Easing.quad) });
    outcomeProgress.value = 0;
  }, [beamAngle, outcome, outcomeProgress, reducedMotion, tilt]);

  const beamStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${beamAngle.value}deg` }],
  }));
  const sceneStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX:
          outcome === 'incorrect' && !reducedMotion
            ? interpolate(
                outcomeProgress.value,
                [0, 0.04, 0.08, 0.12, 0.18, 0.22],
                [0, 8, -8, 5, -3, 0]
              )
            : 0,
      },
    ],
  }));
  const leftPlateStyle = useAnimatedStyle(() => {
    const fall =
      outcome === 'incorrect' && !reducedMotion
        ? Math.max(0, (outcomeProgress.value - 0.34) / 0.66)
        : 0;
    return {
      transform: [
        { rotate: `${-beamAngle.value - fall * 72}deg` },
        { translateX: -fall * 22 },
        { translateY: fall * fall * 310 },
      ],
      opacity: interpolate(fall, [0, 0.88, 1], [1, 1, 0]),
    };
  });
  const rightPlateStyle = useAnimatedStyle(() => {
    const fall =
      outcome === 'incorrect' && !reducedMotion
        ? Math.max(0, (outcomeProgress.value - 0.34) / 0.66)
        : 0;
    return {
      transform: [
        { rotate: `${-beamAngle.value + fall * 72}deg` },
        { translateX: fall * 22 },
        { translateY: fall * fall * 310 },
      ],
      opacity: interpolate(fall, [0, 0.88, 1], [1, 1, 0]),
    };
  });
  const pitStyle = useAnimatedStyle<ViewStyle>(() => ({
    opacity:
      outcome === 'incorrect'
        ? reducedMotion
          ? outcomeProgress.value
          : interpolate(outcomeProgress.value, [0, 0.2, 0.32], [0, 0, 1])
        : 0,
  }));
  const hatchStyle = useAnimatedStyle<ViewStyle>(() => ({
    opacity:
      outcome === 'incorrect' ? interpolate(outcomeProgress.value, [0, 0.2, 0.32], [1, 1, 0]) : 1,
  }));
  const leftPayloadStyle = useAnimatedStyle(() => {
    const fall = outcome === 'incorrect' ? Math.max(0, (outcomeProgress.value - 0.42) / 0.58) : 0;
    return {
      transform: [
        { translateY: reducedMotion ? 0 : fall * fall * 270 },
        { translateX: reducedMotion ? 0 : -fall * 24 },
        { rotate: `${-fall * 105}deg` },
      ],
      opacity: reducedMotion
        ? interpolate(outcomeProgress.value, [0, 0.6, 1], [1, 1, 0])
        : interpolate(fall, [0, 0.88, 1], [1, 1, 0]),
    };
  });
  const rightPayloadStyle = useAnimatedStyle(() => {
    const fall = outcome === 'incorrect' ? Math.max(0, (outcomeProgress.value - 0.42) / 0.58) : 0;
    return {
      transform: [
        { translateY: reducedMotion ? 0 : fall * fall * 270 },
        { translateX: reducedMotion ? 0 : fall * 24 },
        { rotate: `${fall * 105}deg` },
      ],
      opacity: reducedMotion
        ? interpolate(outcomeProgress.value, [0, 0.6, 1], [1, 1, 0])
        : interpolate(fall, [0, 0.88, 1], [1, 1, 0]),
    };
  });

  return (
    <Animated.View style={[styles.scene, sceneStyle]} pointerEvents="none">
      <ScaleLyre />

      <Animated.View style={[styles.beamGroup, beamStyle]}>
        <ScaleBeam />

        <Animated.View style={[styles.leftPlate, leftPlateStyle]}>
          <ScalePlate />
          <Animated.View style={[styles.chips, leftPayloadStyle]}>
            {[0, 1, 2, 3, 4].map((id) => (
              <ChipSprite
                key={id}
                size={31}
                view="threeQuarter"
                rotate={(id - 2) * 7}
                style={{ marginLeft: id === 0 ? 0 : -18, marginTop: Math.abs(2 - id) * 2 }}
              />
            ))}
          </Animated.View>
        </Animated.View>

        <Animated.View style={[styles.rightPlate, rightPlateStyle]}>
          <ScalePlate />
          <Animated.View
            style={[
              styles.cards,
              { top: SCALE_RIG.plateFloorY - DECK_STACK_HEIGHT },
              rightPayloadStyle,
            ]}>
            <FaceDownDeck />
          </Animated.View>
        </Animated.View>
      </Animated.View>

      <ScaleStand />

      {(['left', 'right'] as const).map((side) => (
        <View
          key={side}
          style={[styles.pitSlot, side === 'left' ? styles.pitLeft : styles.pitRight]}>
          <Animated.View style={[styles.pitFace, hatchStyle]}>
            <View style={styles.hatchBoard}>
              <View style={styles.hatchLip} />
              <View style={styles.hatchGrain} />
              <View style={[styles.hatchGrain, styles.hatchGrainMid]} />
              <View style={[styles.hatchGrain, styles.hatchGrainLow]} />
            </View>
          </Animated.View>
          <Animated.View style={[styles.pitFace, styles.pitOpen, pitStyle]}>
            <View style={styles.pitRim}>
              <View style={styles.pitVoid} />
            </View>
          </Animated.View>
        </View>
      ))}
    </Animated.View>
  );
}

function FaceDownDeck() {
  return (
    <View
      accessibilityLabel="Face-down card stack"
      style={[
        styles.deck,
        {
          height: DECK_STACK_HEIGHT + 7,
          width: DECK_CARD_WIDTH + 8,
          transform: [{ perspective: 480 }, { rotateX: `${DECK_ROTATE_X}deg` }],
        },
      ]}>
      {Array.from({ length: DECK_COUNT }, (_, id) => (
        <View
          key={id}
          style={[
            styles.deckCard,
            {
              bottom: id * DECK_EDGE,
              transform: [{ translateX: ((id % 3) - 1) * 0.8 }],
              zIndex: id,
            },
          ]}>
          <CardBack width={DECK_CARD_WIDTH} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  scene: {
    width: SCALE_RIG.scene,
    height: SCALE_RIG.scene,
    alignSelf: 'center',
  },
  /** Centred on the pivot screw, so rotating this group swings the beam about it. */
  beamGroup: {
    position: 'absolute',
    left: SCALE_RIG.beam.left,
    top: SCALE_RIG.beam.top,
    width: SCALE_RIG.beam.width,
    height: SCALE_RIG.beam.height,
  },
  leftPlate: {
    position: 'absolute',
    left: SCALE_RIG.plate.leftOffset,
    top: SCALE_RIG.plate.top,
    width: SCALE_RIG.plate.width,
    height: SCALE_RIG.plate.height,
    alignItems: 'center',
  },
  rightPlate: {
    position: 'absolute',
    left: SCALE_RIG.plate.rightOffset,
    top: SCALE_RIG.plate.top,
    width: SCALE_RIG.plate.width,
    height: SCALE_RIG.plate.height,
    alignItems: 'center',
  },
  chips: {
    position: 'absolute',
    top: SCALE_RIG.plateFloorY - 27,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  cards: {
    position: 'absolute',
    alignItems: 'center',
  },
  deck: {
    alignItems: 'center',
    transformOrigin: '50% 100%',
  },
  deckCard: {
    position: 'absolute',
    left: 2,
    shadowColor: artStyle.colors.projectorBlack,
    shadowOpacity: 0.28,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 1 },
  },
  pitSlot: {
    position: 'absolute',
    width: 118,
    height: 48,
    top: 332,
    zIndex: 4,
  },
  pitLeft: {
    left: 12,
  },
  pitRight: {
    right: 12,
  },
  pitFace: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  pitOpen: {
    zIndex: 2,
  },
  hatchBoard: {
    flex: 1,
    borderRadius: 6,
    backgroundColor: artStyle.colors.tobacco,
    borderWidth: 2,
    borderColor: artStyle.colors.projectorBlack,
    overflow: 'hidden',
  },
  hatchLip: {
    height: 8,
    backgroundColor: artStyle.colors.cream,
    borderBottomWidth: 2,
    borderBottomColor: artStyle.colors.projectorBlack,
    opacity: 0.22,
  },
  hatchGrain: {
    position: 'absolute',
    left: 18,
    right: 18,
    top: 18,
    height: 2,
    backgroundColor: artStyle.colors.projectorBlack,
    opacity: 0.28,
  },
  hatchGrainMid: {
    top: 26,
    left: 28,
    right: 24,
  },
  hatchGrainLow: {
    top: 34,
    left: 22,
    right: 32,
  },
  pitRim: {
    flex: 1,
    borderRadius: 6,
    padding: 8,
    backgroundColor: artStyle.colors.tobacco,
    borderWidth: 2,
    borderColor: artStyle.colors.projectorBlack,
  },
  pitVoid: {
    flex: 1,
    borderRadius: 3,
    backgroundColor: artStyle.colors.projectorBlack,
  },
});
