import { StyleSheet, Text, View } from 'react-native';

import type { PlayingCardValue } from './types';

type Props = {
  card: PlayingCardValue;
  size?: 'board' | 'hole';
  rotation?: number;
};

const SUIT_SYMBOLS: Record<PlayingCardValue['suit'], string> = {
  clubs: '♣',
  diamonds: '♦',
  hearts: '♥',
  spades: '♠',
};

export function PlayingCard({ card, size = 'board', rotation = 0 }: Props) {
  const isRed = card.suit === 'diamonds' || card.suit === 'hearts';
  const dimensions = size === 'hole' ? styles.holeCard : styles.boardCard;

  return (
    <View
      accessibilityLabel={`${card.rank} of ${card.suit}`}
      style={[styles.card, dimensions, { transform: [{ rotate: `${rotation}deg` }] }]}>
      <View style={styles.corner}>
        <Text style={[styles.rank, size === 'hole' && styles.holeRank, isRed && styles.red]}>
          {card.rank}
        </Text>
        <Text style={[styles.suit, size === 'hole' && styles.holeSuit, isRed && styles.red]}>
          {SUIT_SYMBOLS[card.suit]}
        </Text>
      </View>
      <Text
        style={[styles.centerSuit, size === 'hole' && styles.holeCenterSuit, isRed && styles.red]}>
        {SUIT_SYMBOLS[card.suit]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#E8D7A7',
    borderColor: '#171713',
    borderWidth: 2.5,
    borderRadius: 7,
    shadowColor: '#111714',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.38,
    shadowRadius: 3,
    elevation: 5,
    overflow: 'hidden',
  },
  boardCard: {
    width: 48,
    height: 68,
  },
  holeCard: {
    width: 66,
    height: 94,
  },
  corner: {
    position: 'absolute',
    top: 3,
    left: 5,
    alignItems: 'center',
  },
  rank: {
    color: '#171713',
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 15,
  },
  holeRank: {
    fontSize: 19,
    lineHeight: 20,
  },
  suit: {
    color: '#171713',
    fontSize: 12,
    lineHeight: 13,
  },
  holeSuit: {
    fontSize: 16,
    lineHeight: 17,
  },
  centerSuit: {
    position: 'absolute',
    alignSelf: 'center',
    top: 24,
    color: '#171713',
    fontSize: 25,
  },
  holeCenterSuit: {
    top: 34,
    fontSize: 35,
  },
  red: {
    color: '#A43E32',
  },
});
