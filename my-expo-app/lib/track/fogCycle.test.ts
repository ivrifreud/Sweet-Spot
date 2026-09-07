import { describe, expect, it } from 'vitest';

import { createLocalCasinoChunkLayouts } from './localCasinoMap';
import {
  fogCloudBox,
  fogCloudLayout,
  fogPartDrift,
  fogPartTremble,
  initialFogPhase,
  reduceFog,
  type FogPhase,
} from './fogCycle';

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

describe('fog cloud layout', () => {
  const map = { width: 382, height: 679 };

  it('keeps Benny Garden clouds on the existing side banks', () => {
    expect(fogCloudLayout('bennys-garden').widthFraction).toBeCloseTo(0.53);
  });

  it('keeps Local Casino sandstorm on the upper climb so the four nodes stay visible', () => {
    const layout = fogCloudLayout('local-casino');
    const left = fogCloudBox('left', map, 576 / 1024, layout);
    const right = fogCloudBox('right', map, 576 / 1024, layout);
    const leftEdge = left.left ?? 0;
    const rightEdge = map.width - (right.right ?? 0);
    expect(leftEdge + left.width).toBeGreaterThan(rightEdge - right.width);
    const paintedBottom =
      (layout.topFraction + (layout.heightFraction ?? 1)) * map.height;
    expect(paintedBottom).toBeLessThan(map.height * 0.18);
    expect(paintedBottom).toBeGreaterThan(map.height * 0.08);
    const fogBottomPercent = (layout.topFraction + (layout.heightFraction ?? 1)) * 100;
    for (const node of createLocalCasinoChunkLayouts(12)[0]!.nodes) {
      expect(Number.parseFloat(node.top)).toBeGreaterThan(fogBottomPercent + 2);
    }
  });

  it('parts left bank leftward and right bank rightward', () => {
    expect(fogCloudLayout('local-casino').partLeftFraction).toBeLessThan(0);
    expect(fogCloudLayout('local-casino').partRightFraction).toBeGreaterThan(0);
  });

  it('trembles while parting instead of sliding like a door', () => {
    const start = fogPartTremble(0, 'left');
    const mid = fogPartTremble(0.45, 'left');
    const end = fogPartTremble(1, 'right');
    expect(start.y).toBeCloseTo(0);
    expect(start.rotate).toBeCloseTo(0);
    expect(Math.abs(mid.y)).toBeGreaterThan(0.2);
    expect(Math.abs(mid.rotate)).toBeGreaterThan(0.4);
    expect(end.y).toBeCloseTo(0);
    expect(fogPartTremble(0.4, 'left').y).not.toBe(fogPartTremble(0.4, 'right').y);
    expect(fogPartDrift(0)).toBeCloseTo(0);
    expect(fogPartDrift(1)).toBeCloseTo(1);
    expect(fogPartDrift(0.4)).toBeLessThan(0.28);
  });
});
