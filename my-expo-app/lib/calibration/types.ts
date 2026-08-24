export type PokerAction = 'fold' | 'call' | 'raise';

export type Placement = 1 | 2 | 3;

export type HeroPosition = 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';

export type CalibrationSpotType = 'calibration_stage1' | 'calibration_stage2';

export type CalibrationSpot = {
  id: string;
  spotType: CalibrationSpotType;
  sequenceOrder: number;
  heroPosition: HeroPosition;
  holeCards: [string, string];
  board: string[];
  potSize: number | null;
  villainAction: string;
  prompt: string;
  correctAnswer: PokerAction;
  isCatastrophicIfWrong: boolean;
};

export type SpotAnswer = {
  spotId: string;
  chosen: PokerAction;
};

export type Stage1Next = 'place_level_1' | 'stage_2';

export type Stage1Result = {
  catastrophicErrors: number;
  next: Stage1Next;
};

export type Stage2Result = {
  misses: number;
  placement: 2 | 3;
};

export type CalibrationRouteInput = {
  stage1: {
    spots: CalibrationSpot[];
    answers: SpotAnswer[];
  };
  stage2?: {
    spots: CalibrationSpot[];
    answers: SpotAnswer[];
  };
};

export type CalibrationRouteReason =
  | 'stage1_catastrophic'
  | 'stage2_full_pass'
  | 'stage2_miss';

export type CalibrationRouteResult = {
  placement: Placement;
  reason: CalibrationRouteReason;
  startingElo: number;
};
