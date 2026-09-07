import { useEffect } from 'react';
import { Image, StyleSheet, Text, View, type ImageStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { parseCard, type HoleCardCodes } from '@/lib/cards';

import { artStyle } from '../../../../../theme/artStyle';
import { ChipSprite } from '../../peek-and-pitch/components/ChipSprite';
import { CardFace } from '../../peek-and-pitch/components/PlayingCard';
import type { DecisionOutcome } from '../../../decision-feedback/types';
import { equityScaleArt } from '../equityScaleArt';

type Props = {
  tilt: number;
  outcome: DecisionOutcome | null;
  heroCards: HoleCardCodes;
};

export function ScaleScene({ tilt, outcome, heroCards }: Props) {
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
  const leftPanStyle = useAnimatedStyle(() => {
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
  const rightPanStyle = useAnimatedStyle(() => {
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
  const pitStyle = useAnimatedStyle<ImageStyle>(() => ({
    opacity:
      outcome === 'incorrect'
        ? reducedMotion
          ? outcomeProgress.value
          : interpolate(outcomeProgress.value, [0, 0.2, 0.32], [0, 0, 1])
        : 0,
  }));
  const hatchStyle = useAnimatedStyle<ImageStyle>(() => ({
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

  const signal =
    outcome === 'correct'
      ? artStyle.colors.feltGreen
      : outcome === 'incorrect'
        ? artStyle.colors.oxblood
        : null;

  return (
    <Animated.View style={[styles.scene, sceneStyle]} pointerEvents="none">
      {(['left', 'right'] as const).map((side) => (
        <View
          key={side}
          style={[styles.pitSlot, side === 'left' ? styles.pitLeft : styles.pitRight]}>
          <Animated.Image
            source={equityScaleArt.hatchClosed}
            resizeMode="contain"
            style={[styles.pitArt, hatchStyle]}
          />
          <Animated.Image
            source={equityScaleArt.pitOpen}
            resizeMode="contain"
            style={[styles.pitArt, styles.pitOpen, pitStyle]}
          />
        </View>
      ))}

      <Image source={equityScaleArt.base} resizeMode="contain" style={styles.base} />

      <Animated.View style={[styles.beamGroup, beamStyle]}>
        <Image source={equityScaleArt.beam} resizeMode="contain" style={styles.beam} />

        <Animated.View style={[styles.leftPan, leftPanStyle]}>
          <Image source={equityScaleArt.pan} resizeMode="contain" style={styles.pan} />
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

        <Animated.View style={[styles.rightPan, rightPanStyle]}>
          <Image source={equityScaleArt.pan} resizeMode="contain" style={styles.pan} />
          <Animated.View style={[styles.cards, rightPayloadStyle]}>
            <CardFace card={parseCard(heroCards[0])} width={37} />
            <View style={styles.secondCard}>
              <CardFace card={parseCard(heroCards[1])} width={37} />
            </View>
          </Animated.View>
        </Animated.View>
      </Animated.View>

      <View style={styles.signalRow}>
        <SignalBulb
          label="EV+"
          active={signal === artStyle.colors.feltGreen}
          color={artStyle.colors.feltGreen}
        />
        <SignalBulb
          label="MISS"
          active={signal === artStyle.colors.oxblood}
          color={artStyle.colors.oxblood}
        />
      </View>
    </Animated.View>
  );
}

function SignalBulb({ label, active, color }: { label: string; active: boolean; color: string }) {
  return (
    <View style={styles.signal}>
      <View style={styles.bulbWrap}>
        <Image source={equityScaleArt.bulbOff} resizeMode="contain" style={styles.bulb} />
        {active ? (
          <View style={[styles.bulbGlow, { backgroundColor: color, shadowColor: color }]} />
        ) : null}
      </View>
      <Text style={styles.signalLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: {
    width: 390,
    height: 338,
    alignSelf: 'center',
  },
  base: {
    position: 'absolute',
    width: 292,
    height: 186,
    left: 49,
    top: 117,
  },
  beamGroup: {
    position: 'absolute',
    width: 374,
    height: 116,
    left: 8,
    top: 74,
  },
  beam: {
    width: 374,
    height: 91,
  },
  pan: {
    width: 126,
    height: 63,
  },
  leftPan: {
    position: 'absolute',
    left: -4,
    top: 64,
    width: 126,
    height: 84,
    alignItems: 'center',
  },
  rightPan: {
    position: 'absolute',
    right: -4,
    top: 64,
    width: 126,
    height: 84,
    alignItems: 'center',
  },
  chips: {
    position: 'absolute',
    top: -4,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  cards: {
    position: 'absolute',
    top: -18,
    flexDirection: 'row',
    transform: [{ rotate: '82deg' }, { scale: 0.76 }],
  },
  secondCard: {
    marginLeft: -20,
    marginTop: 4,
  },
  pitSlot: {
    position: 'absolute',
    width: 128,
    height: 62,
    top: 270,
  },
  pitLeft: {
    left: 1,
  },
  pitRight: {
    right: 1,
  },
  pitArt: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: 128,
    height: 62,
  },
  pitOpen: {
    zIndex: 2,
  },
  signalRow: {
    position: 'absolute',
    left: 142,
    right: 142,
    top: 242,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signal: {
    alignItems: 'center',
  },
  bulbWrap: {
    width: 35,
    height: 49,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulb: {
    width: 35,
    height: 49,
  },
  bulbGlow: {
    position: 'absolute',
    width: 22,
    height: 28,
    top: 3,
    borderRadius: 13,
    opacity: 0.78,
    shadowOpacity: 0.9,
    shadowRadius: 10,
  },
  signalLabel: {
    color: artStyle.colors.cream,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
