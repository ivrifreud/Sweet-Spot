export type ChipCount = 0 | 1 | 2 | 3;
export type StagePokerAction = 'fold' | 'call' | 'raise';
export type StageStatus = 'in_progress' | 'completed' | 'locked_out';

export type ChipStackState = {
  chips: ChipCount;
  lockedOut: boolean;
  regenAt: string | null;
};

export type StageAnswerResult = ChipStackState & {
  isCorrect: boolean;
  stageStatus: StageStatus;
  alreadySubmitted: boolean;
};

export type StoredChipStack = {
  chips: ChipCount;
  lastBurnedAt: string | null;
};
