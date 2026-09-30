import { parseCard, type CardCode } from '../../../lib/cards';

import type { HotSeat, HotSeatStory, StoryIssue, StoryValidation } from './types';

const STREETS = ['preflop', 'flop', 'turn', 'river'] as const;
const SKINS = ['garden', 'casino'] as const;
const ACTIONS = ['fold', 'check', 'call', 'raise'] as const;
const BOARD_LENGTH = { preflop: 0, flop: 3, turn: 4, river: 5 } as const;

export type { HotSeat, HotSeatStory, StoryIssue, StoryValidation } from './types';

export function validateStory(input: unknown): StoryValidation {
  const issues = new Set<StoryIssue>();
  if (!isRecord(input)) return { ok: false, issues: ['invalid-story'] };

  const seats = Array.isArray(input.seats) ? input.seats : [];
  if (seats.length !== 4) issues.add('seat-count');

  const street = input.street;
  if (!isStreet(street)) {
    issues.add('board-count');
  } else if (!Array.isArray(input.communityCards) || input.communityCards.length !== BOARD_LENGTH[street]) {
    issues.add('board-count');
  }

  if (!isSkin(input.skin) || !isPositive(input.pot) && input.pot !== 0) issues.add('invalid-story');
  if (!isRecord(input.blinds) || !isPositive(input.blinds.sb) || !isPositive(input.blinds.bb)) {
    issues.add('invalid-story');
  }
  if (!isNonEmpty(input.id) || !isNonEmpty(input.stageTakeaway)) issues.add('empty-copy');

  const parsedSeats: HotSeat[] = [];
  const positions = new Set<string>();
  const cards = new Set<string>();

  seats.forEach((raw, index) => {
    if (!isRecord(raw)) {
      issues.add('invalid-story');
      return;
    }
    const position = typeof raw.position === 'string' ? raw.position : '';
    if (positions.has(position)) issues.add('duplicate-position');
    positions.add(position);

    if (!isNonEmpty(raw.explanation) || !isNonEmpty(raw.priorAction)) issues.add('empty-copy');
    if (!isPositive(raw.stack)) issues.add('invalid-story');

    const holeCards = Array.isArray(raw.holeCards) ? raw.holeCards : [];
    const seatCards = [...holeCards, ...(index === 0 && Array.isArray(input.communityCards) ? input.communityCards : [])];
    if (index === 0 && Array.isArray(input.communityCards)) {
      input.communityCards.forEach((code) => rememberCard(code, cards, issues));
    }
    holeCards.forEach((code) => rememberCard(code, cards, issues));

    const frequencies = raw.frequencies;
    const scripted = raw.scriptedAction;
    const legal = Array.isArray(raw.legalActions) ? raw.legalActions.filter(isAction) : [];
    if (!isAction(scripted) || !isFrequencies(frequencies)) {
      issues.add('frequency-total');
    } else {
      const total = ACTIONS.reduce((sum, action) => sum + frequencies[action], 0);
      if (total !== 100) issues.add('frequency-total');
      const winner = highestAction(frequencies);
      if (winner === 'tie') issues.add('frequency-tie');
      else if (winner !== scripted) issues.add('frequency-mismatch');
      if (!legal.includes(scripted)) issues.add('illegal-script');
    }

    const facing = isStreet(street) && isAction(scripted) ? facesBet(street, seats, index) : false;
    if (facing && (scripted === 'check' || legal.includes('check'))) issues.add('check-facing-bet');

    const raiseSize = raw.raiseSize;
    if (scripted === 'raise') {
      if (!isPositive(raiseSize)) issues.add('raise-size');
    } else if (raiseSize !== null) {
      issues.add('raise-size');
    }

    if (issues.size === 0 && isAction(scripted) && isFrequencies(frequencies)) {
      parsedSeats.push(raw as HotSeat);
    }
    void seatCards;
  });

  if (issues.size > 0) return { ok: false, issues: [...issues] };
  return { ok: true, story: input as HotSeatStory };
}

function facesBet(street: HotSeatStory['street'], seats: unknown[], index: number): boolean {
  const raised = seats.slice(0, index).some((seat) => isRecord(seat) && seat.scriptedAction === 'raise');
  if (raised) return true;
  if (street === 'preflop') {
    const seat = seats[index];
    return !isRecord(seat) || seat.position !== 'BB';
  }
  return false;
}

function highestAction(frequencies: Record<(typeof ACTIONS)[number], number>): (typeof ACTIONS)[number] | 'tie' {
  let best = -1;
  let winner: (typeof ACTIONS)[number] | 'tie' = 'fold';
  ACTIONS.forEach((action) => {
    const value = frequencies[action];
    if (value > best) {
      best = value;
      winner = action;
    } else if (value === best) {
      winner = 'tie';
    }
  });
  return winner;
}

function rememberCard(code: unknown, seen: Set<string>, issues: Set<StoryIssue>) {
  if (typeof code !== 'string') {
    issues.add('invalid-card');
    return;
  }
  try {
    parseCard(code);
  } catch {
    issues.add('invalid-card');
    return;
  }
  if (seen.has(code)) issues.add('duplicate-card');
  seen.add(code);
}

function isFrequencies(value: unknown): value is Record<(typeof ACTIONS)[number], number> {
  if (!isRecord(value)) return false;
  return ACTIONS.every((action) => typeof value[action] === 'number' && Number.isFinite(value[action]) && value[action] >= 0);
}

function isAction(value: unknown): value is (typeof ACTIONS)[number] {
  return typeof value === 'string' && (ACTIONS as readonly string[]).includes(value);
}

function isStreet(value: unknown): value is (typeof STREETS)[number] {
  return typeof value === 'string' && (STREETS as readonly string[]).includes(value);
}

function isSkin(value: unknown): value is (typeof SKINS)[number] {
  return value === 'garden' || value === 'casino';
}

function isPositive(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function isNonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isCardCode(value: string): value is CardCode {
  try {
    parseCard(value);
    return true;
  } catch {
    return false;
  }
}
