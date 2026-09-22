export type GestureTutorialAction =
  | 'peek'
  | 'fold'
  | 'check'
  | 'call'
  | 'raise'
  | 'turnDial'
  | 'lockIn';

export type GestureTutorialTarget =
  | 'felt'
  | 'cards'
  | 'stack'
  | 'dial'
  | 'lockIn'
  | 'foldButton'
  | 'callButton';

export type GestureTutorialHand =
  | 'peekDown'
  | 'foldUp'
  | 'doubleTap'
  | 'tapStack'
  | 'raiseUp'
  | 'turnDial'
  | 'tapPair';

export type GestureTutorialStep = {
  id: string;
  action: GestureTutorialAction;
  actions?: readonly GestureTutorialAction[];
  copy: string;
  hand: GestureTutorialHand;
  target: GestureTutorialTarget;
};

export type GestureTutorialConfig = {
  templateId: string;
  steps: readonly GestureTutorialStep[];
};
