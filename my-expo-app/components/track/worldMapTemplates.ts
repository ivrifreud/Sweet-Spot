import type { ImageSourcePropType } from 'react-native';

import { createGardenChunkLayouts } from '../../lib/track/gardenMap';
import { createLocalCasinoChunkLayouts } from '../../lib/track/localCasinoMap';
import { flattenMapChunks, type MapChunk, type MapNode } from '../../lib/track/tree';
import type { WorldRoutePoint } from '../../lib/track/worldRoute';

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
  route: readonly WorldRoutePoint[];
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

const LOCAL_CASINO_IDENTITY: WorldMapIdentity = {
  id: 'local-casino',
  name: 'A Local Casino',
  chapter: 'Transition to Real Money',
  artDirection:
    'Outdoor 1930s Wild West desert town that climbs to the Local Casino façade; interiors stay off the map.',
};

const LOCAL_CASINO_MAPS = {
  a: require('../../assets/themes/local-casino/map-chunk-a.jpg'),
  b: require('../../assets/themes/local-casino/map-chunk-b.jpg'),
  c: require('../../assets/themes/local-casino/map-chunk-c.jpg'),
} as const;

const LOCAL_CASINO_HAZE: WorldMapTemplate['fogAssets'] = {
  left: {
    source: require('../../assets/themes/local-casino/map-haze-left.png'),
    aspectRatio: 576 / 1024,
  },
  right: {
    source: require('../../assets/themes/local-casino/map-haze-right.png'),
    aspectRatio: 576 / 1024,
  },
};

export function createLocalCasinoChunks(totalLevels = 12): WorldMapChunk[] {
  return createLocalCasinoChunkLayouts(totalLevels).map((layout) => ({
    id: `local-casino-chunk-${layout.nodes[0]!.chunkIndex + 1}`,
    index: layout.nodes[0]!.chunkIndex,
    variantId: layout.variantId,
    background: LOCAL_CASINO_MAPS[layout.variantId],
    route: layout.route,
    nodes: layout.nodes,
  }));
}

export function createLocalCasinoWorld(totalLevels = 12): WorldMapTemplate {
  return createWorldMapTemplate(
    LOCAL_CASINO_IDENTITY,
    createLocalCasinoChunks(totalLevels),
    LOCAL_CASINO_HAZE
  );
}

export const LOCAL_CASINO_WORLD = createLocalCasinoWorld();

/**
 * Typed promotion points for later worlds. They intentionally have no fallback
 * image: non-canonical art must never silently ship in place of a world map.
 */
export const WORLD_MAP_SCAFFOLDS = {
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
