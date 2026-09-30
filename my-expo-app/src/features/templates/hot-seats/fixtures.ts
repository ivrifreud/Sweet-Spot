import type { SpotDecision } from '../peek-and-pitch/types';

import type { HotSeatStory } from './types';
import { validateStory } from './validateStory';

const PREFLOP_NOTE = 'PLACEHOLDER';

export const GARDEN_PREFLOP_STORY: HotSeatStory = {
  id: 'placeholder-hot-seats-garden-preflop',
  placeholder: true,
  skin: 'garden',
  street: 'preflop',
  blinds: { sb: 1, bb: 2 },
  pot: 3,
  communityCards: [],
  stageTakeaway: `${PREFLOP_NOTE}: early seats fold more of the same broadways than the button.`,
  seats: [
    {
      position: 'UTG',
      stack: 40,
      holeCards: ['As', 'Kd'],
      scriptedAction: 'fold',
      raiseSize: null,
      frequencies: { fold: 70, check: 0, call: 20, raise: 10 },
      legalActions: ['fold', 'call', 'raise'],
      explanation: `${PREFLOP_NOTE}: under the gun, ace-king offsuit still faces the whole table.`,
      priorAction: 'The action is on you.',
    },
    {
      position: 'HJ',
      stack: 38,
      holeCards: ['7c', '6c'],
      scriptedAction: 'fold',
      raiseSize: null,
      frequencies: { fold: 90, check: 0, call: 5, raise: 5 },
      legalActions: ['fold', 'call', 'raise'],
      explanation: `${PREFLOP_NOTE}: a suited connector is too weak after an early fold.`,
      priorAction: 'Under the gun folded.',
    },
    {
      position: 'CO',
      stack: 42,
      holeCards: ['Qs', 'Js'],
      scriptedAction: 'raise',
      raiseSize: 6,
      frequencies: { fold: 5, check: 0, call: 15, raise: 80 },
      legalActions: ['fold', 'call', 'raise'],
      explanation: `${PREFLOP_NOTE}: the cutoff can open queen-jack suited when the early seats fold.`,
      priorAction: 'Under the gun folded. The hijack folded.',
    },
    {
      position: 'BB',
      stack: 36,
      holeCards: ['Ad', 'Qd'],
      scriptedAction: 'call',
      raiseSize: null,
      frequencies: { fold: 5, check: 0, call: 75, raise: 20 },
      legalActions: ['fold', 'call', 'raise'],
      explanation: `${PREFLOP_NOTE}: the big blind calls a cutoff open with ace-queen suited.`,
      priorAction: 'The cutoff raised.',
    },
  ],
};

export const CASINO_FLOP_STORY: HotSeatStory = {
  id: 'placeholder-hot-seats-casino-flop',
  placeholder: true,
  skin: 'casino',
  street: 'flop',
  blinds: { sb: 1, bb: 2 },
  pot: 12,
  communityCards: ['Ah', 'Kd', '2c'],
  stageTakeaway: `${PREFLOP_NOTE}: on a dry flop, the blinds check and the cutoff is the one who bets.`,
  seats: [
    {
      position: 'SB',
      stack: 34,
      holeCards: ['9s', '8s'],
      scriptedAction: 'check',
      raiseSize: null,
      frequencies: { fold: 0, check: 85, call: 0, raise: 15 },
      legalActions: ['check', 'raise'],
      explanation: `${PREFLOP_NOTE}: the small blind checks a missed flop to the field.`,
      priorAction: 'The action is on you.',
    },
    {
      position: 'BB',
      stack: 33,
      holeCards: ['3h', '3d'],
      scriptedAction: 'check',
      raiseSize: null,
      frequencies: { fold: 0, check: 80, call: 0, raise: 20 },
      legalActions: ['check', 'raise'],
      explanation: `${PREFLOP_NOTE}: the big blind checks a small pair when nobody has bet.`,
      priorAction: 'The small blind checked.',
    },
    {
      position: 'CO',
      stack: 48,
      holeCards: ['Ac', 'Qc'],
      scriptedAction: 'raise',
      raiseSize: 8,
      frequencies: { fold: 0, check: 10, call: 0, raise: 90 },
      legalActions: ['check', 'raise'],
      explanation: `${PREFLOP_NOTE}: the cutoff bets top pair after both blinds check.`,
      priorAction: 'The blinds checked.',
    },
    {
      position: 'BTN',
      stack: 51,
      holeCards: ['Jd', 'Td'],
      scriptedAction: 'fold',
      raiseSize: null,
      frequencies: { fold: 65, check: 0, call: 25, raise: 10 },
      legalActions: ['fold', 'call', 'raise'],
      explanation: `${PREFLOP_NOTE}: the button folds a gutshot when the cutoff bets.`,
      priorAction: 'The cutoff raised.',
    },
  ],
};

export const HOT_SEAT_STORIES = [GARDEN_PREFLOP_STORY, CASINO_FLOP_STORY] as const;

HOT_SEAT_STORIES.forEach((story) => {
  const result = validateStory(story);
  if (!result.ok) {
    throw new Error(`Broken Hot Seats fixture ${story.id}: ${result.issues.join(', ')}`);
  }
});

export function scriptedAction(story: HotSeatStory, seatIndex: number): SpotDecision {
  return story.seats[seatIndex]!.scriptedAction;
}
