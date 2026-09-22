import { describe, expect, it } from 'vitest';

import { initialPlaybackState, planPlayback } from './playbackPlan';

describe('playbackPlan', () => {
  it('does not play before readyToPlay even if the view mounts', () => {
    const requested = planPlayback(initialPlaybackState(), {
      type: 'request',
      generation: 1,
      muted: true,
    });
    expect(requested.command.shouldPlay).toBe(false);

    const tooEarly = planPlayback(requested.state, { type: 'firstFrame', generation: 1 });
    expect(tooEarly.command.ignore).toBe(true);
    expect(tooEarly.command.shouldPlay).toBe(false);
  });

  it('seeks once from duration then plays', () => {
    let state = planPlayback(initialPlaybackState(), {
      type: 'request',
      generation: 4,
      muted: false,
    }).state;
    const ready = planPlayback(
      state,
      { type: 'status', generation: 4, status: 'readyToPlay', duration: 10 },
      (duration) => duration / 2
    );
    expect(ready.command.seekTo).toBe(5);
    expect(ready.command.shouldPlay).toBe(true);
    expect(ready.state.sought).toBe(true);

    const again = planPlayback(
      ready.state,
      { type: 'sourceLoad', generation: 4, duration: 10 },
      (duration) => duration / 2
    );
    expect(again.command.seekTo).toBeNull();
    expect(again.command.shouldPlay).toBe(true);
  });

  it('ignores stale events from an older feedback key', () => {
    const current = planPlayback(initialPlaybackState(), {
      type: 'request',
      generation: 8,
      muted: true,
    }).state;
    const stale = planPlayback(current, {
      type: 'status',
      generation: 7,
      status: 'readyToPlay',
      duration: 4,
    });
    expect(stale.command.ignore).toBe(true);
    expect(stale.command.shouldPlay).toBe(false);
  });

  it('falls back to the poster on error or timeout', () => {
    const loading = planPlayback(initialPlaybackState(), {
      type: 'request',
      generation: 2,
      muted: true,
    }).state;
    const timeout = planPlayback(loading, { type: 'timeout', generation: 2 });
    expect(timeout.command.fallback).toBe(true);
    expect(timeout.command.showPoster).toBe(true);
    expect(timeout.command.shouldPlay).toBe(false);

    const error = planPlayback(loading, {
      type: 'status',
      generation: 2,
      status: 'error',
    });
    expect(error.command.fallback).toBe(true);
  });
});
