import { StyleSheet, View } from 'react-native';

import { layoutCommunityBoard } from '../../../../../lib/peek-and-pitch/communityBoardLayout';
import { parseCard, type CardCode } from '@/lib/cards';

import { CardFace } from './PlayingCard';

type CommunityCardsProps = {
  cards: CardCode[];
  viewportWidth: number;
  maxWidth: number;
  farY: number;
  nearY: number;
};

export function CommunityCards({
  cards,
  viewportWidth,
  maxWidth,
  farY,
  nearY,
}: CommunityCardsProps) {
  if (cards.length === 0) {
    return null;
  }

  const board = layoutCommunityBoard({
    cardCount: cards.length,
    viewportWidth,
    maxWidth,
    farY,
    nearY,
  });

  return (
    <View
      pointerEvents="none"
      style={[
        styles.row,
        {
          left: board.left,
          top: board.top,
          width: board.width,
          height: board.height,
          columnGap: board.gap,
        },
      ]}>
      {cards.map((code) => (
        <CardFace
          key={code}
          card={parseCard(code)}
          width={board.cardWidth}
          rotate={board.rotateZ}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    position: 'absolute',
    zIndex: 12,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'visible',
  },
});
