import { StyleSheet, View } from 'react-native';

import { parseCard, type CardCode } from '@/lib/cards';

import { CARD_ASPECT, CardFace } from './PlayingCard';

type Point = { x: number; y: number };

type CommunityCardsProps = {
  cards: CardCode[];
  center: Point;
  maxWidth: number;
};

const GAP = 5;

export function CommunityCards({ cards, center, maxWidth }: CommunityCardsProps) {
  if (cards.length === 0) {
    return null;
  }

  const cardWidth = Math.min(52, (maxWidth - GAP * (cards.length - 1)) / cards.length);
  const rowWidth = cards.length * cardWidth + (cards.length - 1) * GAP;
  const cardHeight = cardWidth * CARD_ASPECT;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.row,
        {
          left: center.x - rowWidth / 2,
          top: center.y - cardHeight / 2,
          width: rowWidth,
          columnGap: GAP,
        },
      ]}>
      {cards.map((code) => (
        <CardFace key={code} card={parseCard(code)} width={cardWidth} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
  },
});
