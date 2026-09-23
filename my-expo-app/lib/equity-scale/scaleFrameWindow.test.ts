import { describe, expect, it } from 'vitest';

import {
  SCALE_FRAME_COUNT,
  SCALE_FRAME_WINDOW_MAX,
  mergeScaleFrameWindow,
  mountedScaleFrames,
  scaleFramePosition,
  scaleFrameWindow,
  scaleLiveWindow,
  scalePlaybackIndexes,
  scaleTravelWindow,
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

  it('settles a worklet pair back to one or two indexes', () => {
    expect(mountedScaleFrames(14, 14)).toEqual([14]);
    expect(mountedScaleFrames(13, 14)).toEqual([13, 14]);
    expect(mountedScaleFrames(15, 14)).toEqual([14, 15]);
  });

  it('never expands past the baked frame count', () => {
    expect(scaleFrameWindow(-1, SCALE_FRAME_COUNT)[0]).toBe(0);
    expect(scaleFrameWindow(40, SCALE_FRAME_COUNT).at(-1)).toBe(SCALE_FRAME_COUNT - 1);
  });

  it('mounts every frame between rest and a distant target so the hose can blend', () => {
    const rest = scaleFramePosition(0);
    const target = 20;
    const travel = scaleTravelWindow(rest, target);
    expect(travel).toEqual([14, 15, 16, 17, 18, 19, 20]);
    expect(scaleFrameWindow(target)).toEqual([20]);
  });

  it('drops hose opacity to zero when the live position is outside the mounted window', () => {
    const live = 14.4;
    const racedTarget = scaleTravelWindow(20, 22);
    const total = visibleScaleFrameOpacities(live, racedTarget).reduce(
      (sum, layer) => sum + layer.opacity,
      0
    );
    expect(racedTarget).toEqual([20, 21, 22]);
    expect(total).toBe(0);
  });

  it('opens with at most a neighboring pair so the phone does not decode the full tilt strip', () => {
    const opening = scaleLiveWindow(scaleFramePosition(0));
    expect(opening.length).toBeGreaterThan(0);
    expect(opening.length).toBeLessThanOrEqual(2);
    expect(opening.length).toBeLessThanOrEqual(SCALE_FRAME_WINDOW_MAX);
    expect(scalePlaybackIndexes()).toHaveLength(SCALE_FRAME_COUNT);
    expect(opening).not.toHaveLength(SCALE_FRAME_COUNT);
  });

  it('keeps hose opacity at 1 using only the live neighbor pair as the dial travels', () => {
    for (let position = 0; position <= SCALE_FRAME_COUNT - 1; position += 0.25) {
      const mounted = scaleLiveWindow(position);
      expect(mounted.length).toBeLessThanOrEqual(2);
      const total = visibleScaleFrameOpacities(position, mounted).reduce(
        (sum, layer) => sum + layer.opacity,
        0
      );
      expect(total).toBeGreaterThan(0.99);
      expect(total).toBeLessThan(1.01);
    }
  });
});
