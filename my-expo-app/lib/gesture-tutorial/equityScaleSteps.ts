import type { GestureTutorialConfig } from './types';

export const EQUITY_SCALE_TUTORIAL_ID = 'equity-scale';

export const EQUITY_SCALE_TUTORIAL: GestureTutorialConfig = {
  templateId: EQUITY_SCALE_TUTORIAL_ID,
  steps: [
    {
      id: 'turn-outs',
      action: 'turnDial',
      copy: 'Turn the dial to set outs.',
      hand: 'turnDial',
      target: 'dial',
    },
    {
      id: 'lock-in',
      action: 'lockIn',
      copy: 'Tap Lock in.',
      hand: 'tapStack',
      target: 'lockIn',
    },
    {
      id: 'turn-equity',
      action: 'turnDial',
      copy: 'Turn the dial to set equity.',
      hand: 'turnDial',
      target: 'dial',
    },
    {
      id: 'decide',
      action: 'call',
      actions: ['fold', 'call'],
      copy: 'Tap Call or Fold.',
      hand: 'tapPair',
      target: 'foldButton',
    },
  ],
};
