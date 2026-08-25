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
import { CARD_ASPECT, PeekIndex } from './PlayingCard';

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
};

const FAN_ANGLE = 5;
const SLICE_COUNT = 4;
const SLICE_OVERLAP = 2;

export const CARD_GAP_RATIO = 0.06;

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
}: HoleCardsProps) {
  const cardHeight = cardWidth * CARD_ASPECT;
  const gap = cardWidth * CARD_GAP_RATIO;
  const reduced = useReducedMotion();

  return (
    <View style={styles.root} pointerEvents="none">
      <View
        style={[
          styles.row,
          {
            left: restCenter.x - cardWidth - gap / 2,
            top: restCenter.y - cardHeight / 2,
            width: cardWidth * 2 + gap,
            height: cardHeight,
            columnGap: gap,
          },
        ]}>
        {cards.map((card, index) => (
          <HoleCard
            key={`${card.rank}${card.suit}-${index}`}
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
          />
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
  commit: SharedValue<number>;
  reduced: boolean;
  dealOrigin: Point;
  tableCenter: Point;
  restCenter: Point;
};

function hopOffset(progress: number, arc: number) {
  'worklet';
  if (progress <= 0 || progress >= 1) {
    return 0;
  }
  const flightEnd = 0.62;
  if (progress < flightEnd) {
    const t = progress / flightEnd;
    return -arc * 4 * t * (1 - t);
  }
  const u = (progress - flightEnd) / (1 - flightEnd);
  return -arc * 0.2 * (1 - u) * (1 - u) * Math.abs(Math.sin(u * Math.PI * 2));
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
}: HoleCardProps) {
  const cardHeight = cardWidth * CARD_ASPECT;
  const restRotation = index === 0 ? -FAN_ANGLE : FAN_ANGLE;
  const dealDelay = index * 0.16;
  const throwDelay = index * 0.08;
  const landSpread = index === 0 ? -cardWidth * 0.55 : cardWidth * 0.62;
  const restSpin = index === 0 ? -18 : 24;
  const flapHeight = cardHeight * 0.62;

  const dealVector = {
    x: dealOrigin.x - restCenter.x,
    y: dealOrigin.y - restCenter.y,
  };
  const throwVector = {
    x: tableCenter.x - restCenter.x + landSpread,
    y: tableCenter.y - restCenter.y,
  };
  const throwArc = cardHeight * (1.05 + index * 0.16);

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
    const travel = interpolate(throwProgress, [0, 0.62, 1], [0, 1, 1]);
    const easedThrow = 1 - (1 - travel) * (1 - travel);

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
            commit.value * cardHeight * 0.06,
        },
        {
          rotate: `${
            restRotation +
            (index === 0 ? -180 : 160) * (1 - dealProgress) +
            interpolate(throwProgress, [0, 0.55, 1], [0, index === 0 ? -220 : 240, restSpin])
          }deg`,
        },
        {
          scale:
            interpolate(dealProgress, [0, 1], [0.55, 1], Extrapolation.CLAMP) *
            interpolate(throwProgress, [0, 0.62, 1], [1, 0.74, 0.72], Extrapolation.CLAMP),
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
    const lift = peek.value * (1 - throwProgress);
    return {
      opacity: interpolate(lift, [0, 1], [0.32, 0.16], Extrapolation.CLAMP),
      transform: [{ scaleX: interpolate(lift, [0, 1], [1, 0.88]) }],
    };
  });

  const peekIndexStyle = useAnimatedStyle(() => {
    const throwProgress = interpolate(
      muck.value,
      [throwDelay, 0.16 + throwDelay],
      [0, 1],
      Extrapolation.CLAMP
    );
    const lift = peek.value * (1 - throwProgress);
    return {
      opacity: interpolate(lift, [0.12, 0.4], [0, 1], Extrapolation.CLAMP),
      transform: [{ translateY: -(reduced ? 0 : lift * cardHeight * 0.2) }],
    };
  });

  const sliceHeight = cardHeight / SLICE_COUNT + SLICE_OVERLAP;

  return (
    <Animated.View style={[{ width: cardWidth, height: cardHeight }, travelStyle]}>
      <Animated.View
        style={[
          styles.feltShadow,
          { width: cardWidth * 0.92, borderRadius: cardWidth * 0.18 },
          shadowStyle,
        ]}
      />
      {Array.from({ length: SLICE_COUNT }, (_, slice) => (
        <RibbonSlice
          key={slice}
          slice={slice}
          cardWidth={cardWidth}
          cardHeight={cardHeight}
          sliceHeight={sliceHeight}
          peek={peek}
          muck={muck}
          throwDelay={throwDelay}
          reduced={reduced}
        />
      ))}
      <Animated.View
        style={[
          styles.peekIndex,
          {
            height: flapHeight,
            paddingLeft: cardWidth * 0.08,
            paddingBottom: cardHeight * 0.05,
            borderBottomLeftRadius: cardWidth * 0.08,
            borderBottomRightRadius: cardWidth * 0.08,
          },
          peekIndexStyle,
        ]}>
        <PeekIndex card={card} width={cardWidth} height={flapHeight * 0.88} />
      </Animated.View>
    </Animated.View>
  );
}

type RibbonSliceProps = {
  slice: number;
  cardWidth: number;
  cardHeight: number;
  sliceHeight: number;
  peek: SharedValue<number>;
  muck: SharedValue<number>;
  throwDelay: number;
  reduced: boolean;
};

function RibbonSlice({
  slice,
  cardWidth,
  cardHeight,
  sliceHeight,
  peek,
  muck,
  throwDelay,
  reduced,
}: RibbonSliceProps) {
  const t = slice / (SLICE_COUNT - 1);
  const top = slice * (cardHeight / SLICE_COUNT) - (slice === 0 ? 0 : SLICE_OVERLAP);
  const isFirst = slice === 0;
  const isLast = slice === SLICE_COUNT - 1;
  const radius = cardWidth * 0.08;

  const bendStyle = useAnimatedStyle(() => {
    const throwProgress = interpolate(
      muck.value,
      [throwDelay, 0.18 + throwDelay],
      [0, 1],
      Extrapolation.CLAMP
    );
    const lift = peek.value * (1 - throwProgress);
    const bend = t * t * lift;
    const amount = reduced ? 0 : bend;

    return {
      transform: [{ translateY: -amount * cardHeight * 0.28 }, { scale: 1 + amount * 0.05 }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.slice,
        {
          top,
          width: cardWidth,
          height: sliceHeight,
          borderTopLeftRadius: isFirst ? radius : 0,
          borderTopRightRadius: isFirst ? radius : 0,
          borderBottomLeftRadius: isLast ? radius : 0,
          borderBottomRightRadius: isLast ? radius : 0,
          borderTopWidth: isFirst ? 2 : 0,
          borderBottomWidth: isLast ? 2 : 0,
          zIndex: slice,
        },
        bendStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
  },
  row: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
  },
  feltShadow: {
    position: 'absolute',
    left: '4%',
    bottom: -4,
    height: 9,
    backgroundColor: artStyle.colors.projectorBlack,
  },
  slice: {
    position: 'absolute',
    left: 0,
    overflow: 'hidden',
    backgroundColor: artStyle.colors.oxblood,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: artStyle.colors.projectorBlack,
  },
  peekIndex: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    overflow: 'visible',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    backgroundColor: artStyle.colors.cream,
    borderWidth: 2,
    borderColor: artStyle.colors.projectorBlack,
  },
});
