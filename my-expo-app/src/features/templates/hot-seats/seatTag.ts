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

/** Words on the top banner. A long name is drawn smaller so it stays inside that banner. */
const POSITION_BANNER: Record<string, string> = {
  UTG: 'UTG',
  'under the gun': 'UTG',
  MP: 'middle',
  'middle position': 'middle',
  HJ: 'hijack',
  hijack: 'hijack',
  CO: 'cut off',
  cutoff: 'cut off',
  'cut off': 'cut off',
  BTN: 'button',
  button: 'button',
  SB: 'small blind',
  'small blind': 'small blind',
  BB: 'big blind',
  'big blind': 'big blind',
};

export type StackTier = 'small' | 'medium' | 'large';

export function positionShort(position: string): string {
  return POSITION_SHORT[position] ?? POSITION_SHORT[position.toLowerCase()] ?? position;
}

export function positionBanner(position: string): string {
  return POSITION_BANNER[position] ?? POSITION_BANNER[position.toLowerCase()] ?? position;
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

/** Fold reads red, call reads cyan, raise reads yellow. Check and a waiting seat stay on the natural plate. */
export function seatTagTone(action: SpotDecision | null): SeatTagTone {
  if (action === 'fold' || action === 'call' || action === 'raise') return action;
  return 'idle';
}

export type SeatTagCopy = {
  title: string;
  detail: string;
  actionLabel: string | null;
  stackLabel: string;
  tone: SeatTagTone;
  /** Seat name on the upper banner. */
  banner: string;
  /** Stack on the lower banner. Blank after a fold. */
  ribbon: string | null;
  /** Action between the banners. Empty until the seat acts. */
  center: string | null;
  spoken: string;
};

export function seatTagLines(input: {
  seatIndex: number;
  position: string | HeroPosition;
  stack: number;
  action: SpotDecision | null;
  raiseSize: number | null;
  facingRaise: boolean;
  street: HotSeatStreet;
}): SeatTagCopy {
  const title = positionShort(String(input.position));
  const banner = positionBanner(String(input.position));
  const stackLabel = `${input.stack}BB`;
  const tone = seatTagTone(input.action);
  if (!input.action) {
    return {
      title,
      detail: stackLabel,
      actionLabel: null,
      stackLabel,
      tone,
      banner,
      ribbon: stackLabel,
      center: null,
      spoken: `${banner}. ${stackLabel}`,
    };
  }
  const actionLabel = formatSeatAction(
    title,
    input.action,
    input.raiseSize,
    input.facingRaise,
    input.street
  );
  const action =
    input.action === 'fold'
      ? 'Folded'
      : input.action === 'raise'
        ? input.raiseSize == null
          ? 'Raised'
          : `Raised ${input.raiseSize} BB`
        : input.action === 'call'
          ? input.street === 'preflop' && !input.facingRaise
            ? 'Limped'
            : 'Called'
          : 'Checked';
  return {
    title,
    detail: stackLabel,
    actionLabel,
    stackLabel,
    tone,
    banner,
    ribbon: input.action === 'fold' ? null : stackLabel,
    center: action,
    spoken: input.action === 'fold' ? `${banner}. ${action}` : `${banner}. ${action}. ${stackLabel}`,
  };
}

export function stackTier(stackBb: number): StackTier {
  if (stackBb < 30) return 'small';
  if (stackBb < 70) return 'medium';
  return 'large';
}
