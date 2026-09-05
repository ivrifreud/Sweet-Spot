import { LOCAL_CASINO_ROUTES, type LocalCasinoMapVariantId } from './localCasinoRoads';
import { MAP_NODES_PER_CHUNK, type MapNode } from './tree';
import { pickRouteNodes } from './worldMapGeometry';
import type { WorldRoutePoint } from './worldRoute';

export type LocalCasinoChunkLayout = {
  variantId: LocalCasinoMapVariantId;
  route: readonly WorldRoutePoint[];
  nodes: MapNode[];
};

const LOCAL_CASINO_VARIANTS: readonly LocalCasinoMapVariantId[] = ['a', 'b', 'c'];

const LOCAL_CASINO_STAGE_TITLES = [
  'Town gate',
  'Saloon row',
  'Hitching rail',
  'Water tower',
  'General store',
  "Sheriff's office",
  'Boardwalk',
  'Wagon yard',
  'Depot',
  'Casino rise',
  'Marquee approach',
  'A Local Casino',
] as const;

const STABLE_NODE_RNG = () => 0.5;

export function createLocalCasinoChunkLayouts(totalLevels = 12): LocalCasinoChunkLayout[] {
  if (!Number.isInteger(totalLevels) || totalLevels <= 0) {
    throw new RangeError('A Local Casino requires a positive integer level count.');
  }

  const chunkCount = Math.ceil(totalLevels / MAP_NODES_PER_CHUNK);
  return Array.from({ length: chunkCount }, (_, chunkIndex) => {
    const variantId = LOCAL_CASINO_VARIANTS[chunkIndex % LOCAL_CASINO_VARIANTS.length]!;
    const route = LOCAL_CASINO_ROUTES[variantId];
    const firstStage = chunkIndex * MAP_NODES_PER_CHUNK + 1;
    const nodeCount = Math.min(MAP_NODES_PER_CHUNK, totalLevels - firstStage + 1);
    const spots = pickRouteNodes(route, nodeCount, STABLE_NODE_RNG);
    const nodes = spots.map((spot, nodeIndex) => {
      const number = firstStage + nodeIndex;
      return {
        id: `local-casino-stage-${number}`,
        number,
        title: LOCAL_CASINO_STAGE_TITLES[number - 1] ?? `Stage ${number}`,
        chunkIndex,
        left: spot.left,
        top: spot.top,
        routeIndex: spot.routeIndex,
      };
    });
    return { variantId, route, nodes };
  });
}
