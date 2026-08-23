export type CardSuit = 'clubs' | 'diamonds' | 'hearts' | 'spades';

export type CardRank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export type PlayingCardValue = {
  rank: CardRank;
  suit: CardSuit;
};

export type ChipStackSide = 'left' | 'right';

export type PokerTableState = {
  holeCards: [PlayingCardValue, PlayingCardValue];
  board: PlayingCardValue[];
  chipCount: number;
  chipSide?: ChipStackSide;
};

export type QuestionTemplateId = 1 | 2 | 3 | 4 | 5 | 6;
