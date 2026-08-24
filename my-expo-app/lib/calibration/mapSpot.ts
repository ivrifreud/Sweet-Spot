import type { CalibrationSpot, CalibrationSpotType, HeroPosition, PokerAction } from './types';

export type SpotRow = {
  id: string;
  spot_type: string;
  hole_cards: string[];
  board: string[] | null;
  pot_size: number | string | null;
  villain_action: string | null;
  prompt: string | null;
  hero_position: string | null;
  correct_answer: string;
  is_catastrophic_if_wrong: boolean;
  sequence_order: number;
};

const SPOT_TYPES: CalibrationSpotType[] = ['calibration_stage1', 'calibration_stage2'];
const POSITIONS: HeroPosition[] = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];
const ACTIONS: PokerAction[] = ['fold', 'call', 'raise'];

function asSpotType(value: string): CalibrationSpotType {
  if ((SPOT_TYPES as string[]).includes(value)) {
    return value as CalibrationSpotType;
  }
  throw new Error(`unsupported spot_type: ${value}`);
}

function asPosition(value: string | null): HeroPosition {
  if (value && (POSITIONS as string[]).includes(value)) {
    return value as HeroPosition;
  }
  throw new Error(`unsupported hero_position: ${value}`);
}

function asAction(value: string): PokerAction {
  if ((ACTIONS as string[]).includes(value)) {
    return value as PokerAction;
  }
  throw new Error(`unsupported correct_answer: ${value}`);
}

export function mapSpotRow(row: SpotRow): CalibrationSpot {
  if (row.hole_cards.length < 2) {
    throw new Error(`spot ${row.id} is missing hole_cards`);
  }

  const potSize =
    row.pot_size === null || row.pot_size === undefined ? null : Number(row.pot_size);

  return {
    id: row.id,
    spotType: asSpotType(row.spot_type),
    sequenceOrder: row.sequence_order,
    heroPosition: asPosition(row.hero_position),
    holeCards: [row.hole_cards[0], row.hole_cards[1]],
    board: row.board ?? [],
    potSize: Number.isFinite(potSize) ? potSize : null,
    villainAction: row.villain_action ?? '',
    prompt: row.prompt ?? '',
    correctAnswer: asAction(row.correct_answer),
    isCatastrophicIfWrong: row.is_catastrophic_if_wrong,
  };
}
