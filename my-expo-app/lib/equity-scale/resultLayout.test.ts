import { describe, expect, it } from 'vitest';

import { equityClipResultFrame } from './resultLayout';

const PHONE = { width: 390, height: 844, topInset: 47, bottomInset: 34 };

describe('equity clip result frame', () => {
  it('keeps the clip, three stamps, and the lesson inside a phone', () => {
    const frame = equityClipResultFrame(PHONE);
    expect(frame.stampSize * 3 + 16).toBeLessThanOrEqual(frame.contentWidth - 32);
    expect(frame.videoWidth).toBeGreaterThan(160);
    expect(frame.videoHeight).toBeGreaterThan(90);
    expect(frame.explanationMaxHeight).toBeGreaterThanOrEqual(96);
    const stacked =
      PHONE.topInset +
      frame.videoHeight +
      frame.stampSize +
      frame.explanationMaxHeight +
      120 +
      PHONE.bottomInset;
    expect(stacked).toBeLessThanOrEqual(PHONE.height);
  });

  it('shrinks the clip on a short phone so the lesson still has room', () => {
    const frame = equityClipResultFrame({
      width: 320,
      height: 568,
      topInset: 20,
      bottomInset: 0,
    });
    expect(frame.explanationMaxHeight).toBeGreaterThanOrEqual(96);
    expect(frame.stampSize * 3 + 16).toBeLessThanOrEqual(frame.contentWidth - 32);
    expect(frame.videoHeight).toBeLessThan(equityClipResultFrame(PHONE).videoHeight);
  });
});
