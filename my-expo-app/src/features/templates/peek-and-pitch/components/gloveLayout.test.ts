import { describe, expect, it } from 'vitest';

import { fitGloveToViewport } from './gloveLayout';

const CONTACT = { x: 0.08, y: 0.3684 };

describe('fitGloveToViewport', () => {
  it('extends the sleeve to the bottom of the viewport', () => {
    const frame = fitGloveToViewport({ x: 280, y: 700 }, 180, 844, CONTACT);
    expect(frame.top + frame.height).toBeGreaterThanOrEqual(844);
  });

  it('does not shrink below the natural glove size when already on the rail', () => {
    const frame = fitGloveToViewport({ x: 280, y: 820 }, 180, 844, CONTACT);
    expect(frame.width).toBeGreaterThanOrEqual(180);
  });
});
