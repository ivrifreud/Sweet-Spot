import { describe, expect, it } from 'vitest';

import {
  GARDEN_SWAP_CUE,
  swapCueAt,
  swapRoute,
  swapRuntimeSeconds,
  swapSeekNeeded,
  swapSoundsDue,
} from '../../src/features/templates/hot-seats/hotSeatSwapVideoPlan';
import { REDUCED_FADE_MS } from '../../src/features/templates/hot-seats/seatRail';
import {
  CASINO_FLOP_STORY,
  GARDEN_PREFLOP_STORY,
} from '../../src/features/templates/hot-seats/fixtures';
import {
  begin,
  cameraLanded,
  cameraReady,
  cardCleared,
  decide,
} from '../../src/features/templates/hot-seats/storyEngine';

function openSeat(story: typeof GARDEN_PREFLOP_STORY, state = begin(story)) {
  return cardCleared(cameraReady(state));
}

describe('garden seat-swap video cue', () => {
  it('plays the orbit for a ready garden swap in normal motion', () => {
    expect(
      swapRoute({
        skin: 'garden',
        reducedMotion: false,
        videoReady: true,
        phase: 'swapping',
      })
    ).toBe('video');
  });

  it('falls back for the casino plate', () => {
    expect(
      swapRoute({
        skin: 'casino',
        reducedMotion: false,
        videoReady: true,
        phase: 'swapping',
      })
    ).toBe('fade');
  });

  it('falls back to the 180ms fade when motion is reduced or the clip is not ready', () => {
    expect(REDUCED_FADE_MS).toBe(180);
    expect(
      swapRoute({
        skin: 'garden',
        reducedMotion: true,
        videoReady: true,
        phase: 'swapping',
      })
    ).toBe('fade');
    expect(
      swapRoute({
        skin: 'garden',
        reducedMotion: false,
        videoReady: false,
        phase: 'swapping',
      })
    ).toBe('fade');
  });

  it('never asks for video on a wrong answer or the final correct decision', () => {
    const wrong = decide(openSeat(GARDEN_PREFLOP_STORY), 'call');
    expect(wrong.phase).toBe('explaining');
    expect(
      swapRoute({
        skin: 'garden',
        reducedMotion: false,
        videoReady: true,
        phase: wrong.phase,
      })
    ).toBe('fade');

    let state = begin(CASINO_FLOP_STORY);
    CASINO_FLOP_STORY.seats.forEach((seat, index) => {
      state = decide(openSeat(CASINO_FLOP_STORY, state), seat.scriptedAction, seat.raiseSize);
      if (index < 3) state = cameraLanded(state);
    });
    expect(state.phase).toBe('explaining');
    expect(
      swapRoute({
        skin: 'garden',
        reducedMotion: false,
        videoReady: true,
        phase: state.phase,
      })
    ).toBe('fade');
  });

  it('changes the hand before the clip ends and runs the middle in 1.75s', () => {
    expect(GARDEN_SWAP_CUE.nextHandSeconds).toBeLessThan(GARDEN_SWAP_CUE.sourceOutSeconds);
    expect(swapRuntimeSeconds()).toBeCloseTo(1.75);
    expect(swapCueAt(1.66)).toEqual({ showNextHand: false, finishSource: false });
    expect(swapCueAt(1.6625)).toEqual({ showNextHand: true, finishSource: false });
    expect(swapCueAt(1.75)).toEqual({ showNextHand: true, finishSource: true });
  });

  it('plays the body sound on the way out and the way in, and the swish during the spin', () => {
    expect(swapSoundsDue(-1, 0)).toEqual(['enter-body']);
    expect(swapSoundsDue(0, 0.524)).toEqual([]);
    expect(swapSoundsDue(0, 0.525)).toEqual(['swish']);
    expect(swapSoundsDue(0.525, 1.525)).toEqual(['enter-body']);
    expect(swapSoundsDue(1.525, 1.75)).toEqual([]);
    expect(swapSoundsDue(-1, 1.75)).toEqual(['enter-body', 'swish', 'enter-body']);
  });

  it('plays the baked orbit at normal speed from the first frame', () => {
    expect(GARDEN_SWAP_CUE.playbackRate).toBe(1);
    expect(GARDEN_SWAP_CUE.sourceInSeconds).toBe(0);
    expect(GARDEN_SWAP_CUE.timeoutMs).toBe(1000);
  });

  it('skips a redundant seek when already parked on the in-point', () => {
    expect(swapSeekNeeded(0, GARDEN_SWAP_CUE)).toBe(false);
    expect(swapSeekNeeded(0.02, GARDEN_SWAP_CUE)).toBe(false);
    expect(swapSeekNeeded(0.2, GARDEN_SWAP_CUE)).toBe(true);
  });
});
