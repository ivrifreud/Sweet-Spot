import { describe, expect, it } from 'vitest';

import { safePauseVideoPlayer } from './safePause';

describe('safePauseVideoPlayer', () => {
  it('does not throw when pause fails because the native player is already gone', () => {
    const player = {
      pause: () => {
        throw new Error(
          "FunctionCallException: Calling the 'pause' function has failed"
        );
      },
    };

    expect(() => safePauseVideoPlayer(player)).not.toThrow();
  });
});
