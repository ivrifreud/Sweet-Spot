import { svgPolyline, type Point } from './mapPath';
import type { MapNode, MapPercent } from './tree';
import type { WorldRoutePoint } from './worldRoute';

export type RoutedChunk = {
  index: number;
  route: readonly WorldRoutePoint[];
};

export function routeStepLengths(route: readonly WorldRoutePoint[]): number[] {
  const steps: number[] = [];
  for (let i = 1; i < route.length; i += 1) {
    const from = route[i - 1]!;
    const to = route[i]!;
    steps.push(Math.hypot(to.left - from.left, to.top - from.top));
  }
  return steps;
}

export function routeDistances(route: readonly WorldRoutePoint[]): number[] {
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
  route: readonly WorldRoutePoint[],
  maxDistance = 3.2
): boolean {
  return route.some((point) => Math.hypot(point.left - left, point.top - top) <= maxDistance);
}

export function nearestRouteIndex(
  left: number,
  top: number,
  route: readonly WorldRoutePoint[]
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

function asPercent(value: number): MapPercent {
  return `${value}%`;
}

function landingIndexesOn(route: readonly WorldRoutePoint[]): number[] {
  return route
    .map((point, index) => (point.landing && point.nodeSafe ? index : -1))
    .filter((index) => index >= 0);
}

function safeRoadIndexesOn(route: readonly WorldRoutePoint[]): number[] {
  return route
    .map((point, index) =>
      point.nodeSafe && point.surface === 'road' && !point.landing ? index : -1
    )
    .filter((index) => index >= 0);
}

/** Pick `count` indexes spread along a sorted list so extra landings do not crash. */
export function spreadIndexes(indexes: readonly number[], count: number): number[] {
  if (count <= 0 || indexes.length === 0) return [];
  if (indexes.length <= count) return [...indexes];
  const used = new Set<number>();
  const picked: number[] = [];
  for (let i = 0; i < count; i += 1) {
    const t = count === 1 ? 0 : i / (count - 1);
    let at = Math.round(t * (indexes.length - 1));
    while (used.has(at) && at < indexes.length - 1) at += 1;
    while (used.has(at) && at > 0) at -= 1;
    used.add(at);
    picked.push(indexes[at]!);
  }
  return picked.sort((left, right) => left - right);
}

function spotsFromIndexes(
  route: readonly WorldRoutePoint[],
  indexes: readonly number[]
): { left: MapPercent; top: MapPercent; routeIndex: number }[] {
  return indexes.map((routeIndex) => {
    const point = route[routeIndex]!;
    return { left: asPercent(point.left), top: asPercent(point.top), routeIndex };
  });
}

export function landingClusters(route: readonly WorldRoutePoint[]): number[][] {
  const clusters: number[][] = [];
  const grouped = new Map<string, number[]>();
  for (let i = 0; i < route.length; i += 1) {
    const point = route[i]!;
    if (!point.landing || !point.nodeSafe) continue;
    if (point.landingGroup) {
      let cluster = grouped.get(point.landingGroup);
      if (!cluster) {
        cluster = [];
        grouped.set(point.landingGroup, cluster);
        clusters.push(cluster);
      }
      cluster.push(i);
      continue;
    }
    clusters.push([i]);
  }
  return clusters;
}

export function pickRouteNodes(
  route: readonly WorldRoutePoint[],
  count: number,
  rng: () => number
): { left: MapPercent; top: MapPercent; routeIndex: number }[] {
  if (route.length === 0) {
    throw new Error('Cannot place level nodes without a route.');
  }
  const clusters = landingClusters(route);
  if (clusters.length === count) {
    return clusters.map((indexes) => {
      const routeIndex =
        indexes[Math.min(indexes.length - 1, Math.max(0, Math.floor(rng() * indexes.length)))]!;
      const point = route[routeIndex]!;
      return { left: asPercent(point.left), top: asPercent(point.top), routeIndex };
    });
  }
  const landingIndexes = landingIndexesOn(route);
  if (landingIndexes.length >= count) {
    return spotsFromIndexes(route, spreadIndexes(landingIndexes, count));
  }
  const fill = [...landingIndexes];
  for (const index of safeRoadIndexesOn(route)) {
    if (fill.length >= count) break;
    fill.push(index);
  }
  fill.sort((left, right) => left - right);
  if (fill.length >= count) {
    return spotsFromIndexes(route, fill.slice(0, count));
  }
  throw new Error(
    `Need ${count} road landings but this map only has ${fill.length}. Add landing(left, top) points.`
  );
}

export function routePointPixels(
  point: Pick<WorldRoutePoint, 'left' | 'top'>,
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
  route: readonly WorldRoutePoint[],
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

function nodeRouteIndex(node: MapNode, route: readonly WorldRoutePoint[]): number {
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

export function walkWorldTrail(
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
