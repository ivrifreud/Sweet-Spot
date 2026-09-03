import { describe, expect, it } from 'vitest';

import { initialFogPhase, reduceFog, type FogPhase } from './fogCycle';

describe('fog cycle', () => {
  it('starts closed on the first chunk', () => {
    expect(initialFogPhase(0, 3)).toBe('closed');
  });

  it('stays closed when the player is already on a later chunk', () => {
    expect(initialFogPhase(1, 3)).toBe('closed');
  });

  it('stays hidden after the final chunk is cleared', () => {
    expect(initialFogPhase(3, 3)).toBe('hidden');
  });

  it('parts after four nodes when another chunk is waiting', () => {
    expect(
      reduceFog('closed', { type: 'chunk-cleared', nextChunkExists: true, reducedMotion: false })
    ).toBe('parting');
  });

  it('stays hidden after the last four nodes because there is no next chunk', () => {
    expect(
      reduceFog('closed', { type: 'chunk-cleared', nextChunkExists: false, reducedMotion: false })
    ).toBe('hidden');
  });

  it('skips the parting delay under reduced motion and applies the hidden climb state', () => {
    expect(
      reduceFog('closed', { type: 'chunk-cleared', nextChunkExists: true, reducedMotion: true })
    ).toBe('hidden');
  });

  it('hides clouds during the camera climb, then restores them on the next chunk', () => {
    const phases: FogPhase[] = [];
    let phase: FogPhase = 'closed';
    phase = reduceFog(phase, {
      type: 'chunk-cleared',
      nextChunkExists: true,
      reducedMotion: false,
    });
    phases.push(phase);
    phase = reduceFog(phase, { type: 'parting-finished' });
    phases.push(phase);
    phase = reduceFog(phase, { type: 'camera-settled', nextChunkExists: true });
    phases.push(phase);
    expect(phases).toEqual(['parting', 'hidden', 'closed']);
  });

  it('does not restore clouds after settling on a completed final chunk', () => {
    expect(reduceFog('hidden', { type: 'camera-settled', nextChunkExists: false })).toBe('hidden');
  });
});
