import { mapNodeMetrics, nodePixels, type MapNode } from '../track/tree';

export type Rect = { left: number; top: number; right: number; bottom: number };

export const RAIL_SAFE_ZONE_HEIGHT = 72;

/** Circular node footprint (no title caption under the chip). */
export function nodeLabelRect(
  node: MapNode,
  map: { width: number; height: number },
  chunkCount: number
): Rect {
  const point = nodePixels(node, map, chunkCount);
  const ring = mapNodeMetrics(map.width).ring;
  const left = point.x - ring / 2;
  const top = point.y - ring / 2;
  return {
    left,
    top,
    right: left + ring,
    bottom: top + ring,
  };
}

export function rectsOverlap(a: Rect, b: Rect, gap = 4): boolean {
  return !(
    a.right + gap <= b.left ||
    b.right + gap <= a.left ||
    a.bottom + gap <= b.top ||
    b.bottom + gap <= a.top
  );
}

export function findOverlappingNodePairs(
  nodes: readonly MapNode[],
  map: { width: number; height: number },
  chunkCount: number
): Array<[string, string]> {
  const rects = nodes.map((node) => ({
    id: node.id,
    rect: nodeLabelRect(node, map, chunkCount),
  }));
  const overlaps: Array<[string, string]> = [];
  for (let i = 0; i < rects.length; i += 1) {
    for (let j = i + 1; j < rects.length; j += 1) {
      if (rectsOverlap(rects[i]!.rect, rects[j]!.rect)) {
        overlaps.push([rects[i]!.id, rects[j]!.id]);
      }
    }
  }
  return overlaps;
}

/** Nodes whose ring intersects the top rail safe zone on the active chunk. */
export function nodesUnderRailSafeZone(
  nodes: readonly MapNode[],
  map: { width: number; height: number },
  activeChunkIndex: number,
  chunkCount: number,
  safeHeight = RAIL_SAFE_ZONE_HEIGHT
): string[] {
  const rail: Rect = {
    left: 0,
    top: activeChunkIndex * map.height,
    right: map.width,
    bottom: activeChunkIndex * map.height + safeHeight,
  };
  return nodes
    .filter((node) => node.chunkIndex === activeChunkIndex)
    .filter((node) => rectsOverlap(nodeLabelRect(node, map, chunkCount), rail, 0))
    .map((node) => node.id);
}

export function nodeChipSizeIsTarget(mapWidth = 390): boolean {
  return mapNodeMetrics(mapWidth).chip === mapNodeMetrics(390).chip && mapNodeMetrics(390).chip === 53;
}
