import {
  BENNYS_GARDEN_ROUTES,
  type GardenMapVariantId,
  type GardenRoutePoint,
} from './bennysGardenRoads';
import { svgPolyline, type Point } from './mapPath';
import { MAP_NODES_PER_CHUNK, type MapNode, type MapPercent } from './tree';

export type GardenChunkLayout = {
  variantId: GardenMapVariantId;
  route: readonly GardenRoutePoint[];
  nodes: MapNode[];
};

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

/** Distance bands along the authored polyline, bottom entrance toward the top exit. */
const NODE_DISTANCE_RANGES = [
  { min: 0.1, max: 0.26 },
  { min: 0.32, max: 0.46 },
  { min: 0.54, max: 0.68 },
  { min: 0.76, max: 0.9 },
] as const;

export function routeStepLengths(route: readonly GardenRoutePoint[]): number[] {
  const steps: number[] = [];
  for (let i = 1; i < route.length; i += 1) {
    const from = route[i - 1]!;
    const to = route[i]!;
    steps.push(Math.hypot(to.left - from.left, to.top - from.top));
  }
  return steps;
}

export function routeDistances(route: readonly GardenRoutePoint[]): number[] {
  const distances = [0];
  let total = 0;
  for (const step of routeStepLengths(route)) {
    total += step;
    distances.push(total);
  }
  return distances;
}

export function isOnRoute(
  left: number,
  top: number,
  route: readonly GardenRoutePoint[],
  maxDistance = 3.2
): boolean {
  return route.some((point) => Math.hypot(point.left - left, point.top - top) <= maxDistance);
}

export function nearestRouteIndex(
  left: number,
  top: number,
  route: readonly GardenRoutePoint[]
): number {
  let best = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  route.forEach((point, index) => {
    const distance = Math.hypot(point.left - left, point.top - top);
    if (distance < bestDistance) {
      best = index;
      bestDistance = distance;
    }
  });
  return best;
}

export function pickGardenVariant(
  previous: GardenMapVariantId | null,
  rng: () => number,
  ids: readonly GardenMapVariantId[] = GARDEN_VARIANTS
): GardenMapVariantId {
  const pool = previous ? ids.filter((id) => id !== previous) : [...ids];
  const index = Math.min(pool.length - 1, Math.max(0, Math.floor(rng() * pool.length)));
  return pool[index]!;
}

function asPercent(value: number): MapPercent {
  return `${value}%`;
}

function anchorsInRange(
  route: readonly GardenRoutePoint[],
  distances: readonly number[],
  min: number,
  max: number
): number[] {
  const total = distances[distances.length - 1] || 1;
  const indexes: number[] = [];
  for (let i = 0; i < route.length; i += 1) {
    const progress = distances[i]! / total;
    if (progress < min || progress > max) continue;
    if (!route[i]!.nodeSafe) continue;
    indexes.push(i);
  }
  return indexes;
}

export function pickRouteNodes(
  route: readonly GardenRoutePoint[],
  count: number,
  rng: () => number
): { left: MapPercent; top: MapPercent; routeIndex: number }[] {
  if (route.length === 0) {
    throw new Error('Cannot place level nodes without a route.');
  }
  const distances = routeDistances(route);
  const bands = NODE_DISTANCE_RANGES.slice(0, Math.max(0, count));
  return bands.map((band) => {
    let pool = anchorsInRange(route, distances, band.min, band.max);
    if (pool.length === 0) {
      pool = anchorsInRange(
        route,
        distances,
        Math.max(0, band.min - 0.08),
        Math.min(1, band.max + 0.08)
      );
    }
    if (pool.length === 0) {
      throw new Error('Level node left the authored road-and-bridge route.');
    }
    const routeIndex =
      pool[Math.min(pool.length - 1, Math.max(0, Math.floor(rng() * pool.length)))]!;
    const point = route[routeIndex]!;
    if (!isOnRoute(point.left, point.top, route)) {
      throw new Error('Level node left the authored road-and-bridge route.');
    }
    return { left: asPercent(point.left), top: asPercent(point.top), routeIndex };
  });
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

export function routePointPixels(
  point: Pick<GardenRoutePoint, 'left' | 'top'>,
  chunkIndex: number,
  map: { width: number; height: number },
  chunkCount: number
): Point {
  const chunkTop = (chunkCount - 1 - chunkIndex) * map.height;
  return {
    x: (point.left / 100) * map.width,
    y: chunkTop + (point.top / 100) * map.height,
  };
}

export function routePixels(
  route: readonly GardenRoutePoint[],
  chunkIndex: number,
  map: { width: number; height: number },
  chunkCount: number
): Point[] {
  return route.map((point) => routePointPixels(point, chunkIndex, map, chunkCount));
}

function subpathIndexes(fromIndex: number, toIndex: number): number[] {
  const step = fromIndex <= toIndex ? 1 : -1;
  const indexes: number[] = [];
  for (let i = fromIndex; i !== toIndex; i += step) indexes.push(i);
  indexes.push(toIndex);
  return indexes;
}

type RoutedChunk = {
  index: number;
  route: readonly GardenRoutePoint[];
};

function nodeRouteIndex(node: MapNode, route: readonly GardenRoutePoint[]): number {
  if (node.routeIndex != null && node.routeIndex >= 0 && node.routeIndex < route.length) {
    return node.routeIndex;
  }
  return nearestRouteIndex(Number.parseFloat(node.left), Number.parseFloat(node.top), route);
}

export function routeSegmentPixels(
  from: MapNode,
  to: MapNode,
  map: { width: number; height: number },
  chunks: readonly RoutedChunk[]
): Point[] {
  const fromChunk = chunks.find((chunk) => chunk.index === from.chunkIndex);
  const toChunk = chunks.find((chunk) => chunk.index === to.chunkIndex);
  if (!fromChunk?.route.length || !toChunk?.route.length) {
    return [
      routePointPixels(
        { left: Number.parseFloat(from.left), top: Number.parseFloat(from.top) },
        from.chunkIndex,
        map,
        chunks.length
      ),
      routePointPixels(
        { left: Number.parseFloat(to.left), top: Number.parseFloat(to.top) },
        to.chunkIndex,
        map,
        chunks.length
      ),
    ];
  }

  if (from.chunkIndex === to.chunkIndex) {
    const start = nodeRouteIndex(from, fromChunk.route);
    const end = nodeRouteIndex(to, fromChunk.route);
    return subpathIndexes(start, end).map((index) =>
      routePointPixels(fromChunk.route[index]!, from.chunkIndex, map, chunks.length)
    );
  }

  const climbing = from.chunkIndex < to.chunkIndex;
  const leaving = subpathIndexes(
    nodeRouteIndex(from, fromChunk.route),
    climbing ? fromChunk.route.length - 1 : 0
  ).map((index) => routePointPixels(fromChunk.route[index]!, from.chunkIndex, map, chunks.length));
  const entering = subpathIndexes(
    climbing ? 0 : toChunk.route.length - 1,
    nodeRouteIndex(to, toChunk.route)
  ).map((index) => routePointPixels(toChunk.route[index]!, to.chunkIndex, map, chunks.length));
  return [...leaving, ...entering];
}

export function walkGardenTrail(
  fromStage: number,
  toStage: number,
  map: { width: number; height: number },
  nodes: readonly MapNode[],
  chunks: readonly RoutedChunk[]
): Point[] {
  if (fromStage === toStage) return [];
  const step = fromStage < toStage ? 1 : -1;
  const points: Point[] = [];
  for (let stage = fromStage; stage !== toStage; stage += step) {
    const from = nodes.find((node) => node.number === stage);
    const to = nodes.find((node) => node.number === stage + step);
    if (!from || !to) continue;
    const segment = routeSegmentPixels(from, to, map, chunks);
    if (points.length > 0) segment.shift();
    points.push(...segment);
  }
  return points;
}

export function svgRouteSegment(
  from: MapNode,
  to: MapNode,
  map: { width: number; height: number },
  chunks: readonly RoutedChunk[]
): string {
  return svgPolyline(routeSegmentPixels(from, to, map, chunks));
}
