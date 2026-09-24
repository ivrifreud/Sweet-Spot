import { describe, expect, it } from 'vitest';

import { visibleProgressionLayers } from './worldProgression';
import { settleChunkWindow, visibleChunkWindow } from './visibleChunkWindow';

describe('visibleChunkWindow', () => {
  it('mounts only the active chunk while idle', () => {
    expect(
      visibleChunkWindow({ chunkCount: 3, activeChunkIndex: 1, travelChunkIndex: null })
    ).toEqual([1]);
  });

  it('keeps source and destination chunks during travel', () => {
    expect(
      visibleChunkWindow({ chunkCount: 3, activeChunkIndex: 2, travelChunkIndex: 1 })
    ).toEqual([1, 2]);
  });

  it('omits distant chunks after the camera settles', () => {
    expect(settleChunkWindow(2, 3)).toEqual([2]);
  });

  it('does not change overlay unlock math for unmounted chunks', () => {
    const layers = visibleProgressionLayers(
      {
        progressionLayers: [
          { unlockAfterStage: 1, source: 'a' },
          { unlockAfterStage: 5, source: 'b' },
        ],
      },
      4
    );
    expect(layers.map((layer) => layer.unlockAfterStage)).toEqual([1]);
  });
});
