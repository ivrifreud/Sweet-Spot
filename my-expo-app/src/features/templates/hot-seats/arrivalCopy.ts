import type { HeroPosition } from '../peek-and-pitch/types';

import type { HotSeat } from './types';

const POSITION_NAME: Record<HeroPosition, string> = {
  UTG: 'under the gun',
  MP: 'middle position',
  HJ: 'hijack',
  CO: 'cutoff',
  BTN: 'button',
  SB: 'small blind',
  BB: 'big blind',
};

export function positionName(position: HeroPosition): string {
  return POSITION_NAME[position];
}

/** Four facts, in order: position, stack, prior action, and the next-to-act line. */
export function buildArrivalCopy(seat: HotSeat): string {
  const prior = seat.priorAction.trim().replace(/\.+$/, '');
  return `You are the ${positionName(seat.position)}. You have ${seat.stack}bb. ${prior}. You are next to act.`;
}
