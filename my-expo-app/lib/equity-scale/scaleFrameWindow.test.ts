import { describe, expect, it } from 'vitest';

import {
  SCALE_FRAME_COUNT,
  SCALE_FRAME_WINDOW_MAX,
  mergeScaleFrameWindow,
  scaleFramePosition,
  scaleFrameWindow,
  visibleScaleFrameOpacities,
} from '../../src/features/templates/equity-scale/components/scaleArmLayout';

describe('scaleFrameWindow', () => {
  it('keeps at most a neighboring pair for any tilt', () => {
    for (let tilt = -28; tilt <= 28; tilt += 1) {
      const window = scaleFrameWindow(scaleFramePosition(tilt));
      expect(window.length).toBeLessThanOrEqual(2);
      expect(window.length).toBeGreaterThan(0);
      const opacities = visibleScaleFrameOpacities(scaleFramePosition(tilt), window);
      const total = opacities.reduce((sum, layer) => sum + layer.opacity, 0);
      expect(total).toBeGreaterThan(0.99);
      expect(total).toBeLessThan(1.01);
    }
  });

  it('resets a spot to a single rest frame', () => {
    const rest = scaleFrameWindow(scaleFramePosition(0));
    expect(rest).toEqual([14]);
    expect(mergeScaleFrameWindow([13, 14, 15], rest).length).toBeLessThanOrEqual(
      SCALE_FRAME_WINDOW_MAX
    );
    expect(mergeScaleFrameWindow([13, 14, 15], rest)).toEqual([14]);
  });

  it('never expands past the baked frame count', () => {
    expect(scaleFrameWindow(-1, SCALE_FRAME_COUNT)[0]).toBe(0);
    expect(scaleFrameWindow(40, SCALE_FRAME_COUNT).at(-1)).toBe(SCALE_FRAME_COUNT - 1);
  });
});
