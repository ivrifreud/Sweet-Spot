import type { HotSeatPhase } from './storyEngine';
import type { HotSeatSkin } from './types';

/**
 * `garden-seat-swap-play.mp4` is the 1.5–8.5s orbit already sped to 4× (30fps).
 * Play it at 1×. A phone cannot decode the original 24fps file at 4× from the first frame.
 */
export const GARDEN_SWAP_CUE = {
  sourceInSeconds: 0,
  landingStartSeconds: 1.6625,
  nextHandSeconds: 1.6625,
  sourceOutSeconds: 1.75,
  playbackRate: 1,
  revealMs: 100,
  landingMs: 100,
  timeoutMs: 1000,
  seekEpsilonSeconds: 0.04,
} as const;

export type SwapVideoEvent = 'show-video' | 'show-next-hand' | 'finish' | 'fallback';

export type SwapRoute = 'video' | 'fade';

export function swapRuntimeSeconds(cue: typeof GARDEN_SWAP_CUE = GARDEN_SWAP_CUE): number {
  return (cue.sourceOutSeconds - cue.sourceInSeconds) / cue.playbackRate;
}

export function swapTagProgress(
  sourceTime: number,
  cue: typeof GARDEN_SWAP_CUE = GARDEN_SWAP_CUE
): number {
  const span = cue.sourceOutSeconds - cue.sourceInSeconds;
  if (span <= 0) return 1;
  return Math.min(1, Math.max(0, (sourceTime - cue.sourceInSeconds) / span));
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

export function swapSeekNeeded(
  currentTime: number,
  cue: typeof GARDEN_SWAP_CUE = GARDEN_SWAP_CUE
): boolean {
  return Math.abs(currentTime - cue.sourceInSeconds) > cue.seekEpsilonSeconds;
}

/** Times on the baked 4× clip. Playback stays muted so these cues keep their pitch. */
export const GARDEN_SWAP_SOUNDS = [
  { sourceSeconds: 0, sound: 'enter-body' },
  { sourceSeconds: 0.525, sound: 'swish' },
  { sourceSeconds: 1.525, sound: 'enter-body' },
] as const;

export type SwapSound = (typeof GARDEN_SWAP_SOUNDS)[number]['sound'];

/** Sounds whose source time falls after `heardThrough` and at or before `sourceTime`. */
export function swapSoundsDue(heardThrough: number, sourceTime: number): SwapSound[] {
  if (sourceTime <= heardThrough) return [];
  return GARDEN_SWAP_SOUNDS.filter(
    (cue) => cue.sourceSeconds > heardThrough && cue.sourceSeconds <= sourceTime
  ).map((cue) => cue.sound);
}

