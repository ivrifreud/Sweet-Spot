import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  type SharedValue,
} from 'react-native-reanimated';

import type { Card, HoleCards as HoleCardsTuple } from '@/lib/cards';

import { artStyle } from '../../../../../theme/artStyle';
import {
  HOLE_OVERLAP,
  PEEL_SLICES,
  collideWithFelt,
  cornerPeel,
  peekPull,
  type FeltPlaneConfig,
} from '../feltPlane';
import { CARD_ASPECT, CardBack, CardFace, PeekIndex } from './PlayingCard';

type Point = { x: number; y: number };

type HoleCardsProps = {
  cards: HoleCardsTuple;
  peek: SharedValue<number>;
  muck: SharedValue<number>;
  deal: SharedValue<number>;
  commit: SharedValue<number>;
  cardWidth: number;
  dealOrigin: Point;
  tableCenter: Point;
  restCenter: Point;
  plane: FeltPlaneConfig;
};

const FAN_ANGLE = 5;
const FACE_FROM_BAND = 3;

/** Negative gap tucks the left card under the right, like a gathered poker pair. */
export const CARD_GAP_RATIO = -HOLE_OVERLAP;

export function HoleCards({
  cards,
  peek,
  muck,
  deal,
  commit,
  cardWidth,
  dealOrigin,
  tableCenter,
  restCenter,
  plane,
}: HoleCardsProps) {
  const cardHeight = cardWidth * CARD_ASPECT;
  const gap = cardWidth * CARD_GAP_RATIO;
  const reduced = useReducedMotion();

  return (
    <>
      <View style={styles.root} pointerEvents="none">
        <View
          style={[
            styles.row,
            {
              left: restCenter.x - cardWidth - gap / 2,
              top: restCenter.y - cardHeight / 2,
              width: cardWidth * 2 + gap,
              height: cardHeight,
            },
          ]}>
          {cards.map((card, index) => (
            <View
              key={`${card.rank}${card.suit}-${index}`}
              style={{ marginLeft: index === 0 ? 0 : gap, zIndex: index + 1, elevation: index + 1 }}>
              <HoleCard
                card={card}
                index={index}
                cardWidth={cardWidth}
                peek={peek}
                muck={muck}
                deal={deal}
                commit={commit}
                reduced={reduced}
                dealOrigin={dealOrigin}
                tableCenter={tableCenter}
                restCenter={{
                  x: restCenter.x + (index === 0 ? -(cardWidth + gap) / 2 : (cardWidth + gap) / 2),
                  y: restCenter.y,
                }}
                plane={plane}
                mode="stock"
              />
            </View>
          ))}
        </View>
      </View>
      <View style={styles.rankPlateLayer} pointerEvents="none">
        <View
          style={[
            styles.row,
            {
              left: restCenter.x - cardWidth - gap / 2,
              top: restCenter.y - cardHeight / 2,
              width: cardWidth * 2 + gap,
              height: cardHeight,
            },
          ]}>
          {cards.map((card, index) => (
            <View
              key={`plate-${card.rank}${card.suit}-${index}`}
              style={{ marginLeft: index === 0 ? 0 : gap }}>
              <HoleCard
                card={card}
                index={index}
                cardWidth={cardWidth}
                peek={peek}
                muck={muck}
                deal={deal}
                commit={commit}
                reduced={reduced}
                dealOrigin={dealOrigin}
                tableCenter={tableCenter}
                restCenter={{
                  x: restCenter.x + (index === 0 ? -(cardWidth + gap) / 2 : (cardWidth + gap) / 2),
                  y: restCenter.y,
                }}
                plane={plane}
                mode="plate"
              />
            </View>
          ))}
        </View>
      </View>
    </>
  );
}

type HoleCardProps = {
  card: Card;
  index: number;
  cardWidth: number;
  peek: SharedValue<number>;
  muck: SharedValue<number>;
  deal: SharedValue<number>;
  commit: SharedValue<number>;
  reduced: boolean;
  dealOrigin: Point;
  tableCenter: Point;
  restCenter: Point;
  plane: FeltPlaneConfig;
  mode: 'stock' | 'plate';
};

function hopOffset(progress: number, arc: number) {
  'worklet';
  if (progress <= 0 || progress >= 1) {
    return 0;
  }
  const flightEnd = 0.74;
  if (progress < flightEnd) {
    const t = progress / flightEnd;
    return -arc * 4 * t * (1 - t);
  }
  const u = (progress - flightEnd) / (1 - flightEnd);
  return -arc * 0.04 * (1 - u) * (1 - u);
}

/** Local worklets so the UI thread never captures an uninitialized feltPlane helper. */
function bandWeight(u: number, v: number): number {
  'worklet';
  const cu = Math.min(1, Math.max(0, u));
  const cv = Math.min(1, Math.max(0, v));
  const dx = 1 - cu;
  const dy = 1 - cv;
  const dist = Math.sqrt(dx * dx * 0.55 + dy * dy);
  const radial = Math.min(1, Math.max(0, 1 - dist / 1.22));
  return radial * radial * (3 - 2 * radial);
}

function bandLift(t: number, lift: number): number {
  'worklet';
  const x = Math.min(1, Math.max(0, t));
  const pull = Math.pow(Math.min(1, Math.max(0, lift)), 1.32);
  const x2 = x * x;
  const x3 = x2 * x;
  return pull * (x2 * (1.22 - 0.1 * x) + x3 * (1 - x) * 1.45);
}

function packetBandWeight(cardIndex: number, localU: number, v: number): number {
  'worklet';
  const overlap = 0.42;
  const span = 2 - overlap;
  const origin = cardIndex === 0 ? 0 : 1 - overlap;
  const across = Math.min(1, Math.max(0, (origin + localU) / span));
  return bandWeight(0.52, v) * 0.7 + bandWeight(across, v) * 0.3;
}

function HoleCard({
  card,
  index,
  cardWidth,
  peek,
  muck,
  deal,
  commit,
  reduced,
  dealOrigin,
  tableCenter,
  restCenter,
  plane,
  mode,
}: HoleCardProps) {
  const cardHeight = cardWidth * CARD_ASPECT;
  const restRotation = index === 0 ? -FAN_ANGLE : FAN_ANGLE;
  const dealDelay = index * 0.16;
  const throwDelay = index * 0.08;
  const landSpread = index === 0 ? -cardWidth * 0.38 : cardWidth * 0.44;
  const restSpin = index === 0 ? -7 : 9;

  const dealVector = {
    x: dealOrigin.x - restCenter.x,
    y: dealOrigin.y - restCenter.y,
  };
  const throwVector = {
    x: tableCenter.x - restCenter.x + landSpread,
    y: tableCenter.y - restCenter.y,
  };
  const throwArc = cardHeight * (0.7 + index * 0.08);

  const travelStyle = useAnimatedStyle(() => {
    const dealProgress = interpolate(
      deal.value,
      [dealDelay, 0.52 + dealDelay],
      [0, 1],
      Extrapolation.CLAMP
    );
    const throwProgress = interpolate(
      muck.value,
      [throwDelay, 0.9 + throwDelay],
      [0, 1],
      Extrapolation.CLAMP
    );
    const travel = interpolate(throwProgress, [0, 0.7, 1], [0, 1, 1]);
    const easedThrow = 1 - (1 - travel) * (1 - travel);
    const inAir = interpolate(throwProgress, [0, 0.34, 0.76, 1], [0, 1, 0.12, 0]);
    const depth = (1 - dealProgress) * 0.58 + easedThrow * 0.52;
    const pose = collideWithFelt(depth, inAir, plane);
    const pull = peekPull(peek.value * (1 - throwProgress));

    return {
      transform: [
        {
          translateX: dealVector.x * (1 - dealProgress) + throwVector.x * easedThrow,
        },
        {
          translateY:
            dealVector.y * (1 - dealProgress) +
            throwVector.y * easedThrow +
            hopOffset(throwProgress, throwArc) +
            commit.value * cardHeight * 0.04 -
            pull * cardHeight * 0.1,
        },
        { perspective: plane.perspective },
        { rotateX: `${pose.rotateX * (1 - pull * 0.62)}deg` },
        {
          rotate: `${
            restRotation +
            (index === 0 ? -140 : 120) * (1 - dealProgress) +
            interpolate(throwProgress, [0, 0.5, 1], [0, index === 0 ? -42 : 48, restSpin])
          }deg`,
        },
        {
          scale: interpolate(dealProgress, [0, 1], [0.55, 1], Extrapolation.CLAMP) * pose.scale,
        },
      ],
    };
  });

  const plateTravelStyle = useAnimatedStyle(() => {
    const dealProgress = interpolate(
      deal.value,
      [dealDelay, 0.52 + dealDelay],
      [0, 1],
      Extrapolation.CLAMP
    );
    const throwProgress = interpolate(
      muck.value,
      [throwDelay, 0.9 + throwDelay],
      [0, 1],
      Extrapolation.CLAMP
    );
    const travel = interpolate(throwProgress, [0, 0.7, 1], [0, 1, 1]);
    const easedThrow = 1 - (1 - travel) * (1 - travel);
    const pull = peekPull(peek.value * (1 - throwProgress));

    return {
      transform: [
        {
          translateX: dealVector.x * (1 - dealProgress) + throwVector.x * easedThrow,
        },
        {
          translateY:
            dealVector.y * (1 - dealProgress) +
            throwVector.y * easedThrow +
            hopOffset(throwProgress, throwArc) +
            commit.value * cardHeight * 0.04 -
            pull * cardHeight * 0.1,
        },
        {
          scale: interpolate(dealProgress, [0, 1], [0.55, 1], Extrapolation.CLAMP),
        },
      ],
    };
  });

  const shadowStyle = useAnimatedStyle(() => {
    const throwProgress = interpolate(
      muck.value,
      [throwDelay, 0.2 + throwDelay],
      [0, 1],
      Extrapolation.CLAMP
    );
    const lift = peekPull(peek.value * (1 - throwProgress));
    const peel = reduced ? { rise: 0 } : cornerPeel(0.92, 0.94, lift);
    return {
      opacity: interpolate(lift, [0, 1], [0.34, 0.16], Extrapolation.CLAMP),
      transform: [{ translateY: peel.rise * 6 }, { scaleX: interpolate(lift, [0, 1], [1, 0.82]) }],
    };
  });

  const flapWidth = Math.max(58, cardWidth * 1.12);
  const flapHeight = Math.max(78, cardHeight * 0.62);

  const plateStyle = useAnimatedStyle(() => {
    const throwProgress = interpolate(
      muck.value,
      [throwDelay, 0.16 + throwDelay],
      [0, 1],
      Extrapolation.CLAMP
    );
    const lift = peek.value * (1 - throwProgress);
    const pull = reduced ? lift : peekPull(lift);
    return {
      opacity: interpolate(pull, [0.16, 0.36], [0, 1], Extrapolation.CLAMP),
      transform: [{ translateY: reduced ? -6 : -pull * cardHeight * 0.1 }],
    };
  });

  return (
    <Animated.View
      style={[
        { width: cardWidth, height: cardHeight, transformOrigin: '50% 100%' },
        mode === 'plate' ? plateTravelStyle : travelStyle,
      ]}>
      {mode === 'stock' ? (
        <>
          <Animated.View
            style={[
              styles.feltShadow,
              { width: cardWidth * 0.9, borderRadius: cardWidth * 0.16 },
              shadowStyle,
            ]}
          />
          <ElasticStock
            card={card}
            cardIndex={index}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            peek={peek}
            muck={muck}
            reduced={reduced}
          />
        </>
      ) : (
        <Animated.View
          style={[
            styles.peekIndex,
            index === 0 ? styles.peekIndexLeft : styles.peekIndexRight,
            {
              width: flapWidth,
              height: flapHeight,
              paddingBottom: cardHeight * 0.05,
              borderRadius: 8,
              paddingLeft: cardWidth * 0.08,
              paddingRight: cardWidth * 0.06,
            },
            plateStyle,
          ]}>
          <PeekIndex card={card} width={flapWidth} height={flapHeight * 0.94} />
        </Animated.View>
      )}
    </Animated.View>
  );
}

type ElasticStockProps = {
  card: Card;
  cardIndex: number;
  cardWidth: number;
  cardHeight: number;
  peek: SharedValue<number>;
  muck: SharedValue<number>;
  reduced: boolean;
};

function ElasticStock({
  card,
  cardIndex,
  cardWidth,
  cardHeight,
  peek,
  muck,
  reduced,
}: ElasticStockProps) {
  const sliceHeight = cardHeight / PEEL_SLICES;

  return (
    <View style={{ width: cardWidth, height: cardHeight, overflow: 'visible' }}>
      {Array.from({ length: PEEL_SLICES }, (_, index) => (
        <PeelBand
          key={index}
          card={card}
          cardIndex={cardIndex}
          index={index}
          sliceHeight={sliceHeight}
          cardWidth={cardWidth}
          cardHeight={cardHeight}
          peek={peek}
          muck={muck}
          reduced={reduced}
        />
      ))}
    </View>
  );
}

function PeelBand({
  card,
  cardIndex,
  index,
  sliceHeight,
  cardWidth,
  cardHeight,
  peek,
  muck,
  reduced,
}: ElasticStockProps & { index: number; sliceHeight: number }) {
  const showFace = index >= FACE_FROM_BAND;

  const bandStyle = useAnimatedStyle(() => {
    const throwProgress = interpolate(
      muck.value,
      [0, 0.2],
      [0, 1],
      Extrapolation.CLAMP
    );
    const lift = peek.value * (1 - throwProgress);
    const pull = peekPull(lift);
    const v0 = index / PEEL_SLICES;
    const v1 = (index + 1) / PEEL_SLICES;
    const y0 = bandLift(packetBandWeight(cardIndex, 0.72, v0), pull);
    const y1 = bandLift(packetBandWeight(cardIndex, 0.72, v1), pull);
    const tilt = reduced
      ? 0
      : Math.max(-2, Math.min(32, Math.atan((y1 - y0) * 3.1) * (180 / Math.PI)));
    return {
      transform: [
        { perspective: 820 },
        { rotateX: `${-tilt}deg` },
      ],
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const throwProgress = interpolate(muck.value, [0, 0.2], [0, 1], Extrapolation.CLAMP);
    const pull = peekPull(peek.value * (1 - throwProgress));
    return {
      opacity: showFace
        ? interpolate(pull, [0.14, 0.36], [1, 0], Extrapolation.CLAMP)
        : 1,
    };
  });

  const faceStyle = useAnimatedStyle(() => {
    const throwProgress = interpolate(muck.value, [0, 0.2], [0, 1], Extrapolation.CLAMP);
    const pull = peekPull(peek.value * (1 - throwProgress));
    return {
      opacity: reduced ? 0 : interpolate(pull, [0.16, 0.4], [0, 1], Extrapolation.CLAMP),
      transform: [{ translateY: -1.5 }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.band,
        {
          top: index * sliceHeight,
          width: cardWidth,
          height: sliceHeight,
          transformOrigin: '50% 0%',
          zIndex: index + 1,
        },
        bandStyle,
      ]}>
      <Animated.View
        style={[
          { marginTop: -index * sliceHeight, width: cardWidth, height: cardHeight },
          backStyle,
        ]}>
        <CardBack width={cardWidth} plain />
      </Animated.View>
      {showFace ? (
        <Animated.View
          style={[
            styles.faceWindow,
            { marginTop: -index * sliceHeight, width: cardWidth, height: cardHeight },
            faceStyle,
          ]}>
          <CardFace card={card} width={cardWidth} underside />
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    elevation: 20,
    overflow: 'visible',
  },
  row: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'visible',
    zIndex: 21,
  },
  band: {
    position: 'absolute',
    left: 0,
    overflow: 'hidden',
  },
  faceWindow: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 2,
    elevation: 2,
  },
  feltShadow: {
    position: 'absolute',
    left: '5%',
    bottom: -3,
    height: 8,
    backgroundColor: artStyle.colors.projectorBlack,
  },
  peekIndex: {
    position: 'absolute',
    bottom: 2,
    zIndex: 90,
    elevation: 40,
    overflow: 'visible',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    backgroundColor: artStyle.colors.cream,
    borderWidth: 2,
    borderColor: artStyle.colors.projectorBlack,
  },
  peekIndexLeft: {
    left: -4,
  },
  peekIndexRight: {
    right: -4,
    alignItems: 'flex-end',
  },
  rankPlateLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 40,
    elevation: 40,
    overflow: 'visible',
  },
});
