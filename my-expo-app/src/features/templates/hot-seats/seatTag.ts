import type { HeroPosition, SpotDecision } from '../peek-and-pitch/types';
import type { HotSeatStreet } from './types';

const POSITION_SHORT: Record<string, string> = {
  UTG: 'UTG',
  'under the gun': 'UTG',
  MP: 'MP',
  'middle position': 'MP',
  HJ: 'HJ',
  hijack: 'HJ',
  CO: 'CO',
  cutoff: 'CO',
  BTN: 'BTN',
  button: 'BTN',
  SB: 'SB',
  'small blind': 'SB',
  BB: 'BB',
  'big blind': 'BB',
};

export type StackTier = 'small' | 'medium' | 'large';

export function positionShort(position: string): string {
  return POSITION_SHORT[position] ?? POSITION_SHORT[position.toLowerCase()] ?? position;
}

export function formatSeatAction(
  position: string,
  action: SpotDecision,
  raiseSize: number | null,
  facingRaise: boolean,
  street: HotSeatStreet
): string {
  const who = positionShort(position);
  if (action === 'raise') {
    const size = raiseSize == null ? '' : ` ${raiseSize}BB`;
    return `${who} raised${size}`;
  }
  if (action === 'fold') return `${who} folded`;
  if (action === 'call') return street === 'preflop' && !facingRaise ? `${who} limped` : `${who} called`;
  return `${who} checked`;
}

export type SeatTagTone = 'idle' | 'fold' | 'call' | 'raise';

/** Fold reads red, call reads teal, raise reads gold. Check and a waiting seat stay white and grey. */
export function seatTagTone(action: SpotDecision | null): SeatTagTone {
  if (action === 'fold' || action === 'call' || action === 'raise') return action;
  return 'idle';
}

export function seatTagLines(input: {
  seatIndex: number;
  position: string | HeroPosition;
  stack: number;
  action: SpotDecision | null;
  raiseSize: number | null;
  facingRaise: boolean;
  street: HotSeatStreet;
}): { title: string; detail: string; actionLabel: string | null; stackLabel: string; tone: SeatTagTone } {
  const title = positionShort(String(input.position));
  const stackLabel = `${input.stack} BB`;
  const tone = seatTagTone(input.action);
  if (!input.action) return { title, detail: stackLabel, actionLabel: null, stackLabel, tone };
  const actionLabel = formatSeatAction(
    title,
    input.action,
    input.raiseSize,
    input.facingRaise,
    input.street
  );
  return {
    title,
    detail: stackLabel,
    actionLabel,
    stackLabel,
    tone,
  };
}

export function stackTier(stackBb: number): StackTier {
  if (stackBb < 30) return 'small';
  if (stackBb < 70) return 'medium';
  return 'large';
}
