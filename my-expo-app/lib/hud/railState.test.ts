import { describe, expect, it } from 'vitest';

import { railRegenTicket, shouldRattleEmptyChips } from './railState';

const REGEN_AT = '2026-08-25T18:00:00.000Z';
const NOW = new Date('2026-08-25T10:48:00.000Z');

describe('railRegenTicket', () => {
  it('hides the ticket when chips are full', () => {
    expect(railRegenTicket({ chips: 3, regenAt: null, now: NOW })).toEqual({
      visible: false,
      label: null,
    });
  });

  it('hides the ticket when chips are 1 or 2 even if regenAt is set', () => {
    expect(railRegenTicket({ chips: 2, regenAt: REGEN_AT, now: NOW })).toEqual({
      visible: false,
      label: null,
    });
    expect(railRegenTicket({ chips: 1, regenAt: REGEN_AT, now: NOW })).toEqual({
      visible: false,
      label: null,
    });
  });

  it('shows FULL IN countdown only at 0 chips', () => {
    expect(railRegenTicket({ chips: 0, regenAt: REGEN_AT, now: NOW })).toEqual({
      visible: true,
      label: 'FULL IN 7H 12M',
    });
  });

  it('hides the ticket at 0 chips when regenAt is missing', () => {
    expect(railRegenTicket({ chips: 0, regenAt: null, now: NOW })).toEqual({
      visible: false,
      label: null,
    });
  });
});

describe('shouldRattleEmptyChips', () => {
  it('rattles only when the tray is empty', () => {
    expect(shouldRattleEmptyChips(0)).toBe(true);
    expect(shouldRattleEmptyChips(1)).toBe(false);
    expect(shouldRattleEmptyChips(3)).toBe(false);
  });
});
