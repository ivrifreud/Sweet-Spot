import type { ImageSourcePropType } from 'react-native';
import { Image, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import {
  durationForLength,
  pathLength,
  routeStages,
  svgQuadSegment,
  walkPolyline,
  type Point,
} from '../../lib/track/mapPath';
import {
  MAP_NODE_SIZE,
  levelMarkers,
  mapPercentToUnit,
  nodeByNumber,
  nodePixels,
  stageStatus,
  type MapNode,
} from '../../lib/track/tree';
import { artStyle } from '../../theme/artStyle';
import { MapAvatar, MAP_AVATAR_SIZE } from './MapAvatar';
import { MapCheckpoint } from './MapCheckpoint';
import { WorldMap } from './WorldMap';
import type { EnvironmentDepth, WorldMapTemplate } from './worldMapTemplates';

type Props = {
  width: number;
  height: number;
  currentWorld: WorldMapTemplate;
  activeChunkIndex: number;
  completedCount: number;
  standing: number;
  trail: Point[];
  trailKey: number;
  walkDuration: number;
  avatarSource?: ImageSourcePropType;
  onPressNode: (stageNumber: number) => void;
  onArrived?: () => void;
};

export function avatarAnchor(point: Point): Point {
  return {
    x: point.x - MAP_AVATAR_SIZE / 2,
    y: point.y - MAP_AVATAR_SIZE + 10,
  };
}

export function trailForWalk(
  fromStage: number,
  toStage: number,
  map: { width: number; height: number },
  nodes: readonly MapNode[],
  chunkCount: number
): Point[] {
  const bulge = Math.min(map.width, map.height) * 0.08;
  const stops = routeStages(fromStage, toStage)
    .map((number) => nodeByNumber(number, nodes))
    .filter((node): node is NonNullable<typeof node> => Boolean(node))
    .map((node) => avatarAnchor(nodePixels(node, map, chunkCount)));
  return walkPolyline(stops, bulge);
}

export function walkDurationMs(trail: Point[]): number {
  return durationForLength(pathLength(trail));
}

type EnvironmentLayerProps = {
  depth: EnvironmentDepth;
  width: number;
  height: number;
  world: WorldMapTemplate;
};

function EnvironmentLayer({ depth, width, height, world }: EnvironmentLayerProps) {
  return world.chunks.flatMap((chunk) => {
    const chunkTop = (world.chunks.length - 1 - chunk.index) * height;
    return chunk.environment
      .filter((placement) => placement.depth === depth)
      .map((placement) => {
        const asset = world.environmentAssets[placement.asset];
        return (
          <View
            key={placement.id}
            pointerEvents="none"
            style={[
              styles.environment,
              {
                left: mapPercentToUnit(placement.left) * width,
                top: chunkTop + mapPercentToUnit(placement.top) * height,
                width: mapPercentToUnit(placement.width) * width,
                aspectRatio: asset.aspectRatio,
                transform: [{ scaleX: placement.mirrored ? -1 : 1 }],
                zIndex: depth === 'foreground' ? 12 : 3,
              },
            ]}>
            <Image
              source={asset.source}
              resizeMode="contain"
              accessible={false}
              style={styles.environmentImage}
            />
          </View>
        );
      });
  });
}

/**
 * Shared world-map mechanic: dynamic art, dotted ink trail, chip checkpoints,
 * and the player's avatar. Each world supplies percentage-based coordinates.
 */
export function LevelProgressionMap({
  width,
  height,
  currentWorld,
  activeChunkIndex,
  completedCount,
  standing,
  trail,
  trailKey,
  walkDuration,
  avatarSource,
  onPressNode,
  onArrived,
}: Props) {
  const bulge = Math.min(width, height) * 0.08;
  const chunkCount = currentWorld.chunks.length;
  const contentHeight = height * chunkCount;
  const markers = levelMarkers(completedCount, currentWorld.nodes);
  const pixelStops = currentWorld.nodes.map((node) =>
    nodePixels(node, { width, height }, chunkCount)
  );
  const standingNode = nodeByNumber(standing, currentWorld.nodes) ?? currentWorld.nodes[0]!;
  const standingPoint = avatarAnchor(nodePixels(standingNode, { width, height }, chunkCount));

  return (
    <WorldMap
      width={width}
      height={height}
      world={currentWorld}
      activeChunkIndex={activeChunkIndex}>
      <View collapsable={false} style={[styles.mapLayer, { width, height: contentHeight }]}>
        <Svg width={width} height={contentHeight} style={styles.pathLayer} pointerEvents="none">
          {pixelStops.slice(1).map((to, index) => {
            const from = pixelStops[index]!;
            const d = svgQuadSegment(from, to, index, bulge);
            return (
              <Path
                key={`path-under-${index}`}
                d={d}
                stroke={artStyle.colors.projectorBlack}
                strokeWidth={12}
                strokeLinecap="round"
                strokeDasharray="1 17"
                fill="none"
                opacity={0.82}
              />
            );
          })}
          {currentWorld.nodes.slice(1).map((toNode, index) => {
            const from = pixelStops[index]!;
            const to = pixelStops[index + 1]!;
            const opened = stageStatus(toNode.number, completedCount) !== 'locked';
            const d = svgQuadSegment(from, to, index, bulge);
            return (
              <Path
                key={`path-${index}`}
                d={d}
                stroke={opened ? artStyle.colors.gold : artStyle.colors.cream}
                strokeWidth={6}
                strokeLinecap="round"
                strokeDasharray="1 17"
                fill="none"
                opacity={opened ? 0.96 : 0.38}
              />
            );
          })}
        </Svg>

        <EnvironmentLayer depth="rear" width={width} height={height} world={currentWorld} />

        {markers.map((marker) => {
          const point = nodePixels(marker, { width, height }, chunkCount);
          return (
            <View
              key={marker.id}
              collapsable={false}
              accessibilityElementsHidden={marker.chunkIndex !== activeChunkIndex}
              importantForAccessibility={
                marker.chunkIndex === activeChunkIndex ? 'auto' : 'no-hide-descendants'
              }
              style={[
                styles.nodeAnchor,
                {
                  left: point.x - MAP_NODE_SIZE / 2,
                  top: point.y - MAP_NODE_SIZE / 2,
                },
              ]}>
              <MapCheckpoint
                number={marker.number}
                title={marker.title}
                status={marker.status}
                onPress={() => onPressNode(marker.number)}
              />
            </View>
          );
        })}

        <MapAvatar
          x={standingPoint.x}
          y={standingPoint.y}
          trail={trail}
          trailKey={trailKey}
          duration={walkDuration}
          source={avatarSource}
          onArrived={onArrived}
        />

        <EnvironmentLayer depth="foreground" width={width} height={height} world={currentWorld} />
      </View>
    </WorldMap>
  );
}

const styles = StyleSheet.create({
  mapLayer: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  pathLayer: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 2,
  },
  nodeAnchor: {
    position: 'absolute',
    zIndex: 4,
  },
  environment: {
    position: 'absolute',
  },
  environmentImage: {
    width: '100%',
    height: '100%',
  },
});
