import type { HotSeatPhase } from './storyEngine';
import type { HotSeatSkin } from './types';

/** Middle of the garden orbit clip. Blank foreground cards sit outside 1.5–8.5s. */
export const GARDEN_SWAP_CUE = {
  sourceInSeconds: 1.5,
  landingStartSeconds: 8.15,
  nextHandSeconds: 8.15,
  sourceOutSeconds: 8.5,
  playbackRate: 4,
  revealMs: 100,
  landingMs: 100,
  timeoutMs: 1000,
} as const;

export type SwapVideoEvent = 'show-video' | 'show-next-hand' | 'finish' | 'fallback';

export type SwapRoute = 'video' | 'fade';

export function swapRuntimeSeconds(cue: typeof GARDEN_SWAP_CUE = GARDEN_SWAP_CUE): number {
  return (cue.sourceOutSeconds - cue.sourceInSeconds) / cue.playbackRate;
}

/** Video only while a garden swap is ready and motion is allowed. Every other case fades. */
export function swapRoute(input: {
  skin: HotSeatSkin;
  reducedMotion: boolean;
  videoReady: boolean;
  phase: HotSeatPhase;
}): SwapRoute {
  if (
    input.phase === 'swapping' &&
    input.skin === 'garden' &&
    !input.reducedMotion &&
    input.videoReady
  ) {
    return 'video';
  }
  return 'fade';
}

export function swapCueAt(sourceTime: number): { showNextHand: boolean; finishSource: boolean } {
  return {
    showNextHand: sourceTime >= GARDEN_SWAP_CUE.nextHandSeconds,
    finishSource: sourceTime >= GARDEN_SWAP_CUE.sourceOutSeconds,
  };
}

