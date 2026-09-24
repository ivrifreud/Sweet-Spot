import { formatRegenCountdown } from '../chip-stack/model';

export type RailChipState = {
  chips: number;
  regenAt: string | null;
  now?: Date;
};

export type RailTicket = {
  visible: boolean;
  label: string | null;
};

/** Ticket stub under the chip slot appears only at 0 Chips with a known regen time. */
export function railRegenTicket({ chips, regenAt, now = new Date() }: RailChipState): RailTicket {
  if (chips !== 0 || regenAt == null) {
    return { visible: false, label: null };
  }
  return {
    visible: true,
    label: `FULL IN ${formatRegenCountdown(regenAt, now).toUpperCase()}`,
  };
}

export function shouldRattleEmptyChips(chips: number): boolean {
  return chips === 0;
}
