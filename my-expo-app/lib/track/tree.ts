import type { Placement } from '../calibration/types';

/** `current` is the active/playable node. Locked nodes stay unclickable for travel. */
export type StageStatus = 'completed' | 'current' | 'locked';

export type MapPercent = `${number}%`;

/** Overworld checkpoints use percentage coordinates so each world stays responsive. */
export type MapNode = {
  id: string;
  number: number;
  title: string;
  chunkIndex: number;
  left: MapPercent;
  top: MapPercent;
};

export type LevelMarker = MapNode & { status: StageStatus };

export type MapChunk = {
  id: string;
  index: number;
  nodes: readonly MapNode[];
};

/** Portrait map box. Width / height — keep in sync with the eventual map art. */
export const MAP_ASPECT = 9 / 16;

export const MAP_NODE_SIZE = 60;
export const MAP_NODES_PER_CHUNK = 4;

/** Hands dealt inside one Benny's Garden node before the stage unlocks. */
export const SPOTS_PER_STAGE = 7;

export function nextSpotIndex(spotsCompleted: number): number {
  return Math.min(Math.max(0, spotsCompleted), SPOTS_PER_STAGE - 1);
}

/** Advance after every attempt — a miss still consumes the spot. */
export function recordSpotAttempt(spotsCompleted: number): {
  spotsCompleted: number;
  stageComplete: boolean;
} {
  const next = Math.min(SPOTS_PER_STAGE, Math.max(0, spotsCompleted) + 1);
  return { spotsCompleted: next, stageComplete: next >= SPOTS_PER_STAGE };
}

export function nodeProgressFraction(spotsCompleted: number): number {
  return Math.min(1, Math.max(0, spotsCompleted) / SPOTS_PER_STAGE);
}

/** World 1 mock data: four stages laid over Benny's painted garden path. */
export const BENNYS_GARDEN_NODES: readonly MapNode[] = [
  { id: 'bennys-stage-1', number: 1, title: 'Warm-up', chunkIndex: 0, left: '44%', top: '78%' },
  {
    id: 'bennys-stage-2',
    number: 2,
    title: 'The concept',
    chunkIndex: 0,
    left: '31%',
    top: '65%',
  },
  { id: 'bennys-stage-3', number: 3, title: 'Practice', chunkIndex: 0, left: '58%', top: '45%' },
  {
    id: 'bennys-stage-4',
    number: 4,
    title: 'Final challenge',
    chunkIndex: 0,
    left: '43%',
    top: '20%',
  },
];

export function stageStatus(stageNumber: number, completedCount: number): StageStatus {
  if (stageNumber <= completedCount) return 'completed';
  if (stageNumber === completedCount + 1) return 'current';
  return 'locked';
}

export function canEnterStage(
  stageNumber: number,
  completedCount: number,
  remainingChips: number
): boolean {
  return remainingChips > 0 && stageStatus(stageNumber, completedCount) === 'current';
}

/** Walk to any cleared or active node. Locked nodes stay shut. */
export function canStandOn(stageNumber: number, completedCount: number): boolean {
  return stageStatus(stageNumber, completedCount) !== 'locked';
}

export function lockReason(
  stageNumber: number,
  completedCount: number,
  remainingChips: number
): string | null {
  if (remainingChips <= 0 && stageStatus(stageNumber, completedCount) === 'current') {
    return 'Chips are spent. They refill in 12 hours.';
  }
  if (stageStatus(stageNumber, completedCount) === 'locked') {
    return `Finish Stage ${completedCount + 1} first.`;
  }
  return null;
}

export function currentStageNumber(
  completedCount: number,
  nodeCount = BENNYS_GARDEN_NODES.length
): number {
  return Math.min(completedCount + 1, nodeCount);
}

/** Fit the largest exact 9:16 map inside the available area. */
export function fitMap(areaWidth: number, areaHeight: number): { width: number; height: number } {
  if (areaWidth <= 0 || areaHeight <= 0) {
    return { width: 0, height: 0 };
  }
  const areaAspect = areaWidth / areaHeight;
  if (areaAspect > MAP_ASPECT) {
    return { width: areaHeight * MAP_ASPECT, height: areaHeight };
  }
  return { width: areaWidth, height: areaWidth / MAP_ASPECT };
}

export function mapPercentToUnit(value: MapPercent): number {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
    throw new RangeError(`Map percentage must be between 0% and 100%; received "${value}".`);
  }
  return parsed / 100;
}

export function nodePixels(
  node: MapNode,
  map: { width: number; height: number },
  chunkCount = 1
): { x: number; y: number } {
  const chunkTop = (chunkCount - 1 - node.chunkIndex) * map.height;
  return {
    x: mapPercentToUnit(node.left) * map.width,
    y: chunkTop + mapPercentToUnit(node.top) * map.height,
  };
}

export function flattenMapChunks(chunks: readonly MapChunk[]): MapNode[] {
  return chunks.flatMap((chunk) => chunk.nodes);
}

export function chunkIndexForStage(stageNumber: number, chunks: readonly MapChunk[]): number {
  const chunk = chunks.find((candidate) =>
    candidate.nodes.some((node) => node.number === stageNumber)
  );
  return chunk?.index ?? Math.max(0, chunks.length - 1);
}

export function progressChunkIndex(completedCount: number, chunks: readonly MapChunk[]): number {
  const nodeCount = flattenMapChunks(chunks).length;
  return chunkIndexForStage(currentStageNumber(completedCount, nodeCount), chunks);
}

export function levelMarkers(
  completedCount: number,
  nodes: readonly MapNode[] = BENNYS_GARDEN_NODES
): LevelMarker[] {
  return nodes.map((node) => ({
    ...node,
    status: stageStatus(node.number, completedCount),
  }));
}

export function nodeByNumber(
  stageNumber: number,
  nodes: readonly MapNode[] = BENNYS_GARDEN_NODES
): MapNode | undefined {
  return nodes.find((node) => node.number === stageNumber);
}

export function worldBackdrop(placement: Placement): 'garden' | 'casino' {
  return placement === 1 ? 'garden' : 'casino';
}
