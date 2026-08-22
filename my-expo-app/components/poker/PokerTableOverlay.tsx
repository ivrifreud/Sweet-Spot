import { StyleSheet, View } from 'react-native';

import { ChipStack } from './ChipStack';
import { PlayingCard } from './PlayingCard';
import type { PokerTableState } from './types';

type Props = PokerTableState;

export function PokerTableOverlay({ holeCards, board, chipCount, chipSide = 'right' }: Props) {
  if (board.length > 5) {
    throw new Error('A poker board cannot contain more than five cards.');
  }

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View style={styles.board}>
        {board.map((card, index) => (
          <PlayingCard key={`${card.rank}-${card.suit}-${index}`} card={card} />
        ))}
      </View>

      <View style={styles.holeCards}>
        <PlayingCard card={holeCards[0]} size="hole" rotation={-8} />
        <View style={styles.secondHoleCard}>
          <PlayingCard card={holeCards[1]} size="hole" rotation={8} />
        </View>
      </View>

      <View style={[styles.chips, chipSide === 'left' ? styles.chipsLeft : styles.chipsRight]}>
        <ChipStack count={chipCount} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    position: 'absolute',
    top: '48%',
    left: 0,
    right: 0,
    minHeight: 68,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  holeCards: {
    position: 'absolute',
    top: '67%',
    left: 0,
    right: 0,
    height: 106,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  secondHoleCard: {
    marginLeft: -12,
  },
  chips: {
    position: 'absolute',
    top: '66%',
  },
  chipsLeft: {
    left: 12,
  },
  chipsRight: {
    right: 12,
  },
});
