import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import type { Card, HoleCards as HoleCardsTuple } from '@/lib/cards';

import { CARD_ASPECT, CardBack, CardIndex } from './PlayingCard';

type Point = { x: number; y: number };

type HoleCardsProps = {
  cards: HoleCardsTuple;
  /** 0 = flat on the felt, 1 = corner fully lifted and readable. */
  peek: SharedValue<number>;
  /** 0 = in front of the player, 1 = gone into the muck. */
  muck: SharedValue<number>;
  /** 0 = still in the dealer's hand, 1 = landed in front of the player. */
  deal: SharedValue<number>;
  /** Pulls the cards in behind the chips when the hand is played. */
  commit: SharedValue<number>;
  cardWidth: number;
  dealOrigin: Point;
  tableCenter: Point;
  restCenter: Point;
};

const FAN_ANGLE = 7;

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
  const gap = cardWidth * 0.14;

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
  dealOrigin: Point;
  tableCenter: Point;
  restCenter: Point;
};

function HoleCard({
  card,
  index,
  cardWidth,
  peek,
  muck,
  deal,
  commit,
  dealOrigin,
  tableCenter,
  restCenter,
}: HoleCardProps) {
  const cardHeight = cardWidth * CARD_ASPECT;
  const restRotation = index === 0 ? -FAN_ANGLE : FAN_ANGLE;
  const dealDelay = index * 0.18;
  const muckDelay = index * 0.1;

  const dealVector = {
    x: dealOrigin.x - restCenter.x,
    y: dealOrigin.y - restCenter.y,
  };
  const muckVector = {
    x: tableCenter.x - restCenter.x,
    y: tableCenter.y - restCenter.y,
  };

  const cardStyle = useAnimatedStyle(() => {
    const dealProgress = interpolate(
      deal.value,
      [dealDelay, 0.55 + dealDelay],
      [0, 1],
      Extrapolation.CLAMP
    );
    const muckProgress = interpolate(
      muck.value,
      [muckDelay, 0.85 + muckDelay],
      [0, 1],
      Extrapolation.CLAMP
    );
    const lift = peek.value * (1 - muckProgress);

    return {
      opacity: interpolate(muckProgress, [0, 0.72, 1], [1, 1, 0], Extrapolation.CLAMP),
      transform: [
        { perspective: 700 },
        {
          translateX:
            dealVector.x * (1 - dealProgress) +
            muckVector.x * muckProgress +
            (index === 0 ? -1 : 1) * lift * cardWidth * 0.06,
        },
        {
          translateY:
            dealVector.y * (1 - dealProgress) +
            (muckVector.y - cardHeight * 0.6) * muckProgress -
            lift * cardHeight * 0.1 +
            commit.value * cardHeight * 0.12,
        },
        {
          rotate: `${
            restRotation +
            (index === 0 ? -220 : 190) * (1 - dealProgress) +
            (index === 0 ? -140 : 160) * muckProgress
          }deg`,
        },
        { rotateX: `${-lift * 7}deg` },
        {
          scale:
            interpolate(dealProgress, [0, 1], [0.55, 1], Extrapolation.CLAMP) *
            (1 + lift * 0.07) *
            (1 - muckProgress * 0.45) *
            (1 + commit.value * 0.03),
        },
      ],
    };
  });

  const shadowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(peek.value, [0, 1], [0.18, 0.5], Extrapolation.CLAMP),
    transform: [{ translateY: peek.value * cardHeight * 0.06 }, { scaleX: 1 + peek.value * 0.08 }],
  }));

  return (
    <Animated.View style={[{ width: cardWidth, height: cardHeight }, cardStyle]}>
      <Animated.View
        style={[
          styles.groundShadow,
          { width: cardWidth * 0.94, borderRadius: cardWidth * 0.2 },
          shadowStyle,
        ]}
      />
      <CardBack width={cardWidth} />
      <PeelWindow card={card} cardWidth={cardWidth} peek={peek} muck={muck} />
    </Animated.View>
  );
}

type PeelWindowProps = {
  card: Card;
  cardWidth: number;
  peek: SharedValue<number>;
  muck: SharedValue<number>;
};

/**
 * The lifted corner of the card. The panel hinges on its right edge so the left side
 * bends up towards the camera, uncovering the rank/suit index printed underneath.
 */
function PeelWindow({ card, cardWidth, peek, muck }: PeelWindowProps) {
  const cardHeight = cardWidth * CARD_ASPECT;
  const windowWidth = cardWidth * 0.64;
  const windowHeight = cardHeight * 0.62;

  const panelStyle = useAnimatedStyle(() => {
    const lift = peek.value * (1 - muck.value);

    return {
      opacity: interpolate(lift, [0, 0.06, 0.2], [0, 0.35, 1], Extrapolation.CLAMP),
      transform: [
        { perspective: 420 },
        { translateX: -lift * cardWidth * 0.04 },
        { translateY: -lift * cardHeight * 0.02 },
        { rotateY: `${-lift * 34}deg` },
        { rotateZ: `${-lift * 4}deg` },
      ],
    };
  });

  const foldStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      peek.value * (1 - muck.value),
      [0, 0.3, 1],
      [0, 0.5, 1],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <>
      <Animated.View
        style={[
          styles.foldShadow,
          { left: windowWidth - 2, width: cardWidth * 0.3, height: windowHeight },
          foldStyle,
        ]}>
        <LinearGradient
          colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.peelPanel,
          {
            width: windowWidth,
            height: windowHeight,
            transformOrigin: '100% 50%',
            paddingLeft: cardWidth * 0.08,
          },
          panelStyle,
        ]}>
        <CardIndex card={card} width={cardWidth} />
        <LinearGradient
          colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0.16)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, styles.sheen]}
          pointerEvents="none"
        />
      </Animated.View>
    </>
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
  groundShadow: {
    position: 'absolute',
    left: '3%',
    bottom: -6,
    height: 14,
    backgroundColor: '#000',
  },
  peelPanel: {
    position: 'absolute',
    left: 0,
    top: 0,
    backgroundColor: '#f7f4ee',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 3,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
    justifyContent: 'center',
    alignItems: 'flex-start',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 8,
    shadowOffset: { width: -4, height: 4 },
    elevation: 8,
  },
  foldShadow: {
    position: 'absolute',
    top: 0,
    overflow: 'hidden',
  },
  sheen: {
    borderRadius: 6,
  },
});
