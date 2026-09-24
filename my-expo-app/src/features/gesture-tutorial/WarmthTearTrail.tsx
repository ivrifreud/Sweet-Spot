import { useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import {
  buildTearDropOutline,
  outlineToSvgPathD,
  warmthTrailProfile,
  type TutorialPoint,
} from '../../../lib/gesture-tutorial/tutorialGeometry';
import { artStyle } from '../../../theme/artStyle';

type WarmthTearTrailBase = {
  width: number;
  height: number;
  /** Same SharedValue progress used by the glove + contact glow. */
  loop: SharedValue<number>;
  pathLength: number;
  travel?: 'held' | 'rotate';
};

type QuadWarmthTearTrailProps = WarmthTearTrailBase & {
  kind: 'quad';
  fromX: SharedValue<number>;
  fromY: SharedValue<number>;
  controlX: SharedValue<number>;
  controlY: SharedValue<number>;
  toX: SharedValue<number>;
  toY: SharedValue<number>;
};

type DialWarmthTearTrailProps = WarmthTearTrailBase & {
  kind: 'dial';
  centerX: SharedValue<number>;
  centerY: SharedValue<number>;
  radius: number;
};

export type WarmthTearTrailProps = QuadWarmthTearTrailProps | DialWarmthTearTrailProps;

/** Local tear-drop: tip at (0,0), body along +X (behind after rotate). */
export function buildLocalTearDropPath(tailLength: number, tipHalfWidth: number, taperPower: number): string {
  const samples = 20;
  const centerline: TutorialPoint[] = [];
  for (let index = 0; index <= samples; index += 1) {
    const u = index / samples;
    centerline.push({ x: u * tailLength, y: 0 });
  }
  return outlineToSvgPathD(buildTearDropOutline(centerline, { tipHalfWidth, taperPower }));
}

function heldTravelProgress(phase: number) {
  'worklet';
  if (phase <= 0.12) return 0;
  if (phase >= 0.8) return 1;
  return (phase - 0.12) / (0.8 - 0.12);
}

function rotateTravelProgress(phase: number) {
  'worklet';
  const cycle = Math.min(2, Math.max(0, phase));
  const linear = cycle <= 1 ? cycle : 2 - cycle;
  return linear < 0.5
    ? 4 * linear * linear * linear
    : 1 - Math.pow(-2 * linear + 2, 3) / 2;
}

function rotateTravelDirection(phase: number): 1 | -1 {
  'worklet';
  return phase <= 1 ? 1 : -1;
}

function trailOpacity(phase: number, along: number, travel: 'held' | 'rotate') {
  'worklet';
  if (travel === 'rotate') {
    if (along <= 0.02) return 0;
    if (along >= 0.08) return 1;
    return (along - 0.02) / 0.06;
  }
  if (phase <= 0.12) return 0;
  if (phase < 0.18) return (phase - 0.12) / 0.06;
  if (phase <= 0.8) return 1;
  if (phase >= 0.95) return 0;
  return 1 - (phase - 0.8) / 0.15;
}

function pointOnQuadWorklet(
  fromX: number,
  fromY: number,
  controlX: number,
  controlY: number,
  toX: number,
  toY: number,
  t: number
) {
  'worklet';
  const inverse = 1 - t;
  return {
    x: inverse * inverse * fromX + 2 * inverse * t * controlX + t * t * toX,
    y: inverse * inverse * fromY + 2 * inverse * t * controlY + t * t * toY,
  };
}

function tangentOnQuadWorklet(
  fromX: number,
  fromY: number,
  controlX: number,
  controlY: number,
  toX: number,
  toY: number,
  t: number
) {
  'worklet';
  const dx = 2 * (1 - t) * (controlX - fromX) + 2 * t * (toX - controlX);
  const dy = 2 * (1 - t) * (controlY - fromY) + 2 * t * (toY - controlY);
  return Math.atan2(dy, dx);
}

function pointOnDialArcWorklet(centerX: number, centerY: number, radius: number, t: number) {
  'worklet';
  const rad = ((90 - t * 180) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(rad),
    y: centerY - radius * Math.sin(rad),
  };
}

/** Dial tangent: clockwise from top→bottom. Flip when returning. */
function tangentOnDialArcWorklet(t: number, direction: 1 | -1) {
  'worklet';
  const rad = ((90 - t * 180) * Math.PI) / 180;
  const angle = Math.atan2(Math.cos(rad), Math.sin(rad));
  return direction >= 0 ? angle : angle + Math.PI;
}

export function WarmthTearTrail(props: WarmthTearTrailProps) {
  return props.kind === 'quad' ? <QuadWarmthTearTrail {...props} /> : <DialWarmthTearTrail {...props} />;
}

function QuadWarmthTearTrail({
  loop,
  pathLength,
  travel = 'held',
  fromX,
  fromY,
  controlX,
  controlY,
  toX,
  toY,
}: QuadWarmthTearTrailProps) {
  const profile = useMemo(() => warmthTrailProfile(pathLength), [pathLength]);
  const bodyD = useMemo(
    () => buildLocalTearDropPath(profile.tailLength, profile.tipHalfWidth, profile.taperPower),
    [profile.tailLength, profile.tipHalfWidth, profile.taperPower]
  );

  const tipY = Math.ceil(profile.tipHalfWidth * 2 + 8) / 2;

  const motion = useAnimatedStyle(() => {
    const phase = loop.value;
    const along = travel === 'rotate' ? rotateTravelProgress(phase) : heldTravelProgress(phase);
    const tip = pointOnQuadWorklet(
      fromX.value,
      fromY.value,
      controlX.value,
      controlY.value,
      toX.value,
      toY.value,
      along
    );
    const heading = tangentOnQuadWorklet(
      fromX.value,
      fromY.value,
      controlX.value,
      controlY.value,
      toX.value,
      toY.value,
      along
    );
    // Local +X is the trail body; +180 so it streams out behind the fingertip.
    const deg = (heading * 180) / Math.PI + 180;
    return {
      opacity: trailOpacity(phase, along, travel),
      // tipY offset places local tip (0, tipY) on the fingertip — same as glow's -26.
      transform: [{ translateX: tip.x }, { translateY: tip.y - tipY }, { rotate: `${deg}deg` }],
    };
  });

  return (
    <TrailSprite
      bodyD={bodyD}
      heatStops={profile.heatStops}
      motion={motion}
      tailLength={profile.tailLength}
      tipHalfWidth={profile.tipHalfWidth}
    />
  );
}

function DialWarmthTearTrail({
  loop,
  pathLength,
  travel = 'rotate',
  centerX,
  centerY,
  radius,
}: DialWarmthTearTrailProps) {
  const profile = useMemo(() => warmthTrailProfile(pathLength, 'finger'), [pathLength]);
  const bodyD = useMemo(
    () => buildLocalTearDropPath(profile.tailLength, profile.tipHalfWidth, profile.taperPower),
    [profile.tailLength, profile.tipHalfWidth, profile.taperPower]
  );

  const tipY = Math.ceil(profile.tipHalfWidth * 2 + 8) / 2;

  const motion = useAnimatedStyle(() => {
    const phase = loop.value;
    const along = rotateTravelProgress(phase);
    const direction = rotateTravelDirection(phase);
    const tip = pointOnDialArcWorklet(centerX.value, centerY.value, radius, along);
    const heading = tangentOnDialArcWorklet(along, direction);
    const deg = (heading * 180) / Math.PI + 180;
    return {
      opacity: trailOpacity(phase, along, travel),
      transform: [{ translateX: tip.x }, { translateY: tip.y - tipY }, { rotate: `${deg}deg` }],
    };
  });

  return (
    <TrailSprite
      bodyD={bodyD}
      heatStops={profile.heatStops}
      motion={motion}
      tailLength={profile.tailLength}
      tipHalfWidth={profile.tipHalfWidth}
    />
  );
}

function TrailSprite({
  bodyD,
  heatStops,
  motion,
  tailLength,
  tipHalfWidth,
}: {
  bodyD: string;
  heatStops: ReturnType<typeof warmthTrailProfile>['heatStops'];
  motion: ReturnType<typeof useAnimatedStyle>;
  tailLength: number;
  tipHalfWidth: number;
}) {
  const gradientId = useRef(`warmthTrail${Math.floor(Math.random() * 1e9)}`).current;
  // Tip at local (0, tipY): left-center so rotate keeps the tear under the glow blob.
  const svgW = Math.ceil(tailLength + tipHalfWidth * 2 + 4);
  const svgH = Math.ceil(tipHalfWidth * 2 + 8);
  const tipY = svgH / 2;
  const tipOrigin: [number, number, number] = [0, tipY, 0];

  return (
    <Animated.View
      pointerEvents="none"
      collapsable={false}
      style={[
        styles.trailDock,
        {
          width: svgW,
          height: svgH,
          transformOrigin: tipOrigin,
        },
        motion,
      ]}
    >
      <View style={{ width: svgW, height: svgH }}>
        <Svg width={svgW} height={svgH} style={StyleSheet.absoluteFill} pointerEvents="none">
          <Defs>
            <LinearGradient
              id={gradientId}
              x1={0}
              y1={tipY}
              x2={tailLength}
              y2={tipY}
              gradientUnits="userSpaceOnUse"
            >
              {heatStops.map((stop) => (
                <Stop
                  key={stop.offset}
                  offset={`${stop.offset}`}
                  stopColor={stop.color}
                  stopOpacity={stop.opacity}
                />
              ))}
            </LinearGradient>
          </Defs>
          {/* Path tip (0,0) → left-center of SVG = under the contact glow. */}
          <Path
            d={bodyD}
            fill={artStyle.colors.goldBright}
            opacity={0.55}
            transform={`translate(0 ${tipY})`}
          />
          <Path d={bodyD} fill={`url(#${gradientId})`} transform={`translate(0 ${tipY})`} />
        </Svg>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  trailDock: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 20,
    elevation: 20,
    overflow: 'visible',
  },
});
