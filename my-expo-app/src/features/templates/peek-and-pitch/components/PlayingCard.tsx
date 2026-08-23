import { StyleSheet, Text, View } from 'react-native';

import { SUIT_COLOR, SUIT_GLYPH, type Card } from '@/lib/cards';

export const CARD_ASPECT = 1.42;

type CardFaceProps = {
  card: Card;
  width: number;
};

/** The white face of a card. Drawn in code so any rank/suit can be swapped in at runtime. */
export function CardFace({ card, width }: CardFaceProps) {
  const color = SUIT_COLOR[card.suit];
  const glyph = SUIT_GLYPH[card.suit];

  return (
    <View style={[styles.face, { width, height: width * CARD_ASPECT }]}>
      <View style={styles.index}>
        <Text style={[styles.rank, { fontSize: width * 0.42, color }]}>{card.rank}</Text>
        <Text style={[styles.suit, { fontSize: width * 0.3, color }]}>{glyph}</Text>
      </View>
      <Text style={[styles.centerSuit, { fontSize: width * 0.62, color }]}>{glyph}</Text>
      <View style={styles.indexFlipped}>
        <Text style={[styles.rank, { fontSize: width * 0.42, color }]}>{card.rank}</Text>
        <Text style={[styles.suit, { fontSize: width * 0.3, color }]}>{glyph}</Text>
      </View>
    </View>
  );
}

/**
 * Rank + suit sized to fit inside a peek flap of `height`.
 * The previous overlay used a rank font larger than the flap, so the ace clipped away
 * and only the suit showed.
 */
export function PeekIndex({
  card,
  width,
  height,
}: CardFaceProps & { height: number }) {
  const color = SUIT_COLOR[card.suit];
  const rank = card.rank === 'T' ? '10' : card.rank;
  const rankSize = Math.min(width * 0.5, height * 0.46);
  const suitSize = Math.min(width * 0.38, height * 0.34);

  return (
    <View style={styles.indexOnly}>
      <Text
        style={[styles.rank, { fontSize: rankSize, lineHeight: rankSize * 1.05, color }]}
        numberOfLines={1}>
        {rank}
      </Text>
      <Text
        style={[styles.suit, { fontSize: suitSize, lineHeight: suitSize * 1.08, color }]}
        numberOfLines={1}>
        {SUIT_GLYPH[card.suit]}
      </Text>
    </View>
  );
}

type CardBackProps = {
  width: number;
};

/** Face-down card: simple back so the phone does not draw 50 extra views. */
export function CardBack({ width }: CardBackProps) {
  const height = width * CARD_ASPECT;

  return (
    <View style={[styles.back, { width, height }]}>
      <View style={styles.backInner} />
    </View>
  );
}

const styles = StyleSheet.create({
  face: {
    backgroundColor: '#E8D7A7',
    borderRadius: 8,
    borderWidth: 2.5,
    borderColor: '#111714',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  index: {
    position: 'absolute',
    top: 4,
    left: 6,
    alignItems: 'center',
  },
  indexFlipped: {
    position: 'absolute',
    bottom: 4,
    right: 6,
    alignItems: 'center',
    transform: [{ rotate: '180deg' }],
  },
  indexOnly: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
  },
  rank: {
    fontWeight: '800',
    includeFontPadding: false,
  },
  suit: {
    marginTop: -4,
    includeFontPadding: false,
  },
  centerSuit: {
    opacity: 0.9,
  },
  back: {
    backgroundColor: '#A43E32',
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#111714',
    overflow: 'hidden',
    padding: 3,
  },
  backInner: {
    flex: 1,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(232,215,167,0.45)',
    backgroundColor: '#8c342a',
  },
});
