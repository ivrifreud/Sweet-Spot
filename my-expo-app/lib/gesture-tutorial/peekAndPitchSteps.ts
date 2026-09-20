import type { GestureTutorialConfig } from './types';

export const PEEK_AND_PITCH_TUTORIAL_ID = 'peek-and-pitch';

export const PEEK_AND_PITCH_TUTORIAL: GestureTutorialConfig = {
  templateId: PEEK_AND_PITCH_TUTORIAL_ID,
  steps: [
    {
      id: 'peek',
      action: 'peek',
      copy: 'Swipe down to peek.',
      hand: 'peekDown',
      target: 'cards',
    },
    {
      id: 'fold',
      action: 'fold',
      copy: 'Swipe up to fold.',
      hand: 'foldUp',
      target: 'cards',
    },
    {
      id: 'check',
      action: 'check',
      copy: 'Double-tap to check.',
      hand: 'doubleTap',
      target: 'felt',
    },
    {
      id: 'call',
      action: 'call',
      copy: 'Tap the chips to call.',
      hand: 'tapStack',
      target: 'stack',
    },
    {
      id: 'raise',
      action: 'raise',
      copy: 'Swipe the chips to the pot to raise.',
      hand: 'raiseUp',
      target: 'stack',
    },
  ],
};
