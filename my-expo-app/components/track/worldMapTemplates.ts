import type { ImageSourcePropType } from 'react-native';

import type { GardenRoutePoint } from '../../lib/track/bennysGardenRoads';
import { createGardenChunkLayouts } from '../../lib/track/gardenMap';
import { flattenMapChunks, type MapChunk, type MapNode } from '../../lib/track/tree';

export type WorldMapId = 'bennys-garden' | 'local-casino' | 'vip-room';

export type WorldMapIdentity = {
  id: WorldMapId;
  name: string;
  chapter: string;
  artDirection: string;
};

export type WorldMapChunk = MapChunk & {
  variantId: string;
  background: ImageSourcePropType;
  route: readonly GardenRoutePoint[];
};

export type WorldMapAsset = {
  source: ImageSourcePropType;
  aspectRatio: number;
};

export type WorldMapTemplate = WorldMapIdentity & {
  chunks: readonly WorldMapChunk[];
  nodes: readonly MapNode[];
  fogAssets: {
    left: WorldMapAsset;
    right: WorldMapAsset;
  };
};

export type WorldMapScaffold = WorldMapIdentity & {
  status: 'art-required';
  expectedAsset: string;
};

const BENNYS_GARDEN_IDENTITY: WorldMapIdentity = {
  id: 'bennys-garden',
  name: "Benny's Garden",
  chapter: 'The Learning Stage',
  artDirection:
    'Welcoming 1930s backyard club with painted trees, fence, table, radio, and string bulbs.',
};

const BENNYS_GARDEN_MAPS = {
  a: require('../../assets/themes/bennys-garden/map-chunk-a.jpg'),
  b: require('../../assets/themes/bennys-garden/map-chunk-b.jpg'),
  c: require('../../assets/themes/bennys-garden/map-chunk-c.jpg'),
} as const;

const BENNYS_GARDEN_FOG: WorldMapTemplate['fogAssets'] = {
  left: {
    source: require('../../assets/themes/bennys-garden/fog-clouds-left.png'),
    aspectRatio: 768 / 669,
  },
  right: {
    source: require('../../assets/themes/bennys-garden/fog-clouds-right.png'),
    aspectRatio: 768 / 665,
  },
};

/** Every world uses this factory; only art, chunks, and fog change. */
export function createWorldMapTemplate(
  identity: WorldMapIdentity,
  chunks: readonly WorldMapChunk[],
  fogAssets: WorldMapTemplate['fogAssets']
): WorldMapTemplate {
  const nodes = flattenMapChunks(chunks);
  if (nodes.length === 0) {
    throw new Error(`World map "${identity.id}" must define at least one checkpoint.`);
  }
  return { ...identity, chunks, nodes, fogAssets };
}

export function createBennysGardenChunks(
  totalLevels = 12,
  rng: () => number = Math.random
): WorldMapChunk[] {
  return createGardenChunkLayouts(totalLevels, rng).map((layout) => ({
    id: `bennys-chunk-${layout.nodes[0]!.chunkIndex + 1}`,
    index: layout.nodes[0]!.chunkIndex,
    variantId: layout.variantId,
    background: BENNYS_GARDEN_MAPS[layout.variantId],
    route: layout.route,
    nodes: layout.nodes,
  }));
}

export function createBennysGardenWorld(
  totalLevels = 12,
  rng: () => number = Math.random
): WorldMapTemplate {
  return createWorldMapTemplate(
    BENNYS_GARDEN_IDENTITY,
    createBennysGardenChunks(totalLevels, rng),
    BENNYS_GARDEN_FOG
  );
}

export const BENNYS_GARDEN_WORLD = createBennysGardenWorld();

/**
 * Typed promotion points for later worlds. They intentionally have no fallback
 * image: non-canonical art must never silently ship in place of a world map.
 */
export const WORLD_MAP_SCAFFOLDS = {
  localCasino: {
    id: 'local-casino',
    name: 'Local Casino',
    chapter: 'Transition to Real Money',
    artDirection:
      'Inked period casino hall with Art Deco signs, brass rails, and incandescent marquee bulbs.',
    status: 'art-required',
    expectedAsset: 'assets/themes/local-casino/light-mobile.png',
  },
  vipRoom: {
    id: 'vip-room',
    name: 'VIP Room',
    chapter: 'Psychological Precision',
    artDirection:
      'Gouache Art Deco club with velvet, marble patterns, brass lamps, city windows, and negative space.',
    status: 'art-required',
    expectedAsset: 'assets/themes/vip-room/light-mobile.png',
  },
} as const satisfies Record<string, WorldMapScaffold>;
