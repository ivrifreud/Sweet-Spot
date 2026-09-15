import { describe, expect, it } from 'vitest';

import {
  ambienceBedGain,
  ambiencePlaybackVolume,
  selectAmbience,
  selectAmbienceCandidates,
  selectJackpotSfx,
  selectMistakeSfx,
} from './beds';

describe('selectAmbience', () => {
  it('defaults Benny garden afternoon', () => {
    expect(selectAmbience()).toBe('garden-ambience');
  });

  it('maps world and lighting to beds', () => {
    expect(selectAmbience('bennys-garden', 'night')).toBe('poker-table');
    expect(selectAmbience('local-casino', 'light')).toBe('local-casino-vip-1');
    expect(selectAmbience('local-casino', 'night')).toBe('local-casino-vip-1');
    expect(selectAmbience('vip-room', 'light')).toBe('vip-day-ambience');
    expect(selectAmbience('vip-room', 'night')).toBe('vip-night-ambience');
  });

  it('uses the poker-table bed for Benny garden night instead of crickets', () => {
    expect(selectAmbienceCandidates('bennys-garden', 'night')).toEqual(['poker-table']);
  });

  it('offers both supplied beds for every local casino table', () => {
    expect(selectAmbienceCandidates('local-casino', 'light')).toEqual([
      'local-casino-vip-1',
      'local-casino-vip-2',
    ]);
    expect(selectAmbienceCandidates('local-casino', 'night')).toEqual([
      'local-casino-vip-1',
      'local-casino-vip-2',
    ]);
  });
});

describe('selectMistakeSfx', () => {
  it('keeps a warm thunk except World 3 dark', () => {
    expect(selectMistakeSfx('bennys-garden', 'night')).toBe('incorrect');
    expect(selectMistakeSfx('local-casino', 'night')).toBe('incorrect');
    expect(selectMistakeSfx('vip-room', 'light')).toBe('incorrect');
    expect(selectMistakeSfx('vip-room', 'night')).toBe('incorrectBass');
  });
});

describe('ambienceBedGain', () => {
  it('plays the poker-table bed quieter than other ambience', () => {
    expect(ambienceBedGain('poker-table')).toBe(0.4);
    expect(ambienceBedGain('garden-ambience')).toBe(1);
    expect(ambiencePlaybackVolume('poker-table', 0.28)).toBeCloseTo(0.112);
    expect(ambiencePlaybackVolume('garden-ambience', 0.28)).toBeCloseTo(0.28);
  });
});

describe('selectJackpotSfx', () => {
  it('uses the heavy dump only on later-world night', () => {
    expect(selectJackpotSfx('bennys-garden', 'night')).toBe('jackpot');
    expect(selectJackpotSfx('local-casino', 'night')).toBe('jackpotHeavy');
    expect(selectJackpotSfx('vip-room', 'night')).toBe('jackpotHeavy');
    expect(selectJackpotSfx('local-casino', 'light')).toBe('jackpot');
  });
});
