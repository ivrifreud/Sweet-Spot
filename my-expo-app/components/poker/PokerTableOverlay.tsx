import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { ChipStack } from './ChipStack';
import { PlayingCard } from './PlayingCard';
import type { PokerTableState } from './types';

type Props = PokerTableState;

const BACKGROUND_WIDTH = 1024;
const BACKGROUND_HEIGHT = 1536;

export function PokerTableOverlay({ holeCards, board, chipCount, chipSide = 'right' }: Props) {
  const [canvas, setCanvas] = useState({ width: 0, height: 0 });

  if (board.length > 5) {
    throw new Error('A poker board cannot contain more than five cards.');
  }

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setCanvas({ width, height });
  };

  const coverScale = Math.max(canvas.width / BACKGROUND_WIDTH, canvas.height / BACKGROUND_HEIGHT);
  const renderedHeight = BACKGROUND_HEIGHT * coverScale;
  const verticalCrop = (canvas.height - renderedHeight) / 2;
  const artworkY = (normalizedY: number) => verticalCrop + renderedHeight * normalizedY;

  return (
    <View onLayout={onLayout} pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View style={[styles.board, { top: artworkY(0.53), width: canvas.width }]}>
        {board.map((card, index) => (
          <PlayingCard key={`${card.rank}-${card.suit}-${index}`} card={card} />
        ))}
      </View>

      <View style={[styles.holeCards, { top: artworkY(0.7), width: canvas.width }]}>
        <PlayingCard card={holeCards[0]} size="hole" rotation={-8} />
        <View style={styles.secondHoleCard}>
          <PlayingCard card={holeCards[1]} size="hole" rotation={8} />
        </View>
      </View>

      <View
        style={[
          styles.chips,
          { top: artworkY(0.67) },
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
