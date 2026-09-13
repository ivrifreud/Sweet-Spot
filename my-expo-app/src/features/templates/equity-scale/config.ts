import type { EquityScaleSpot } from './types';

export const EQUITY_OUTS_MIN = 0;
export const EQUITY_OUTS_MAX = 20;
export const EQUITY_INITIAL_OUTS = 8;
export const OUTCOME_ANIMATION_MS = 1650;
export const REDUCED_OUTCOME_MS = 420;

export const DEFAULT_EQUITY_SPOT: EquityScaleSpot = {
  id: 'equity-preview',
  templateId: 2,
  pillar: 2,
  skin: 'garden',
  heroCards: ['Ah', '5h'],
  board: ['Kh', '9h', '2c', '7d'],
  position: 'BTN',
  actionLine: 'BB bets 4bb',
  street: 'turn',
  potBeforeCall: 20,
  priceToCall: 4,
  correctOuts: 9,
  correctDecision: 'call',
  takeaway: 'Nine hearts give about 20% equity. You only need 17%, so calling earns chips.',
  progressLabel: 'Demo · 1 / 5',
};
