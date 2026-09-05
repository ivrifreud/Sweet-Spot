import {
  BENNYS_GARDEN_ROUTES,
  type GardenMapVariantId,
  type GardenRoutePoint,
} from './bennysGardenRoads';
import { MAP_NODES_PER_CHUNK, type MapNode } from './tree';
import { pickRouteNodes, walkWorldTrail } from './worldMapGeometry';

export type GardenChunkLayout = {
  variantId: GardenMapVariantId;
  route: readonly GardenRoutePoint[];
  nodes: MapNode[];
};

export {
  isOnRoute,
  nearestRouteIndex,
  pickRouteNodes,
  routeDistances,
  routePixels,
  routePointPixels,
  routeSegmentPixels,
  routeStepLengths,
  svgRouteSegment,
  walkWorldTrail,
} from './worldMapGeometry';

export const walkGardenTrail = walkWorldTrail;

const GARDEN_VARIANTS: readonly GardenMapVariantId[] = ['a', 'b', 'c'];

const BENNYS_STAGE_TITLES = [
  'Warm-up',
  'The concept',
  'Practice',
  'Final challenge',
  'Garden gate',
  'Potting shed',
  'River bend',
  'Orchard trial',
  'String lights',
  'Hedge maze',
  'Old oak',
  'Garden finale',
] as const;

export function pickGardenVariant(
  previous: GardenMapVariantId | null,
  rng: () => number,
  ids: readonly GardenMapVariantId[] = GARDEN_VARIANTS
): GardenMapVariantId {
  const pool = previous ? ids.filter((id) => id !== previous) : [...ids];
  const index = Math.min(pool.length - 1, Math.max(0, Math.floor(rng() * pool.length)));
  return pool[index]!;
}

export function createGardenChunkLayouts(
  totalLevels = 12,
  rng: () => number = Math.random
): GardenChunkLayout[] {
  if (!Number.isInteger(totalLevels) || totalLevels <= 0) {
    throw new RangeError("Benny's Garden requires a positive integer level count.");
  }

  const chunkCount = Math.ceil(totalLevels / MAP_NODES_PER_CHUNK);
  let previous: GardenMapVariantId | null = null;
  return Array.from({ length: chunkCount }, (_, chunkIndex) => {
    const variantId = pickGardenVariant(previous, rng);
    previous = variantId;
    const route = BENNYS_GARDEN_ROUTES[variantId];
    const firstStage = chunkIndex * MAP_NODES_PER_CHUNK + 1;
    const nodeCount = Math.min(MAP_NODES_PER_CHUNK, totalLevels - firstStage + 1);
    const spots = pickRouteNodes(route, nodeCount, rng);
    const nodes = spots.map((spot, nodeIndex) => {
      const number = firstStage + nodeIndex;
      return {
        id: `bennys-stage-${number}`,
        number,
        title: BENNYS_STAGE_TITLES[number - 1] ?? `Stage ${number}`,
        chunkIndex,
        left: spot.left,
        top: spot.top,
        routeIndex: spot.routeIndex,
      };
    });
    return { variantId, route, nodes };
  });
}
