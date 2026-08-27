import { StyleSheet, View } from 'react-native';

import { parseCard, type CardCode } from '@/lib/cards';

import { poseOnFelt, type FeltPlaneConfig } from '../feltPlane';
import { CARD_ASPECT, CardFace } from './PlayingCard';

type Point = { x: number; y: number };

type CommunityCardsProps = {
  cards: CardCode[];
  center: Point;
  maxWidth: number;
  plane: FeltPlaneConfig;
  depth?: number;
};

const GAP = 8;

export function CommunityCards({
  cards,
  center,
  maxWidth,
  plane,
  depth = 0.52,
}: CommunityCardsProps) {
  if (cards.length === 0) {
    return null;
  }

  const cardWidth = Math.min(64, (maxWidth - GAP * (cards.length - 1)) / cards.length);
  const rowWidth = cards.length * cardWidth + (cards.length - 1) * GAP;
  const cardHeight = cardWidth * CARD_ASPECT;
  const pose = poseOnFelt(depth, plane);

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
          transform: [
            { perspective: plane.perspective },
            { rotateX: `${pose.rotateX}deg` },
            { scale: pose.scale },
          ],
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
