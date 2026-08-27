import type { Placement } from '../calibration/types';

/** `current` is the active/playable node. Locked nodes stay unclickable for travel. */
export type StageStatus = 'completed' | 'current' | 'locked';

/**
 * Overworld checkpoints. `x` and `y` are fractions of the map box (0–1),
 * so they stay put when the phone size changes. Swap the background image
 * later and nudge these until they sit on the painted path.
 */
export type MapNode = {
  id: string;
  number: number;
  title: string;
  x: number;
  y: number;
};

export type LevelMarker = MapNode & { status: StageStatus };

/** Portrait map box. Width / height — keep in sync with the eventual map art. */
export const MAP_ASPECT = 9 / 16;

export const MAP_NODE_SIZE = 52;

/** Placeholder 4-stage zigzag. Keep nodes on the table wood until map art lands. */
export const MAP_NODES: MapNode[] = [
  { id: 'stage-1', number: 1, title: 'Warm-up', x: 0.3, y: 0.82 },
  { id: 'stage-2', number: 2, title: 'The concept', x: 0.7, y: 0.68 },
  { id: 'stage-3', number: 3, title: 'Practice', x: 0.28, y: 0.54 },
  { id: 'stage-4', number: 4, title: 'Final challenge', x: 0.68, y: 0.42 },
];

export function stageStatus(stageNumber: number, completedCount: number): StageStatus {
  if (stageNumber <= completedCount) return 'completed';
  if (stageNumber === completedCount + 1) return 'current';
  return 'locked';
}

export function canEnterStage(stageNumber: number, completedCount: number, remainingChips: number): boolean {
  return remainingChips > 0 && stageStatus(stageNumber, completedCount) === 'current';
}

/** Walk to any cleared or active node. Locked nodes stay shut. */
export function canStandOn(stageNumber: number, completedCount: number): boolean {
  return stageStatus(stageNumber, completedCount) !== 'locked';
}

export function lockReason(stageNumber: number, completedCount: number, remainingChips: number): string | null {
  if (remainingChips <= 0 && stageStatus(stageNumber, completedCount) === 'current') {
    return 'Chips are spent. They refill in 12 hours.';
  }
  if (stageStatus(stageNumber, completedCount) === 'locked') {
    return `Finish Stage ${completedCount + 1} first.`;
  }
  return null;
}

export function currentStageNumber(completedCount: number): number {
  return Math.min(completedCount + 1, MAP_NODES.length);
}

/**
 * Phones are already portrait — fill the remaining screen so the map does
 * not collapse into a letterboxed strip. Wide web canvases still get a 9:16 box.
 */
export function fitMap(areaWidth: number, areaHeight: number): { width: number; height: number } {
  if (areaWidth <= 0 || areaHeight <= 0) {
    return { width: 0, height: 0 };
  }
  const areaAspect = areaWidth / areaHeight;
  if (areaAspect <= MAP_ASPECT + 0.05) {
    return { width: areaWidth, height: areaHeight };
  }
  return { width: areaHeight * MAP_ASPECT, height: areaHeight };
}

export function nodePixels(node: MapNode, map: { width: number; height: number }): { x: number; y: number } {
  return { x: node.x * map.width, y: node.y * map.height };
}

export function levelMarkers(completedCount: number): LevelMarker[] {
  return MAP_NODES.map((node) => ({
    ...node,
    status: stageStatus(node.number, completedCount),
  }));
}

export function nodeByNumber(stageNumber: number): MapNode | undefined {
  return MAP_NODES.find((node) => node.number === stageNumber);
}

export function worldBackdrop(placement: Placement): 'garden' | 'casino' {
  return placement === 1 ? 'garden' : 'casino';
}
