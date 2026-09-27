import { describe, expect, it } from 'vitest';

import { chipThrowCueAtMs } from '../../src/features/templates/peek-and-pitch/components/chipThrowCue';

describe('chipThrowCueAtMs', () => {
  it('lands when the first chip finishes its lift', () => {
    expect(chipThrowCueAtMs(90, 1150, false)).toBe(90 + 1150 * 0.16);
  });

  it('uses the shortened reduced-motion clock', () => {
    expect(chipThrowCueAtMs(90, 1150, true)).toBe(280 * 0.16);
  });
});
