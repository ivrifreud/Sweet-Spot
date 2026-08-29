import { describe, expect, it } from 'vitest';

import { WALK_FRAME_COUNT, walkFrameIndex } from './avatarAnimation';

describe('walkFrameIndex', () => {
  it('cycles through the four Benny walk frames', () => {
    expect(
      [0, 0.25, 0.5, 0.75].map((progress) => walkFrameIndex(progress, WALK_FRAME_COUNT))
    ).toEqual([0, 1, 2, 3]);
  });

  it('loops and clamps boundary progress', () => {
    expect(walkFrameIndex(0.625, 8)).toBe(1);
    expect(walkFrameIndex(-1, 8)).toBe(0);
    expect(walkFrameIndex(1, 8)).toBe(3);
  });
});
