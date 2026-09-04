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
  collideWithFelt,
  type FeltPlaneConfig,
} from '../feltPlane';
import { BentCardMesh } from './BentCardMesh';
import { CARD_ASPECT } from './PlayingCard';

type Point = { x: number; y: number };

type HoleCardsProps = {
  cards: HoleCardsTuple;
  peek: SharedValue<number>;
  muck: SharedValue<number>;
  deal: SharedValue<number>;
  cardWidth: number;
  dealOrigin: Point;
  tableCenter: Point;
  restCenter: Point;
  plane: FeltPlaneConfig;
};

const FAN_ANGLE = 1.5;

/** Negative gap tucks the left card under the right, like a gathered poker pair. */
export const CARD_GAP_RATIO = -HOLE_OVERLAP;

export function HoleCards({
  cards,
  peek,
  muck,
  deal,
  cardWidth,
  dealOrigin,
  tableCenter,
  restCenter,
  plane,
}: HoleCardsProps) {
  const cardHeight = cardWidth * CARD_ASPECT;
  const gap = cardWidth * CARD_GAP_RATIO;
  const packetWidth = cardWidth * 2 + gap;
  const reduced = useReducedMotion();
  const packetShadowStyle = useAnimatedStyle(() => {
    const lift = peek.value * (1 - muck.value);
    return {
      opacity: interpolate(lift, [0, 1], [0.34, 0.16], Extrapolation.CLAMP),
      transform: [
        { translateY: reduced ? 0 : lift * cardHeight * 0.04 },
        { scaleX: interpolate(lift, [0, 1], [1, 0.84], Extrapolation.CLAMP) },
      ],
    };
  });

  return (
    <View style={styles.root} pointerEvents="none">
      <View
        style={[
          styles.row,
          {
            left: restCenter.x - cardWidth - gap / 2,
            top: restCenter.y - cardHeight / 2,
            width: packetWidth,
            height: cardHeight,
          },
        ]}>
        <Animated.View
          style={[
            styles.feltShadow,
            { width: packetWidth * 0.94, borderRadius: cardWidth * 0.16 },
            packetShadowStyle,
          ]}
        />
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
              reduced={reduced}
              dealOrigin={dealOrigin}
              tableCenter={tableCenter}
              restCenter={{
                x: restCenter.x + (index === 0 ? -(cardWidth + gap) / 2 : (cardWidth + gap) / 2),
                y: restCenter.y,
              }}
              plane={plane}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

type HoleCardProps = {
  card: Card;
  index: number;
  cardWidth: number;
  peek: SharedValue<number>;
  muck: SharedValue<number>;
  deal: SharedValue<number>;
  reduced: boolean;
  dealOrigin: Point;
  tableCenter: Point;
  restCenter: Point;
  plane: FeltPlaneConfig;
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

function HoleCard({
  card,
  index,
  cardWidth,
  peek,
  muck,
  deal,
  reduced,
  dealOrigin,
  tableCenter,
  restCenter,
  plane,
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
    return {
      transform: [
        {
          translateX: dealVector.x * (1 - dealProgress) + throwVector.x * easedThrow,
        },
        {
          translateY:
            dealVector.y * (1 - dealProgress) +
            throwVector.y * easedThrow +
            hopOffset(throwProgress, throwArc),
        },
        { perspective: plane.perspective },
        { rotateX: `${pose.rotateX}deg` },
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

  return (
    <Animated.View
      style={[{ width: cardWidth, height: cardHeight, transformOrigin: '50% 100%' }, travelStyle]}>
      <BentCardMesh
        card={card}
        cardIndex={index}
        width={cardWidth}
        height={cardHeight}
        peek={peek}
        reduced={reduced}
      />
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
  feltShadow: {
    position: 'absolute',
    left: '3%',
    bottom: -3,
    height: 8,
    backgroundColor: artStyle.colors.projectorBlack,
  },
});
