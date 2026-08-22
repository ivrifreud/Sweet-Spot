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
 * The corner index only — this is what is actually visible through the peel window
 * while the player lifts the card off the felt.
 */
export function CardIndex({ card, width }: CardFaceProps) {
  const color = SUIT_COLOR[card.suit];

  return (
    <View style={styles.indexOnly}>
      <Text style={[styles.rank, { fontSize: width * 0.5, color }]}>{card.rank}</Text>
      <Text style={[styles.suit, { fontSize: width * 0.4, color }]}>{SUIT_GLYPH[card.suit]}</Text>
    </View>
  );
}

type CardBackProps = {
  width: number;
};

/** Face-down card: red lattice back, the way it reads on the table art. */
export function CardBack({ width }: CardBackProps) {
  const height = width * CARD_ASPECT;

  return (
    <View style={[styles.back, { width, height }]}>
      <View style={styles.backInner}>
        {Array.from({ length: 7 }).map((_, row) => (
          <View key={row} style={styles.backRow}>
            {Array.from({ length: 4 }).map((__, col) => (
              <View key={col} style={styles.backDiamond} />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  face: {
    backgroundColor: '#f7f4ee',
    borderRadius: 8,
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
    alignItems: 'center',
  },
  rank: {
    fontWeight: '800',
    includeFontPadding: false,
  },
  suit: {
    marginTop: -2,
    includeFontPadding: false,
  },
  centerSuit: {
    opacity: 0.9,
  },
  back: {
    backgroundColor: '#8f1f24',
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#f4efe6',
    overflow: 'hidden',
    padding: 3,
  },
  backInner: {
    flex: 1,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: '#7d1a20',
    justifyContent: 'space-evenly',
    overflow: 'hidden',
  },
  backRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  backDiamond: {
    width: 6,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.22)',
    transform: [{ rotate: '45deg' }],
  },
});
