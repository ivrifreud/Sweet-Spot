import type { ImageSourcePropType } from 'react-native';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { svgRouteSegment, walkGardenTrail } from '../../lib/track/gardenMap';
import type { FogPhase } from '../../lib/track/fogCycle';
import { durationForLength, pathLength, type Point } from '../../lib/track/mapPath';
import {
  CAMERA_CLIMB_MS,
  MAP_NODE_SIZE,
  levelMarkers,
  nodeByNumber,
  nodePixels,
  stageStatus,
  type MapNode,
} from '../../lib/track/tree';
import { artStyle } from '../../theme/artStyle';
import { MapAvatar, MAP_AVATAR_SIZE } from './MapAvatar';
import { MapCheckpoint } from './MapCheckpoint';
import { WorldMap } from './WorldMap';
import type { WorldMapTemplate } from './worldMapTemplates';

type Props = {
  width: number;
  height: number;
  currentWorld: WorldMapTemplate;
  activeChunkIndex: number;
  fogPhase: FogPhase;
  completedCount: number;
  standing: number;
  trail: Point[];
  trailKey: number;
  walkDuration: number;
  avatarSource?: ImageSourcePropType;
  onPressNode: (stageNumber: number) => void;
  onArrived?: () => void;
  onCameraSettled?: () => void;
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
  world: Pick<WorldMapTemplate, 'nodes' | 'chunks'>
): Point[] {
  return walkGardenTrail(fromStage, toStage, map, world.nodes, world.chunks).map(avatarAnchor);
}

export function walkDurationMs(trail: Point[]): number {
  return durationForLength(pathLength(trail));
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
  fogPhase,
  completedCount,
  standing,
  trail,
  trailKey,
  walkDuration,
  avatarSource,
  onPressNode,
  onArrived,
  onCameraSettled,
}: Props) {
  const chunkCount = currentWorld.chunks.length;
  const contentHeight = height * chunkCount;
  const markers = levelMarkers(completedCount, currentWorld.nodes);
  const map = { width, height };
  const standingNode = nodeByNumber(standing, currentWorld.nodes) ?? currentWorld.nodes[0]!;
  const standingPoint = avatarAnchor(nodePixels(standingNode, map, chunkCount));

  return (
    <WorldMap
      width={width}
      height={height}
      world={currentWorld}
      activeChunkIndex={activeChunkIndex}
      fogPhase={fogPhase}
      cameraDuration={CAMERA_CLIMB_MS}
      onCameraSettled={onCameraSettled}>
      <View collapsable={false} style={[styles.mapLayer, { width, height: contentHeight }]}>
        <Svg width={width} height={contentHeight} style={styles.pathLayer} pointerEvents="none">
          {currentWorld.nodes.slice(1).map((toNode, index) => {
            const fromNode = currentWorld.nodes[index] as MapNode;
            const d = svgRouteSegment(fromNode, toNode, map, currentWorld.chunks);
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
            const fromNode = currentWorld.nodes[index] as MapNode;
            const opened = stageStatus(toNode.number, completedCount) !== 'locked';
            const d = svgRouteSegment(fromNode, toNode, map, currentWorld.chunks);
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

        {markers.map((marker) => {
          const point = nodePixels(marker, map, chunkCount);
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
});
