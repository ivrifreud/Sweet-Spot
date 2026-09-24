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

  it('plays on readyToPlay even when duration is still unknown', () => {
    const requested = planPlayback(initialPlaybackState(), {
      type: 'request',
      generation: 3,
      muted: true,
    });
    const ready = planPlayback(requested.state, {
      type: 'status',
      generation: 3,
      status: 'readyToPlay',
      duration: 0,
    });
    expect(ready.command.shouldPlay).toBe(true);
    expect(ready.command.fallback).toBe(false);

    const later = planPlayback(
      ready.state,
      { type: 'sourceLoad', generation: 3, duration: 8 },
      () => 0
    );
    expect(later.command.shouldPlay).toBe(true);
    expect(later.command.seekTo).toBe(0);
  });

  it('does not overlay a poster after timeout once the generation is playing', () => {
    let state = planPlayback(initialPlaybackState(), {
      type: 'request',
      generation: 5,
      muted: true,
    }).state;
    state = planPlayback(state, {
      type: 'status',
      generation: 5,
      status: 'readyToPlay',
      duration: 6,
    }).state;
    const playing = planPlayback(state, { type: 'playing', generation: 5 });
    expect(playing.command.showPoster).toBe(false);

    const lateTimeout = planPlayback(playing.state, { type: 'timeout', generation: 5 });
    expect(lateTimeout.command.fallback).toBe(false);
    expect(lateTimeout.command.showPoster).toBe(false);
  });

  it('accepts firstFrame after play has started', () => {
    let state = planPlayback(initialPlaybackState(), {
      type: 'request',
      generation: 6,
      muted: true,
    }).state;
    state = planPlayback(state, {
      type: 'status',
      generation: 6,
      status: 'readyToPlay',
      duration: 0,
    }).state;
    const frame = planPlayback(state, { type: 'firstFrame', generation: 6 });
    expect(frame.command.ignore).toBe(false);
    expect(frame.command.showPoster).toBe(false);
  });
});
