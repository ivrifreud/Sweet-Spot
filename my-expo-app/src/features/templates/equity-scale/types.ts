import type { CardCode, HoleCardCodes } from '@/lib/cards';

import type { DecisionOutcome } from '../../decision-feedback/types';
import type { HeroPosition } from '../peek-and-pitch/types';

export type EquityDecision = 'fold' | 'call';
export type EquityStreet = 'flop' | 'turn';
export type EquityWorldSkin = 'garden' | 'casino' | 'vip';

export type EquityScaleSpot = {
  id: string;
  templateId: 2;
  pillar: 2;
  skin: EquityWorldSkin;
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
  /** Short board-texture caption shown during the outs stage. */
  textureLine?: string;
  progressLabel?: string;
};

export type EquityScalePhase =
  | 'entering'
  | 'stage1'
  | 'stage2'
  | 'submitting'
  | 'revealing'
  | DecisionOutcome
  | 'resolved';

export type EquityScaleSubmission = {
  decision: EquityDecision;
  selectedOuts: number;
  selectedEquity: number;
};

export type EquityGrade = {
  outsCorrect: boolean;
  equityCorrect: boolean;
  decisionCorrect: boolean;
  stagesCorrect: 0 | 1 | 2 | 3;
  score: number;
  trueEquityPercent: number;
  potOddsPercent: number;
};

export type EquityReveal = {
  stagesCorrect: 0 | 1 | 2 | 3;
  decisionCorrect: boolean;
};
