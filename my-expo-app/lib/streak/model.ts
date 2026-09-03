import type { StreakState } from './types';

type StreakPayload = {
  current_streak: unknown;
  best_streak: unknown;
  last_active_day: unknown;
};

function parseStreakCount(value: unknown, field: string): number {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return Math.trunc(value);
  }
  if (typeof value === 'string' && /^\d+$/.test(value)) {
    return Number(value);
  }
  throw new Error(`Invalid ${field} returned by the server`);
}

function parseNullableDay(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  throw new Error('Invalid last active day returned by the server');
}

export function mapStreakPayload(payload: StreakPayload): StreakState {
  return {
    currentStreak: parseStreakCount(payload.current_streak, 'current streak'),
    bestStreak: parseStreakCount(payload.best_streak, 'best streak'),
    lastActiveDay: parseNullableDay(payload.last_active_day),
  };
}

