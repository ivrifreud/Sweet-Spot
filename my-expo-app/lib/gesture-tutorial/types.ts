export type GestureTutorialAction = 'peek' | 'fold' | 'check' | 'call' | 'raise';

export type GestureTutorialTarget = 'felt' | 'cards' | 'stack';

export type GestureTutorialHand =
  | 'peekDown'
  | 'foldUp'
  | 'doubleTap'
  | 'tapStack'
  | 'raiseUp';

export type GestureTutorialStep = {
  id: string;
  action: GestureTutorialAction;
  copy: string;
  hand: GestureTutorialHand;
  target: GestureTutorialTarget;
};

export type GestureTutorialConfig = {
  templateId: string;
  steps: readonly GestureTutorialStep[];
};
