import { describe, expect, it } from 'vitest';

import {
  cheeringSeekSeconds,
  finaleCue,
  resultClipKind,
  resultClipMuted,
  resultClipStartTime,
  sadScaleSeekSeconds,
  shouldShowMissCelebration,
  shouldShowPerfectCelebration,
  shouldShowResultStamps,
  stampFinaleSfx,
} from './resultPresentation';

describe('shouldShowPerfectCelebration', () => {
  it('shows the celebration only when all three stages are correct', () => {
    expect(shouldShowPerfectCelebration(null)).toBe(false);
    expect(shouldShowPerfectCelebration({ stagesCorrect: 2 })).toBe(false);
    expect(shouldShowPerfectCelebration({ stagesCorrect: 3 })).toBe(true);
  });
});

describe('shouldShowMissCelebration', () => {
  it('shows the sad-scale clip only when all three stages are wrong', () => {
    expect(shouldShowMissCelebration(null)).toBe(false);
    expect(shouldShowMissCelebration({ stagesCorrect: 1 })).toBe(false);
    expect(shouldShowMissCelebration({ stagesCorrect: 3 })).toBe(false);
    expect(shouldShowMissCelebration({ stagesCorrect: 0 })).toBe(true);
  });
});

describe('resultClipKind', () => {
  it('picks the result clip for a perfect or total-miss grade', () => {
    expect(resultClipKind(null)).toBeNull();
    expect(resultClipKind({ stagesCorrect: 2 })).toBeNull();
    expect(resultClipKind({ stagesCorrect: 3 })).toBe('perfect');
    expect(resultClipKind({ stagesCorrect: 0 })).toBe('miss');
  });
});

describe('resultClipMuted', () => {
  it('plays the sad-scale miss clip with sound', () => {
    expect(resultClipMuted('miss')).toBe(false);
  });

  it('keeps the perfect cheer clip muted', () => {
    expect(resultClipMuted('perfect')).toBe(true);
  });
});

describe('shouldShowResultStamps', () => {
  it('shows stamps with a perfect 3/3 even while the celebration video is playing', () => {
    expect(shouldShowResultStamps({ stagesCorrect: 3 }, false)).toBe(true);
    expect(shouldShowResultStamps({ stagesCorrect: 3 }, true)).toBe(true);
  });

  it('shows stamps with a total miss even while the sad-scale video is playing', () => {
    expect(shouldShowResultStamps({ stagesCorrect: 0 }, false)).toBe(true);
    expect(shouldShowResultStamps({ stagesCorrect: 0 }, true)).toBe(true);
  });

  it('shows stamps immediately when there is no perfect-result video', () => {
    expect(shouldShowResultStamps({ stagesCorrect: 2 }, false)).toBe(true);
  });
});

describe('cheeringSeekSeconds', () => {
  it('starts near the beginning once duration is known', () => {
    expect(cheeringSeekSeconds(9.96)).toBeCloseTo(0.3);
  });

  it('does not jump into the middle when duration is not loaded yet', () => {
    expect(cheeringSeekSeconds(0)).toBe(0);
    expect(cheeringSeekSeconds(undefined)).toBe(0);
  });
});

describe('resultClipStartTime', () => {
  it('waits for duration before seeking the miss clip to 00:07', () => {
    expect(resultClipStartTime('miss', undefined)).toBeNull();
    expect(resultClipStartTime('miss', 0)).toBeNull();
    expect(resultClipStartTime('miss', 10.01)).toBe(7);
  });

  it('starts the perfect clip near the beginning once duration is known', () => {
    expect(resultClipStartTime('perfect', undefined)).toBeNull();
    expect(resultClipStartTime('perfect', 9.96)).toBeCloseTo(0.3);
  });
});

describe('sadScaleSeekSeconds', () => {
  it('starts at 00:07 once duration is known', () => {
    expect(sadScaleSeekSeconds(10.01)).toBe(7);
  });

  it('does not seek past the last frame on a shorter clip', () => {
    expect(sadScaleSeekSeconds(5)).toBeCloseTo(4.95);
  });

  it('does not jump ahead when duration is not loaded yet', () => {
    expect(sadScaleSeekSeconds(0)).toBe(0);
    expect(sadScaleSeekSeconds(undefined)).toBe(0);
  });
});

describe('stampFinaleSfx', () => {
  it('never queues incorrect.wav from the stamp row', () => {
    expect(stampFinaleSfx({ stagesCorrect: 0 })).toBeNull();
    expect(stampFinaleSfx({ stagesCorrect: 1 })).toBeNull();
    expect(stampFinaleSfx({ stagesCorrect: 2 })).toBeNull();
  });

  it('plays jackpot only after a perfect 3/3', () => {
    expect(stampFinaleSfx({ stagesCorrect: 3 })).toBe('jackpot');
  });
});

describe('finaleCue', () => {
  it('never plays the incorrect cue for a correct fold or call', () => {
    expect(finaleCue({ decisionCorrect: true, stagesCorrect: 1 })).toBe('correct');
    expect(finaleCue({ decisionCorrect: true, stagesCorrect: 2 })).toBe('correct');
    expect(finaleCue({ decisionCorrect: true, stagesCorrect: 3 })).toBe('jackpot');
  });

  it('plays the incorrect cue only for an incorrect final decision', () => {
    expect(finaleCue({ decisionCorrect: false, stagesCorrect: 0 })).toBe('incorrect');
    expect(finaleCue({ decisionCorrect: false, stagesCorrect: 2 })).toBe('incorrect');
  });
});
