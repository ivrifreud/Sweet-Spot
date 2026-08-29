import type { ImageSourcePropType } from 'react-native';

import {
  BENNYS_GARDEN_NODES,
  MAP_NODES_PER_CHUNK,
  flattenMapChunks,
  type MapChunk,
  type MapNode,
  type MapPercent,
} from '../../lib/track/tree';

export type WorldMapId = 'bennys-garden' | 'local-casino' | 'vip-room';
export type EnvironmentAssetKey = 'tree' | 'bush' | 'fence';
export type EnvironmentDepth = 'rear' | 'foreground';

export type WorldMapIdentity = {
  id: WorldMapId;
  name: string;
  chapter: string;
  artDirection: string;
};

export type EnvironmentPlacement = {
  id: string;
  asset: EnvironmentAssetKey;
  depth: EnvironmentDepth;
  left: MapPercent;
  top: MapPercent;
  width: MapPercent;
  mirrored?: boolean;
};

export type WorldMapChunk = MapChunk & {
  environment: readonly EnvironmentPlacement[];
};

export type WorldMapAsset = {
  source: ImageSourcePropType;
  aspectRatio: number;
};

export type WorldMapTemplate = WorldMapIdentity & {
  background: ImageSourcePropType;
  chunks: readonly WorldMapChunk[];
  nodes: readonly MapNode[];
  environmentAssets: Record<EnvironmentAssetKey, WorldMapAsset>;
  fogAssets: {
    left: WorldMapAsset;
    right: WorldMapAsset;
  };
};

export type WorldMapScaffold = WorldMapIdentity & {
  status: 'art-required';
  expectedAsset: string;
};

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

const CHUNK_POSITIONS: readonly { left: MapPercent; top: MapPercent }[] = [
  { left: '44%', top: '78%' },
  { left: '31%', top: '65%' },
  { left: '58%', top: '45%' },
  { left: '43%', top: '20%' },
];

function environmentForChunk(chunkIndex: number): EnvironmentPlacement[] {
  const mirrored = chunkIndex % 2 === 1;
  return [
    {
      id: `chunk-${chunkIndex}-rear-bush`,
      asset: 'bush',
      depth: 'rear',
      left: mirrored ? '58%' : '3%',
      top: '51%',
      width: '38%',
      mirrored,
    },
    {
      id: `chunk-${chunkIndex}-rear-fence`,
      asset: 'fence',
      depth: 'rear',
      left: mirrored ? '4%' : '60%',
      top: '74%',
      width: '36%',
      mirrored,
    },
    {
      id: `chunk-${chunkIndex}-foreground-tree`,
      asset: 'tree',
      depth: 'foreground',
      // Put the trunk across the node 2 → 3 curve so Benny visibly walks
      // behind it; mirrored chunks cross the reflected path at the same beat.
      left: mirrored ? '52%' : '20%',
      top: '39%',
      width: '28%',
      mirrored,
    },
    {
      id: `chunk-${chunkIndex}-foreground-bush`,
      asset: 'bush',
      depth: 'foreground',
      left: mirrored ? '57%' : '4%',
      top: '77%',
      width: '42%',
      mirrored: !mirrored,
    },
  ];
}

/** Builds as many four-node Benny chunks as the track needs. */
export function createBennysGardenChunks(totalLevels = 12): WorldMapChunk[] {
  if (!Number.isInteger(totalLevels) || totalLevels <= 0) {
    throw new RangeError('Benny’s Garden requires a positive integer level count.');
  }

  const chunkCount = Math.ceil(totalLevels / MAP_NODES_PER_CHUNK);
  return Array.from({ length: chunkCount }, (_, chunkIndex) => {
    const firstStage = chunkIndex * MAP_NODES_PER_CHUNK + 1;
    const nodeCount = Math.min(MAP_NODES_PER_CHUNK, totalLevels - firstStage + 1);
    const mirrored = chunkIndex % 2 === 1;
    const nodes =
      chunkIndex === 0
        ? BENNYS_GARDEN_NODES.slice(0, nodeCount)
        : Array.from({ length: nodeCount }, (__, nodeIndex) => {
            const number = firstStage + nodeIndex;
            const position = CHUNK_POSITIONS[nodeIndex]!;
            const leftValue = Number.parseFloat(position.left);
            const left = `${mirrored ? 100 - leftValue : leftValue}%` as MapPercent;
            return {
              id: `bennys-stage-${number}`,
              number,
              title: BENNYS_STAGE_TITLES[number - 1] ?? `Stage ${number}`,
              chunkIndex,
              left,
              top: position.top,
            };
          });

    return {
      id: `bennys-chunk-${chunkIndex + 1}`,
      index: chunkIndex,
      nodes,
      environment: environmentForChunk(chunkIndex),
    };
  });
}

/** Every world uses this factory; only art, chunks, and depth placements change. */
export function createWorldMapTemplate(
  identity: WorldMapIdentity,
  background: ImageSourcePropType,
  chunks: readonly WorldMapChunk[],
  environmentAssets: Record<EnvironmentAssetKey, WorldMapAsset>,
  fogAssets: WorldMapTemplate['fogAssets']
): WorldMapTemplate {
  const nodes = flattenMapChunks(chunks);
  if (nodes.length === 0) {
    throw new Error(`World map "${identity.id}" must define at least one checkpoint.`);
  }
  return { ...identity, background, chunks, nodes, environmentAssets, fogAssets };
}

const BENNYS_GARDEN_IDENTITY: WorldMapIdentity = {
  id: 'bennys-garden',
  name: "Benny's Garden",
  chapter: 'The Learning Stage',
  artDirection:
    'Welcoming 1930s backyard club with painted trees, fence, table, radio, and string bulbs.',
};

const BENNYS_GARDEN_ENVIRONMENT: Record<EnvironmentAssetKey, WorldMapAsset> = {
  tree: {
    source: require('../../assets/themes/bennys-garden/foreground-tree.png'),
    aspectRatio: 929 / 968,
  },
  bush: {
    source: require('../../assets/themes/bennys-garden/foreground-bush.png'),
    aspectRatio: 1002 / 472,
  },
  fence: {
    source: require('../../assets/themes/bennys-garden/foreground-fence.png'),
    aspectRatio: 1291 / 746,
  },
};

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

export function createBennysGardenWorld(totalLevels = 12): WorldMapTemplate {
  return createWorldMapTemplate(
    BENNYS_GARDEN_IDENTITY,
    require('../../assets/themes/bennys-garden/map-chunk-light.png'),
    createBennysGardenChunks(totalLevels),
    BENNYS_GARDEN_ENVIRONMENT,
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
