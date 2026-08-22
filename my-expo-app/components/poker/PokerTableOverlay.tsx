import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { ChipStack } from './ChipStack';
import { PlayingCard } from './PlayingCard';
import type { PokerTableState } from './types';

type Props = PokerTableState;

export function PokerTableOverlay({ holeCards, board, chipCount, chipSide = 'right' }: Props) {
  const [canvas, setCanvas] = useState({ width: 0, height: 0 });

  if (board.length > 5) {
    throw new Error('A poker board cannot contain more than five cards.');
  }

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setCanvas({ width, height });
  };

  return (
    <View onLayout={onLayout} pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View style={[styles.board, { top: canvas.height * 0.48, width: canvas.width }]}>
        {board.map((card, index) => (
          <PlayingCard key={`${card.rank}-${card.suit}-${index}`} card={card} />
        ))}
      </View>

      <View style={[styles.holeCards, { top: canvas.height * 0.68, width: canvas.width }]}>
        <PlayingCard card={holeCards[0]} size="hole" rotation={-8} />
        <View style={styles.secondHoleCard}>
          <PlayingCard card={holeCards[1]} size="hole" rotation={8} />
        </View>
      </View>

      <View
        style={[
          styles.chips,
          { top: canvas.height * 0.66 },
          chipSide === 'left' ? styles.chipsLeft : styles.chipsRight,
        ]}>
        <ChipStack count={chipCount} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    position: 'absolute',
    left: 0,
    minHeight: 68,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  holeCards: {
    position: 'absolute',
    left: 0,
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
  },
  chipsLeft: {
    left: 12,
  },
  chipsRight: {
    right: 12,
  },
});
