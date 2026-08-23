import type { PokerTableState, QuestionTemplateId } from './types';

export type QuestionTemplatePreview = {
  id: QuestionTemplateId;
  shortName: string;
  name: string;
  table: PokerTableState;
};

export const QUESTION_TEMPLATE_PREVIEWS: QuestionTemplatePreview[] = [
  {
    id: 1,
    shortName: 'Peek',
    name: 'Peek and Pitch',
    table: {
      holeCards: [
        { rank: 'A', suit: 'spades' },
        { rank: 'K', suit: 'hearts' },
      ],
      board: [],
      chipCount: 48,
      chipSide: 'right',
    },
  },
  {
    id: 2,
    shortName: 'Equity',
    name: 'Equity Scale',
    table: {
      holeCards: [
        { rank: '9', suit: 'hearts' },
        { rank: '8', suit: 'hearts' },
      ],
      board: [
        { rank: '10', suit: 'hearts' },
        { rank: '7', suit: 'clubs' },
        { rank: '2', suit: 'spades' },
      ],
      chipCount: 62,
      chipSide: 'left',
    },
  },
  {
    id: 3,
    shortName: 'Detect',
    name: 'Detective Board',
    table: {
      holeCards: [
        { rank: 'Q', suit: 'spades' },
        { rank: 'Q', suit: 'diamonds' },
      ],
      board: [
        { rank: 'K', suit: 'clubs' },
        { rank: '10', suit: 'diamonds' },
        { rank: '6', suit: 'spades' },
        { rank: '3', suit: 'hearts' },
        { rank: 'A', suit: 'clubs' },
      ],
      chipCount: 75,
      chipSide: 'right',
    },
  },
  {
    id: 4,
    shortName: 'Size',
    name: 'Sniper Slider',
    table: {
      holeCards: [
        { rank: 'A', suit: 'clubs' },
        { rank: 'J', suit: 'clubs' },
      ],
      board: [
        { rank: 'J', suit: 'diamonds' },
        { rank: '8', suit: 'spades' },
        { rank: '4', suit: 'clubs' },
        { rank: '2', suit: 'hearts' },
      ],
      chipCount: 96,
      chipSide: 'left',
    },
  },
  {
    id: 5,
    shortName: 'Target',
    name: 'Tag the Target',
    table: {
      holeCards: [
        { rank: '7', suit: 'spades' },
        { rank: '7', suit: 'hearts' },
      ],
      board: [
        { rank: 'K', suit: 'spades' },
        { rank: '9', suit: 'diamonds' },
        { rank: '5', suit: 'clubs' },
      ],
      chipCount: 38,
      chipSide: 'right',
    },
  },
  {
    id: 6,
    shortName: 'ICM',
    name: 'Pressure Radar',
    table: {
      holeCards: [
        { rank: '10', suit: 'spades' },
        { rank: '9', suit: 'spades' },
      ],
      board: [
        { rank: 'A', suit: 'diamonds' },
        { rank: 'Q', suit: 'clubs' },
        { rank: '6', suit: 'hearts' },
        { rank: '6', suit: 'clubs' },
        { rank: '2', suit: 'diamonds' },
      ],
      chipCount: 21,
      chipSide: 'left',
    },
  },
];
