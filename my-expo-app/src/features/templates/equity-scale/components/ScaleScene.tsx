import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
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
import { ScaleBeam, ScaleLyre, ScalePitBack, ScalePitFront, ScalePlate, ScaleStand } from './ScaleRig';
import { SCALE_RIG } from './scaleRigArt';

type Props = {
  tilt: number;
  outcome: DecisionOutcome | null;
};

const DECK_COUNT = 10;
const DECK_CARD_WIDTH = 50;
const DECK_EDGE = 2;
const DECK_CARD_HEIGHT = DECK_CARD_WIDTH * CARD_ASPECT;
const DECK_STACK_HEIGHT = DECK_CARD_HEIGHT + (DECK_COUNT - 1) * DECK_EDGE;
/** Squash in 2D so the pile lies on the dish without a rotateX that tucks it behind the plate. */
const DECK_SQUASH_Y = 0.46;

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
      // Scale and pits stay perfectly still; the beam holds its resting tilt.
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

  // Each plate + its content falls as one rigid unit on a single timeline: it
  // starts perfectly level, tips over to pour, drifts inward, and drops into the
  // pit in front of it, fading as it sinks past the near lip.
  const leftPlateStyle = useAnimatedStyle(() => {
    if (outcome === 'incorrect') {
      if (reducedMotion) {
        return {
          transform: [{ rotate: `${-beamAngle.value}deg` }],
          opacity: interpolate(outcomeProgress.value, [0, 0.6, 1], [1, 1, 0]),
        };
      }
      const f = Math.max(0, (outcomeProgress.value - 0.15) / 0.85);
      // Order matters: translate first (world-space down + inward), rotate last
      // (spins the dish about its own centre) so the drop is straight into the
      // pit and not swung off to the side.
      return {
        transform: [
          { translateX: f * 18 },
          { translateY: f * f * 240 },
          { rotate: `${-beamAngle.value + f * 80}deg` },
        ],
        opacity: interpolate(f, [0, 0.7, 0.9], [1, 1, 0]),
      };
    }
    return { transform: [{ rotate: `${-beamAngle.value}deg` }], opacity: 1 };
  });
  const rightPlateStyle = useAnimatedStyle(() => {
    if (outcome === 'incorrect') {
      if (reducedMotion) {
        return {
          transform: [{ rotate: `${-beamAngle.value}deg` }],
          opacity: interpolate(outcomeProgress.value, [0, 0.6, 1], [1, 1, 0]),
        };
      }
      const f = Math.max(0, (outcomeProgress.value - 0.15) / 0.85);
      return {
        transform: [
          { translateX: -f * 18 },
          { translateY: f * f * 240 },
          { rotate: `${-beamAngle.value - f * 80}deg` },
        ],
        opacity: interpolate(f, [0, 0.7, 0.9], [1, 1, 0]),
      };
    }
    return { transform: [{ rotate: `${-beamAngle.value}deg` }], opacity: 1 };
  });

  return (
    <View style={styles.scene} pointerEvents="none">
      <ScaleLyre />

      {/* Beam only — stays below the stand so its centre hump hides behind the column. */}
      <Animated.View style={[styles.beamGroup, beamStyle]}>
        <ScaleBeam />
      </Animated.View>

      <ScaleStand />

      {/* Pit voids: always open, on the ground in front of each plate, behind the plate. */}
      {(['left', 'right'] as const).map((side) => (
        <View
          key={`pit-back-${side}`}
          style={[styles.pitSlot, styles.pitBackLayer, side === 'left' ? styles.pitLeft : styles.pitRight]}>
          <ScalePitBack />
        </View>
      ))}

      {/* Plates + content — same rotation box as the beam, but raised in front of the
          stand base and pit voids so they visibly drop into the holes. */}
      <Animated.View style={[styles.platesGroup, beamStyle]}>
        <Animated.View style={[styles.leftPlate, leftPlateStyle]}>
          <ScalePlate />
          <View style={styles.chips}>
            {[0, 1, 2, 3, 4].map((id) => (
              <ChipSprite
                key={id}
                size={31}
                view="threeQuarter"
                rotate={(id - 2) * 7}
                style={{ marginLeft: id === 0 ? 0 : -18, marginTop: Math.abs(2 - id) * 2 }}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View style={[styles.rightPlate, rightPlateStyle]}>
          <ScalePlate />
          <View style={styles.cards}>
            <FaceDownDeck />
          </View>
        </Animated.View>
      </Animated.View>

      {/* Near lips of the pits — in front of the falling plates so they sink out of sight. */}
      {(['left', 'right'] as const).map((side) => (
        <View
          key={`pit-front-${side}`}
          style={[styles.pitSlot, styles.pitFrontLayer, side === 'left' ? styles.pitLeft : styles.pitRight]}>
          <ScalePitFront />
        </View>
      ))}
    </View>
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
          transform: [{ scaleY: DECK_SQUASH_Y }],
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
    overflow: 'visible',
  },
  /** Centred on the pivot screw, so rotating this group swings the beam about it. */
  beamGroup: {
    position: 'absolute',
    left: SCALE_RIG.beam.left,
    top: SCALE_RIG.beam.top,
    width: SCALE_RIG.beam.width,
    height: SCALE_RIG.beam.height,
    zIndex: 1,
  },
  /** Same box/rotation as the beam, but painted in front of the stand + pit voids. */
  platesGroup: {
    position: 'absolute',
    left: SCALE_RIG.beam.left,
    top: SCALE_RIG.beam.top,
    width: SCALE_RIG.beam.width,
    height: SCALE_RIG.beam.height,
    zIndex: 4,
    overflow: 'visible',
  },
  leftPlate: {
    position: 'absolute',
    left: SCALE_RIG.plate.leftOffset,
    top: SCALE_RIG.plate.top,
    width: SCALE_RIG.plate.width,
    height: SCALE_RIG.plate.height,
    alignItems: 'center',
    overflow: 'visible',
    zIndex: 2,
  },
  rightPlate: {
    position: 'absolute',
    left: SCALE_RIG.plate.rightOffset,
    top: SCALE_RIG.plate.top,
    width: SCALE_RIG.plate.width,
    height: SCALE_RIG.plate.height,
    alignItems: 'center',
    overflow: 'visible',
    zIndex: 2,
  },
  chips: {
    position: 'absolute',
    top: SCALE_RIG.plateFloorY - 27,
    flexDirection: 'row',
    alignItems: 'flex-end',
    zIndex: 3,
    elevation: 6,
  },
  cards: {
    position: 'absolute',
    top: SCALE_RIG.plateFloorY - DECK_STACK_HEIGHT + 2,
    alignItems: 'center',
    zIndex: 3,
    elevation: 8,
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
    width: SCALE_RIG.pit.width,
    height: SCALE_RIG.pit.height,
    top: SCALE_RIG.pit.top,
  },
  pitLeft: {
    left: SCALE_RIG.pit.left,
  },
  pitRight: {
    left: SCALE_RIG.pit.right,
  },
  pitBackLayer: {
    zIndex: 3,
  },
  pitFrontLayer: {
    zIndex: 5,
  },
});
