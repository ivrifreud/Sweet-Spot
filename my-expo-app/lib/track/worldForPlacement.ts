import type { Placement } from '../calibration/types';

export type ReadyWorldId = 'bennys-garden' | 'local-casino';

export type WorldForPlacement =
  | { status: 'ready'; worldId: ReadyWorldId; progressLevel: 1 | 2 }
  | { status: 'unavailable'; worldId: 'vip-room'; progressLevel: 3 };

export function worldForPlacement(placement: Placement): WorldForPlacement {
  if (placement === 1) {
    return { status: 'ready', worldId: 'bennys-garden', progressLevel: 1 };
  }
  if (placement === 2) {
    return { status: 'ready', worldId: 'local-casino', progressLevel: 2 };
  }
  return { status: 'unavailable', worldId: 'vip-room', progressLevel: 3 };
}

/** Production map to mount, or null when World 3 must not silently show Benny. */
export function currentWorldIdForPlacement(placement: Placement): ReadyWorldId | null {
  const selected = worldForPlacement(placement);
  return selected.status === 'ready' ? selected.worldId : null;
}

export function openStageProgressArgs(
  userId: string,
  placement: Placement,
  stageNumber: number
): { userId: string; level: Placement; stageNumber: number } {
  return {
    userId,
    level: worldForPlacement(placement).progressLevel,
    stageNumber,
  };
}
