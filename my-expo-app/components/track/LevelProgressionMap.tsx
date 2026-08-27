import { LinearGradient } from 'expo-linear-gradient';
import { ImageBackground, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { durationForLength, pathLength, routeStages, svgQuadSegment, walkPolyline, type Point } from '../../lib/track/mapPath';
import {
  MAP_NODE_SIZE,
  MAP_NODES,
  levelMarkers,
  nodeByNumber,
  nodePixels,
  stageStatus,
} from '../../lib/track/tree';
import { artStyle } from '../../theme/artStyle';
import { MapAvatar, MAP_AVATAR_SIZE } from './MapAvatar';
import { MapCheckpoint } from './MapCheckpoint';

/** Placeholder overworld. Swap this file when the painted map lands; keep node x/y as 0–1. */
const MAP_ART = require('../../assets/themes/bennys-garden/light-mobile.png');

type Props = {
  width: number;
  height: number;
  completedCount: number;
  standing: number;
  trail: Point[];
  trailKey: number;
  walkDuration: number;
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
  map: { width: number; height: number }
): Point[] {
  const bulge = Math.min(map.width, map.height) * 0.08;
  const stops = routeStages(fromStage, toStage)
    .map((number) => nodeByNumber(number))
    .filter((node): node is NonNullable<typeof node> => Boolean(node))
    .map((node) => avatarAnchor(nodePixels(node, map)));
  return walkPolyline(stops, bulge);
}

export function walkDurationMs(trail: Point[]): number {
  return durationForLength(pathLength(trail));
}

/**
 * Super Mario World–style overworld: static map art, winding path, checkpoint
 * nodes, and a walker that hops along the path. Coordinates are 0–1 of this box.
 */
export function LevelProgressionMap({
  width,
  height,
  completedCount,
  standing,
  trail,
  trailKey,
  walkDuration,
  onPressNode,
  onArrived,
}: Props) {
  const bulge = Math.min(width, height) * 0.08;
  const markers = levelMarkers(completedCount);
  const pixelStops = MAP_NODES.map((node) => nodePixels(node, { width, height }));
  const standingNode = nodeByNumber(standing) ?? MAP_NODES[0]!;
  const standingPoint = avatarAnchor(nodePixels(standingNode, { width, height }));

  return (
    <View collapsable={false} style={[styles.mapBox, { width, height }]}>
      <ImageBackground
        source={MAP_ART}
        resizeMode="cover"
        style={{ width, height }}
        imageStyle={styles.mapImage}>
        <View collapsable={false} style={styles.mapLayer}>
          <LinearGradient
            colors={['rgba(17,23,20,0.12)', 'rgba(17,23,20,0.2)', 'rgba(17,23,20,0.42)']}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
            {pixelStops.slice(1).map((to, index) => {
              const from = pixelStops[index]!;
              const d = svgQuadSegment(from, to, index, bulge);
              return (
                <Path
                  key={`path-under-${index}`}
                  d={d}
                  stroke={artStyle.colors.tobacco}
                  strokeWidth={14}
                  strokeLinecap="round"
                  fill="none"
                  opacity={0.88}
                />
              );
            })}
            {pixelStops.slice(1).map((to, index) => {
              const from = pixelStops[index]!;
              const opened = stageStatus(index + 2, completedCount) !== 'locked';
              const d = svgQuadSegment(from, to, index, bulge);
              return (
                <Path
                  key={`path-${index}`}
                  d={d}
                  stroke={opened ? artStyle.colors.gold : artStyle.colors.cream}
                  strokeWidth={7}
                  strokeLinecap="round"
                  strokeDasharray={opened ? undefined : '10 8'}
                  fill="none"
                  opacity={opened ? 0.96 : 0.45}
                />
              );
            })}
          </Svg>

          {markers.map((marker) => {
            const point = nodePixels(marker, { width, height });
            return (
              <View
                key={marker.id}
                collapsable={false}
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
            onArrived={onArrived}
          />
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  mapBox: {
    overflow: 'hidden',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  nodeAnchor: {
    position: 'absolute',
    zIndex: 4,
  },
});
