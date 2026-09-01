import type {
  ChipCount,
  ChipStackState,
  StageAnswerResult,
  StageStatus,
  StoredChipStack,
} from './types';

const REGENERATION_MS = 12 * 60 * 60 * 1000;

type ChipStackPayload = {
  chips: unknown;
  locked_out: unknown;
  regen_at: unknown;
};

type StageAnswerPayload = ChipStackPayload & {
  is_correct: unknown;
  stage_status: unknown;
  already_submitted: unknown;
  current_elo: unknown;
};

function parseChipCount(value: unknown): ChipCount {
  if (value === 0 || value === 1 || value === 2 || value === 3) return value;
  throw new Error('Invalid chip count returned by the server');
}

function parseBoolean(value: unknown, field: string): boolean {
  if (typeof value === 'boolean') return value;
  throw new Error(`Invalid ${field} returned by the server`);
}

function parseNullableTimestamp(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value === 'string' && Number.isFinite(Date.parse(value))) return value;
  throw new Error('Invalid regeneration timestamp returned by the server');
}

function parseStageStatus(value: unknown): StageStatus {
  if (value === 'in_progress' || value === 'completed' || value === 'locked_out') {
    return value;
  }
  throw new Error('Invalid stage status returned by the server');
}

function parseElo(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return Math.trunc(value);
  }
  if (typeof value === 'string' && /^\d+$/.test(value)) {
    return Number(value);
  }
  throw new Error('Invalid elo returned by the server');
}

export function effectiveChipStack(stored: StoredChipStack, now = new Date()): ChipStackState {
  if (stored.chips === 3 || stored.lastBurnedAt === null) {
    return { chips: stored.chips, lockedOut: stored.chips === 0, regenAt: null };
  }

  const lastBurnedAt = Date.parse(stored.lastBurnedAt);
  if (!Number.isFinite(lastBurnedAt)) {
    throw new Error('Invalid last burned timestamp');
  }

  const regenAt = new Date(lastBurnedAt + REGENERATION_MS);
  if (regenAt.getTime() <= now.getTime()) {
    return { chips: 3, lockedOut: false, regenAt: null };
  }

  return {
    chips: stored.chips,
    lockedOut: stored.chips === 0,
    regenAt: regenAt.toISOString(),
  };
}

export function mapChipStackPayload(payload: ChipStackPayload): ChipStackState {
  const chips = parseChipCount(payload.chips);
  const lockedOut = parseBoolean(payload.locked_out, 'lock state');

  if (lockedOut !== (chips === 0)) {
    throw new Error('Inconsistent chip stack returned by the server');
  }

  return {
    chips,
    lockedOut,
    regenAt: parseNullableTimestamp(payload.regen_at),
  };
}

export function mapStageAnswerPayload(payload: StageAnswerPayload): StageAnswerResult {
  return {
    ...mapChipStackPayload(payload),
    isCorrect: parseBoolean(payload.is_correct, 'answer result'),
    stageStatus: parseStageStatus(payload.stage_status),
    alreadySubmitted: parseBoolean(payload.already_submitted, 'submission state'),
    currentElo: parseElo(payload.current_elo),
  };
}
