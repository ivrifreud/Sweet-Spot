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

/** Source times on the 4× orbit. Playback stays muted so these cues keep their pitch. */
export const GARDEN_SWAP_SOUNDS = [
  { sourceSeconds: 1.5, sound: 'enter-body' },
  { sourceSeconds: 3.6, sound: 'swish' },
  { sourceSeconds: 7.6, sound: 'enter-body' },
] as const;

export type SwapSound = (typeof GARDEN_SWAP_SOUNDS)[number]['sound'];

/** Sounds whose source time falls after `heardThrough` and at or before `sourceTime`. */
export function swapSoundsDue(heardThrough: number, sourceTime: number): SwapSound[] {
  if (sourceTime <= heardThrough) return [];
  return GARDEN_SWAP_SOUNDS.filter(
    (cue) => cue.sourceSeconds > heardThrough && cue.sourceSeconds <= sourceTime
  ).map((cue) => cue.sound);
}

