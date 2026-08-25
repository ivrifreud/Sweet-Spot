import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  type SharedValue,
} from 'react-native-reanimated';

import type { Card, HoleCards as HoleCardsTuple } from '@/lib/cards';

import { artStyle } from '../../../../../theme/artStyle';
import { PEEL_RISE, collideWithFelt, cornerPeel, type FeltPlaneConfig } from '../feltPlane';
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
  plane: FeltPlaneConfig;
};

const FAN_ANGLE = 3;
const COLS = 4;
const ROWS = 5;
const OVERLAP = 3;

export const CARD_GAP_RATIO = 0.05;

function logHoleWorklet(payload: Record<string, number | boolean>) {
  // #region agent log
  fetch('http://127.0.0.1:7582/ingest/188086e2-e435-49ea-98d2-b1b490fd324d', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '83e178' },
    body: JSON.stringify({
      sessionId: '83e178',
      runId: 'pre-fix',
      hypothesisId: 'A',
      location: 'HoleCards.tsx:worklet',
      message: 'card worklet pose sample',
      data: payload,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
}

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

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7582/ingest/188086e2-e435-49ea-98d2-b1b490fd324d', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '83e178' },
      body: JSON.stringify({
        sessionId: '83e178',
        runId: 'pre-fix',
        hypothesisId: 'E',
        location: 'HoleCards.tsx:mount',
        message: 'hole card mesh mount',
        data: {
          cardWidth,
          cardHeight,
          restCenter,
          patchCount: 4 * 5 * cards.length,
          reduced,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, [cardHeight, cardWidth, cards.length, reduced, restCenter]);

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
            plane={plane}
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
  commit,
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
  const flapWidth = cardWidth * 0.46;
  const flapHeight = cardHeight * 0.34;
  const patchWidth = cardWidth / COLS + OVERLAP;
  const patchHeight = cardHeight / ROWS + OVERLAP;

  const dealVector = {
    x: dealOrigin.x - restCenter.x,
    y: dealOrigin.y - restCenter.y,
  };
  const throwVector = {
    x: tableCenter.x - restCenter.x + landSpread,
    y: tableCenter.y - restCenter.y,
  };
  const throwArc = cardHeight * (0.7 + index * 0.08);

  useAnimatedReaction(
    () => {
      const pose = collideWithFelt(0, 0, plane);
      const peel = cornerPeel(0.9, 0.93, peek.value);
      return {
        index,
        peek: peek.value,
        deal: deal.value,
        muck: muck.value,
        poseX: pose.rotateX,
        poseScale: pose.scale,
        rise: peel.rise,
        rx: peel.rotateX,
        ry: peel.rotateY,
        nan: Number.isNaN(pose.rotateX) || Number.isNaN(peel.rise),
      };
    },
    (value) => {
      if (index !== 0) {
        return;
      }
      runOnJS(logHoleWorklet)(value);
    }
  );

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
            hopOffset(throwProgress, throwArc) +
            commit.value * cardHeight * 0.04,
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

  const shadowStyle = useAnimatedStyle(() => {
    const throwProgress = interpolate(
      muck.value,
      [throwDelay, 0.2 + throwDelay],
      [0, 1],
      Extrapolation.CLAMP
    );
    const lift = peek.value * (1 - throwProgress);
    const peel = reduced ? { rise: 0 } : cornerPeel(0.92, 0.94, lift);
    return {
      opacity: interpolate(lift, [0, 1], [0.34, 0.14], Extrapolation.CLAMP),
      transform: [{ translateY: peel.rise * 8 }, { scaleX: interpolate(lift, [0, 1], [1, 0.78]) }],
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
    const peel = reduced ? { rise: 0, rotateX: 0, rotateY: 0 } : cornerPeel(0.9, 0.93, lift);
    return {
      opacity: interpolate(lift, [0.12, 0.4], [0, 1], Extrapolation.CLAMP),
      transform: [
        { translateY: -peel.rise * cardHeight * PEEL_RISE },
        { rotateX: `${peel.rotateX}deg` },
        { rotateY: `${peel.rotateY}deg` },
      ],
    };
  });

  return (
    <Animated.View
      style={[{ width: cardWidth, height: cardHeight, transformOrigin: '50% 100%' }, travelStyle]}>
      <Animated.View
        style={[
          styles.feltShadow,
          { width: cardWidth * 0.9, borderRadius: cardWidth * 0.16 },
          shadowStyle,
        ]}
      />
      {Array.from({ length: ROWS }, (_, row) =>
        Array.from({ length: COLS }, (_, col) => (
          <CardPatch
            key={`${col}-${row}`}
            col={col}
            row={row}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            patchWidth={patchWidth}
            patchHeight={patchHeight}
            peek={peek}
            muck={muck}
            throwDelay={throwDelay}
            reduced={reduced}
          />
        ))
      )}
      <Animated.View
        style={[
          styles.peekIndex,
          {
            width: flapWidth,
            height: flapHeight,
            paddingLeft: cardWidth * 0.06,
            paddingBottom: cardHeight * 0.03,
            borderBottomLeftRadius: cardWidth * 0.06,
            borderBottomRightRadius: cardWidth * 0.08,
            borderTopLeftRadius: cardWidth * 0.04,
          },
          peekIndexStyle,
        ]}>
        <PeekIndex card={card} width={flapWidth} height={flapHeight * 0.92} />
      </Animated.View>
    </Animated.View>
  );
}

type CardPatchProps = {
  col: number;
  row: number;
  cardWidth: number;
  cardHeight: number;
  patchWidth: number;
  patchHeight: number;
  peek: SharedValue<number>;
  muck: SharedValue<number>;
  throwDelay: number;
  reduced: boolean;
};

function CardPatch({
  col,
  row,
  cardWidth,
  cardHeight,
  patchWidth,
  patchHeight,
  peek,
  muck,
  throwDelay,
  reduced,
}: CardPatchProps) {
  const u = (col + 0.5) / COLS;
  const v = (row + 0.5) / ROWS;
  const left = col * (cardWidth / COLS) - (col === 0 ? 0 : OVERLAP);
  const top = row * (cardHeight / ROWS) - (row === 0 ? 0 : OVERLAP);
  const radius = cardWidth * 0.08;
  const isLeft = col === 0;
  const isRight = col === COLS - 1;
  const isTop = row === 0;
  const isBottom = row === ROWS - 1;

  const bendStyle = useAnimatedStyle(() => {
    const throwProgress = interpolate(
      muck.value,
      [throwDelay, 0.18 + throwDelay],
      [0, 1],
      Extrapolation.CLAMP
    );
    const lift = peek.value * (1 - throwProgress);
    const peel = reduced ? { rise: 0, rotateX: 0, rotateY: 0 } : cornerPeel(u, v, lift);

    return {
      transform: [
        { translateY: -peel.rise * cardHeight * PEEL_RISE },
        { rotateX: `${peel.rotateX}deg` },
        { rotateY: `${peel.rotateY}deg` },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.patch,
        {
          left,
          top,
          width: patchWidth,
          height: patchHeight,
          borderTopLeftRadius: isTop && isLeft ? radius : 0,
          borderTopRightRadius: isTop && isRight ? radius : 0,
          borderBottomLeftRadius: isBottom && isLeft ? radius : 0,
          borderBottomRightRadius: isBottom && isRight ? radius : 0,
          borderTopWidth: isTop ? 2 : 0,
          borderBottomWidth: isBottom ? 2 : 0,
          borderLeftWidth: isLeft ? 2 : 0,
          borderRightWidth: isRight ? 2 : 0,
          zIndex: row * COLS + col,
          transformOrigin: '50% 0%',
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
    left: '5%',
    bottom: -3,
    height: 8,
    backgroundColor: artStyle.colors.projectorBlack,
  },
  patch: {
    position: 'absolute',
    overflow: 'hidden',
    backgroundColor: artStyle.colors.oxblood,
    borderColor: artStyle.colors.projectorBlack,
  },
  peekIndex: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    zIndex: 80,
    overflow: 'visible',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    backgroundColor: artStyle.colors.cream,
    borderWidth: 2,
    borderColor: artStyle.colors.projectorBlack,
    transformOrigin: '100% 0%',
  },
});
