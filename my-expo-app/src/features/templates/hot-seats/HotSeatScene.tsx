import { Image, StyleSheet, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

import { parseCard, type CardCode } from '../../../lib/cards';
import { CardFace } from '../peek-and-pitch/components/PlayingCard';
import { HeroCardStack } from './HeroCardStack';
import type {
  HotSeatSceneLayout,
  SceneFrame,
  StackFrame,
} from './sceneLayout';
import { stackTier, type StackTier } from './seatTag';
import type { HotSeatSkin } from './types';

const TABLE_ART = {
  garden: require('../../../../assets/hot-seats/bennys-garden.png'),
  casino: require('../../../../assets/hot-seats/local-casino.jpg'),
} as const;

const STACK_ART = {
  small: require('../../../../assets/hot-seats/stack-small.png'),
  medium: require('../../../../assets/hot-seats/stack-medium.png'),
  large: require('../../../../assets/hot-seats/stack-large.png'),
} as const;

const FAMILY_POT = require('../../../../assets/hot-seats/family-pot.png');
const GARDEN_THUMB = require('../../../../assets/hot-seats/garden-thumb.png');

export type OpponentReadout = {
  slot: 'left' | 'far' | 'right';
  stack: number;
};

type HotSeatSceneProps = {
  skin: HotSeatSkin;
  layout: HotSeatSceneLayout;
  communityCards: CardCode[];
  holeCards: CardCode[];
  pot: number;
  heroStack: number;
  opponents: OpponentReadout[];
  holeFade: SharedValue<number>;
  showHoleCards?: boolean;
};

export function HotSeatScene({
  skin,
  layout,
  communityCards,
  holeCards,
  pot,
  heroStack,
  opponents,
  holeFade,
  showHoleCards = true,
}: HotSeatSceneProps) {
  const art = layout.art;
  const leftSlot = layout.holeSlots[0];
  const rightSlot = layout.holeSlots[1];
  const leftCard = holeCards[0];
  const rightCard = holeCards[1];
  const holes =
    leftSlot && rightSlot && leftCard && rightCard ? (
      <HeroCardStack
        cards={[leftCard, rightCard]}
        outerSlots={[leftSlot, rightSlot]}
        art={art}
        opacity={holeFade}
        skin={skin}
      />
    ) : null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={StyleSheet.absoluteFill}>
        <View style={[placed(art), styles.tablePlate]}>
          <Image
            accessibilityRole="image"
            accessibilityLabel={
              skin === 'garden' ? "Benny's Garden poker table" : 'A Local Casino poker table'
            }
            source={TABLE_ART[skin]}
            resizeMode="stretch"
            style={styles.plate}
          />
          {showHoleCards ? holes : null}
        </View>
        {showHoleCards ? (
          <Image
            accessibilityElementsHidden
            importantForAccessibility="no"
            source={GARDEN_THUMB}
            resizeMode="stretch"
            style={[placed(art), styles.heroThumb]}
          />
        ) : null}
        {opponents.map((seat) => (
          <ChipPile
            key={seat.slot}
            label={`Opponent stack, ${seat.stack} big blinds`}
            frame={layout.opponents[seat.slot]}
            tier={stackTier(seat.stack)}
          />
        ))}
        <View accessibilityLabel={`Pot, ${pot} big blinds`} style={[styles.pot, styles.aboveHand, placed(layout.pot)]}>
          <Image
            accessibilityElementsHidden
            importantForAccessibility="no"
            source={FAMILY_POT}
            resizeMode="contain"
            style={{ width: layout.pot.width, height: layout.pot.chipHeight }}
          />
        </View>
        <BoardCards cards={communityCards} layout={layout} />
        <ChipPile
          label={`Your stack, ${heroStack} big blinds`}
          frame={layout.heroStack}
          tier={stackTier(heroStack)}
        />
      </View>
    </View>
  );
}

function ChipPile({
  label,
  frame,
  tier,
}: {
  label: string;
  frame: StackFrame;
  tier: StackTier;
}) {
  return (
    <View accessibilityLabel={label} style={[styles.pile, styles.aboveHand, placed(frame)]}>
      <Image
        accessibilityElementsHidden
        importantForAccessibility="no"
        source={STACK_ART[tier]}
        resizeMode="contain"
        style={{ width: frame.width, height: frame.imageHeight }}
      />
    </View>
  );
}

function BoardCards({ cards, layout }: { cards: CardCode[]; layout: HotSeatSceneLayout }) {
  if (cards.length === 0) return null;
  const cardWidth = Math.min(
    layout.board.cardWidth,
    (layout.board.width - layout.board.gap * (cards.length - 1)) / cards.length
  );
  const rowWidth = cards.length * cardWidth + layout.board.gap * (cards.length - 1);
  const cardHeight = cardWidth * (190 / 140);

  return (
    <View
      accessibilityLabel={`Community cards, ${cards.join(', ')}`}
      style={[
        styles.board,
        styles.aboveHand,
        {
          left: layout.board.x + (layout.board.width - rowWidth) / 2,
          top: layout.board.y + (layout.board.height - cardHeight) / 2,
          width: rowWidth,
          height: cardHeight,
          gap: layout.board.gap,
        },
      ]}>
      {cards.map((code) => (
        <CardFace key={code} card={parseCard(code)} width={cardWidth} />
      ))}
    </View>
  );
}

function placed(frame: SceneFrame) {
  return {
    position: 'absolute' as const,
    left: frame.x,
    top: frame.y,
    width: frame.width,
    height: frame.height,
  };
}

const styles = StyleSheet.create({
  plate: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
  },
  tablePlate: {
    zIndex: 0,
  },
  heroThumb: {
    zIndex: 1,
  },
  aboveHand: {
    zIndex: 2,
  },
  board: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
  },
  pot: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pile: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'visible',
  },
});
