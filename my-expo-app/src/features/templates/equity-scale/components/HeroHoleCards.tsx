import { StyleSheet, Text, View } from 'react-native';

import { describeHoleCards, parseCard, type HoleCardCodes } from '@/lib/cards';

import { artStyle } from '../../../../../theme/artStyle';
import { CARD_ASPECT, CardFace } from '../../peek-and-pitch/components/PlayingCard';
import { CardFeltMat } from './CardFeltMat';

type Props = {
  cards: HoleCardCodes;
  cardWidth?: number;
};

const CARD_WIDTH = 56;

export function HeroHoleCards({ cards, cardWidth = CARD_WIDTH }: Props) {
  const parsed = [parseCard(cards[0]), parseCard(cards[1])] as const;
  const overlap = Math.round(cardWidth * 0.33);
  const cardHeight = cardWidth * CARD_ASPECT;

  return (
    <View
      pointerEvents="none"
      accessibilityRole="text"
      accessibilityLabel={`Your hand, ${describeHoleCards([parsed[0], parsed[1]])}`}
      style={styles.root}>
      <CardFeltMat variant="hero" contentWidth={cardWidth * 2 - overlap} contentHeight={cardHeight}>
        <View style={styles.row}>
          {parsed.map((card, index) => (
            <View
              key={`${card.rank}${card.suit}-${index}`}
              style={[
                styles.card,
                {
                  marginLeft: index === 0 ? 0 : -overlap,
                  transform: [{ rotate: index === 0 ? '-7deg' : '8deg' }],
                  zIndex: index + 1,
                },
              ]}>
              <CardFace card={card} width={cardWidth} />
            </View>
          ))}
        </View>
      </CardFeltMat>
      <Text style={styles.caption}>YOU</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flexGrow: 0,
    flexShrink: 0,
  },
  caption: {
    color: artStyle.colors.goldBright,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  card: {
    shadowColor: artStyle.colors.projectorBlack,
    shadowOpacity: 0.45,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
});
