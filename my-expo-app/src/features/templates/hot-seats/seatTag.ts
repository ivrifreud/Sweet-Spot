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

export function seatTagLines(input: {
  seatIndex: number;
  position: string | HeroPosition;
  stack: number;
  action: SpotDecision | null;
  raiseSize: number | null;
  facingRaise: boolean;
  street: HotSeatStreet;
}): { title: string; detail: string; actionLabel: string | null; stackLabel: string } {
  const title = positionShort(String(input.position));
  const stackLabel = `${input.stack} BB`;
  if (!input.action) return { title, detail: stackLabel, actionLabel: null, stackLabel };
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
  };
}

export function stackTier(stackBb: number): StackTier {
  if (stackBb < 30) return 'small';
  if (stackBb < 70) return 'medium';
  return 'large';
}
