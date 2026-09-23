export const PEEK_SHARED_VALUES_AFTER_RESET = {
  peek: 0,
  muck: 0,
  commit: 0,
  deal: 0,
  stackPress: 0,
  stackDragX: 0,
  stackDragY: 0,
} as const;

export const PEEK_ANIMATIONS_TO_CANCEL = ['deal', 'peek', 'muck', 'commit'] as const;

export function shouldApplyDealComplete(
  generation: number,
  activeGeneration: number,
  finished: boolean
): boolean {
  return finished && generation === activeGeneration;
}

export function nextHandResetGeneration(current: number): number {
  return current + 1;
}
