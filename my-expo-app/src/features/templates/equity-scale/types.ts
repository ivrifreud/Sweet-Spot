import type { CardCode, HoleCardCodes } from '@/lib/cards';

import type { DecisionOutcome } from '../../decision-feedback/types';
import type { HeroPosition, TableSkin } from '../peek-and-pitch/types';

export type EquityDecision = 'fold' | 'call';
export type EquityStreet = 'flop' | 'turn';

export type EquityScaleSpot = {
  id: string;
  templateId: 2;
  pillar: 2;
  skin: TableSkin;
  heroCards: HoleCardCodes;
  board: CardCode[];
  position: HeroPosition;
  actionLine: string;
  street: EquityStreet;
  /** Chips already in the middle, including the wager the hero is facing. */
  potBeforeCall: number;
  priceToCall: number;
  correctOuts: number;
  correctDecision: EquityDecision;
  takeaway: string;
  progressLabel?: string;
};

export type EquityScalePhase =
  'entering' | 'dialing' | 'deciding' | 'submitting' | DecisionOutcome | 'resolved';

export type EquityScaleSubmission = {
  decision: EquityDecision;
  selectedOuts: number;
};
