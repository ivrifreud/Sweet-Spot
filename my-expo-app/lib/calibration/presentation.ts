import { formatCard, parseCard, type CardCode } from '../../src/lib/cards';
import type {
  PeekAndPitchSpot,
  SpotDecision,
} from '../../src/features/templates/peek-and-pitch/types';
import type { CalibrationSpot, PokerAction } from './types';

function asCardCode(value: string): CardCode {
  return formatCard(parseCard(value));
}

export function canCheckSpot(spot: CalibrationSpot): boolean {
  return /\bchecks?\b/i.test(spot.villainAction);
}

export function toPeekAndPitchSpot(spot: CalibrationSpot, progressLabel: string): PeekAndPitchSpot {
  return {
    id: spot.id,
    skin: 'garden',
    heroCards: [asCardCode(spot.holeCards[0]), asCardCode(spot.holeCards[1])],
    board: spot.board.map(asCardCode),
    position: spot.heroPosition,
    actionLine: spot.villainAction,
    potLabel: spot.potSize == null ? '—' : `${spot.potSize}bb`,
    heroStackLabel: '100bb',
    prompt: spot.prompt,
    progressLabel,
    canCheck: canCheckSpot(spot),
  };
}

export function pokerActionForDecision(decision: SpotDecision, spot: CalibrationSpot): PokerAction {
  if (decision === 'check') {
    if (!canCheckSpot(spot)) {
      throw new Error('Check is not legal when facing a bet');
    }
    return 'call';
  }
  return decision;
}
