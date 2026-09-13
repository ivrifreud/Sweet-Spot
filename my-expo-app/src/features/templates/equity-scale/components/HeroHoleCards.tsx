import { StyleSheet, View } from 'react-native';

import { describeHoleCards, parseCard, type HoleCardCodes } from '@/lib/cards';

import { artStyle } from '../../../../../theme/artStyle';
import { CardFace } from '../../peek-and-pitch/components/PlayingCard';

type Props = {
  cards: HoleCardCodes;
  bottom: number;
};

const CARD_WIDTH = 46;

/** Hero hole cards sit under the Fold button in the lower-right. */
export function HeroHoleCards({ cards, bottom }: Props) {
  const parsed = [parseCard(cards[0]), parseCard(cards[1])] as const;

  return (
    <View
      pointerEvents="none"
      accessibilityRole="text"
      accessibilityLabel={`Your hand, ${describeHoleCards(parsed)}`}
      style={[styles.root, { bottom }]}>
      {parsed.map((card, index) => (
        <View
          key={`${card.rank}${card.suit}-${index}`}
          style={[
            styles.card,
            {
              marginLeft: index === 0 ? 0 : -16,
              transform: [{ rotate: index === 0 ? '-8deg' : '9deg' }],
              zIndex: index + 1,
            },
          ]}>
          <CardFace card={card} width={CARD_WIDTH} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    right: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    zIndex: 48,
  },
  card: {
    shadowColor: artStyle.colors.projectorBlack,
    shadowOpacity: 0.45,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
});
