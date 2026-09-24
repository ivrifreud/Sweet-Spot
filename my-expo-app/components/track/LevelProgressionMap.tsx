import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { svgRouteSegment } from '../../lib/track/worldMapGeometry';
import type { FogPhase } from '../../lib/track/fogCycle';
import {
  CAMERA_CLIMB_MS,
  levelMarkers,
  mapNodeAnchorOffset,
  nodeByNumber,
  nodePixels,
  stageStatus,
  type MapNode,
} from '../../lib/track/tree';
import { artStyle } from '../../theme/artStyle';
import { MapCheckpoint } from './MapCheckpoint';
import { MapHeroPin } from './MapHeroPin';
import { WorldMap } from './WorldMap';
import type { WorldMapTemplate } from './worldMapTemplates';

type Props = {
  width: number;
  height: number;
  currentWorld: WorldMapTemplate;
  activeChunkIndex: number;
  fogPhase: FogPhase;
  completedCount: number;
  spotsByStage?: Record<number, number>;
  standing: number;
  hopKey?: number;
  onPressNode: (stageNumber: number) => void;
  onCameraSettled?: () => void;
  mapActive?: boolean;
};

/**
 * Shared world-map mechanic: dynamic art, dotted ink trail, chip checkpoints,
 * and a pinned hero badge on the current node (no walking avatar).
 */
export function LevelProgressionMap({
  width,
  height,
  currentWorld,
  activeChunkIndex,
  fogPhase,
  completedCount,
  spotsByStage = {},
  standing,
  hopKey = 0,
  onPressNode,
  onCameraSettled,
  mapActive = true,
}: Props) {
  const chunkCount = currentWorld.chunks.length;
  const contentHeight = height * chunkCount;
  const markers = levelMarkers(completedCount, currentWorld.nodes, spotsByStage);
  const map = { width, height };
  const standingNode = nodeByNumber(standing, currentWorld.nodes) ?? currentWorld.nodes[0]!;
  const standingPoint = nodePixels(standingNode, map, chunkCount);

  return (
    <WorldMap
      width={width}
      height={height}
      world={currentWorld}
      activeChunkIndex={activeChunkIndex}
      completedCount={completedCount}
      fogPhase={fogPhase}
      cameraDuration={CAMERA_CLIMB_MS}
      onCameraSettled={onCameraSettled}
      mapActive={mapActive}>
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
                strokeWidth={14}
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
                strokeWidth={8}
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
          const anchor = mapNodeAnchorOffset();
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
                  left: point.x - anchor.x,
                  top: point.y - anchor.y,
                },
              ]}>
              <MapCheckpoint
                title={marker.title}
                status={marker.status}
                spotsCompleted={marker.spotsCompleted}
                onPress={() => onPressNode(marker.number)}
              />
            </View>
          );
        })}

        <MapHeroPin x={standingPoint.x} y={standingPoint.y} hopKey={hopKey} />
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
