import { describe, expect, it } from 'vitest';

import { selectAmbience, selectJackpotSfx, selectMistakeSfx } from './beds';

describe('selectAmbience', () => {
  it('defaults Benny garden afternoon', () => {
    expect(selectAmbience()).toBe('garden-ambience');
  });

  it('maps world and lighting to beds', () => {
    expect(selectAmbience('bennys-garden', 'night')).toBe('garden-night-ambience');
    expect(selectAmbience('local-casino', 'light')).toBe('casino-day-ambience');
    expect(selectAmbience('local-casino', 'night')).toBe('casino-night-ambience');
    expect(selectAmbience('vip-room', 'light')).toBe('vip-day-ambience');
    expect(selectAmbience('vip-room', 'night')).toBe('vip-night-ambience');
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

describe('selectJackpotSfx', () => {
  it('uses the heavy dump only on later-world night', () => {
    expect(selectJackpotSfx('bennys-garden', 'night')).toBe('jackpot');
    expect(selectJackpotSfx('local-casino', 'night')).toBe('jackpotHeavy');
    expect(selectJackpotSfx('vip-room', 'night')).toBe('jackpotHeavy');
    expect(selectJackpotSfx('local-casino', 'light')).toBe('jackpot');
  });
});
