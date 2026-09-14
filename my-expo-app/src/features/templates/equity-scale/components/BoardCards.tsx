import { StyleSheet, Text, View } from 'react-native';

import { parseCard, type CardCode } from '@/lib/cards';

import { artStyle } from '../../../../../theme/artStyle';
import { CardFace } from '../../peek-and-pitch/components/PlayingCard';

type Props = {
  board: CardCode[];
  textureLine?: string;
  cardWidth?: number;
  gap?: number;
};

const CARD_WIDTH = 50;

export function BoardCards({ board, textureLine, cardWidth = CARD_WIDTH, gap = 5 }: Props) {
  const parsed = board.map((code) => parseCard(code));
  const label = parsed
    .map((card) => `${card.rank === 'T' ? '10' : card.rank}${card.suit}`)
    .join(' ');

  return (
    <View
      pointerEvents="none"
      accessibilityRole="text"
      accessibilityLabel={`Board ${label}${textureLine ? `. ${textureLine}` : ''}`}
      style={styles.root}>
      <View style={[styles.row, { gap }]}>
        {parsed.map((card, index) => (
          <View key={`${card.rank}${card.suit}-${index}`} style={styles.card}>
            <CardFace card={card} width={cardWidth} />
          </View>
        ))}
      </View>
      {textureLine ? <Text style={styles.texture}>{textureLine}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  card: {
    shadowColor: artStyle.colors.projectorBlack,
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  texture: {
    marginTop: 4,
    color: artStyle.colors.cream,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
});
