/* eslint-disable react-hooks/refs -- Walk callbacks read the latest trail and arrival handler. */
import { useEffect, useRef } from 'react';
import { Image, StyleSheet, type ImageSourcePropType } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { startWalkSfx, stopWalkSfx } from '../../lib/audio';
import { WALK_FRAME_COUNT, walkFrameIndex } from '../../lib/track/avatarAnimation';
import {
  WALK_OVERSHOOT,
  avatarSpriteOrigin,
  pointAlongXY,
  resolveHopRest,
  type Point,
} from '../../lib/track/avatarSettle';

const IDLE_SPRITE = require('../../assets/brand/artstyle/hero-walk/idle-front.png');
const WALK_SPRITES: readonly ImageSourcePropType[] = [
  require('../../assets/brand/artstyle/hero-walk/walk-01.png'),
  require('../../assets/brand/artstyle/hero-walk/walk-02.png'),
  require('../../assets/brand/artstyle/hero-walk/walk-03.png'),
  require('../../assets/brand/artstyle/hero-walk/walk-04.png'),
];

export const MAP_AVATAR_SIZE = 84;

type Props = {
  /** Node anchor Benny should stand on. A trail walks to this point. */
  x: number;
  y: number;
  trail?: Point[];
  /** Nodes on `trail`. An interrupted hop snaps to the nearest one. */
  anchors?: Point[];
  trailKey?: string | number;
  duration?: number;
  source?: ImageSourcePropType;
  walkSoundEnabled?: boolean;
  onArrived?: () => void;
};

function directionAlongXY(xs: number[], ys: number[], t: number) {
  'worklet';
  if (xs.length < 2) return 1;
  const clamped = Math.max(0, Math.min(t, 1));
  const before = pointAlongXY(xs, ys, Math.max(0, clamped - 0.012));
  const after = pointAlongXY(xs, ys, Math.min(1, clamped + 0.012));
  return after.x < before.x ? -1 : 1;
}

type WalkFrameProps = {
  index: number;
  moving: SharedValue<number>;
  progress: SharedValue<number>;
  source: ImageSourcePropType;
  totalFrames: SharedValue<number>;
};

function WalkFrame({ index, moving, progress, source, totalFrames }: WalkFrameProps) {
  const visibility = useAnimatedStyle(() => ({
    opacity:
      moving.value === 1 &&
      walkFrameIndex(Math.min(progress.value, 0.999999), totalFrames.value, WALK_FRAME_COUNT) ===
        index
        ? 1
        : 0,
  }));

  return (
    <Animated.View style={[styles.spriteFrame, visibility]}>
      <Image
        source={source}
        style={styles.sprite}
        resizeMode="contain"
        accessible={false}
        accessibilityIgnoresInvertColors
      />
    </Animated.View>
  );
}

type HopFrame = {
  trail: Point[];
  anchors: Point[];
  destination: Point;
};

/**
 * Benny's shoes follow the path, then stand on the node anchor.
 * A trailKey change walks from the current feet. `x` and `y` are that anchor:
 * a finished hop lands there, and an interrupted hop snaps to the nearest node.
 */
export function MapAvatar({
  x,
  y,
  trail,
  anchors,
  trailKey,
  duration = 560,
  source = IDLE_SPRITE,
  walkSoundEnabled = true,
  onArrived,
}: Props) {
  const reducedMotion = useReducedMotion();
  const left = useSharedValue(x);
  const top = useSharedValue(y);
  const progress = useSharedValue(1);
  const usePath = useSharedValue(0);
  const travelFrames = useSharedValue(WALK_FRAME_COUNT);
  const xs = useSharedValue<number[]>([]);
  const ys = useSharedValue<number[]>([]);
  const placed = useRef(false);
  const trailRef = useRef(trail);
  const anchorsRef = useRef(anchors);
  const arrivedRef = useRef(onArrived);
  const hopRef = useRef<HopFrame>({
    trail: [],
    anchors: [],
    destination: { x, y },
  });
  const hopId = useRef(0);
  trailRef.current = trail;
  anchorsRef.current = anchors;
  arrivedRef.current = onArrived;

  useEffect(() => {
    const id = hopId.current + 1;
    hopId.current = id;
    cancelAnimation(left);
    cancelAnimation(top);
    cancelAnimation(progress);

    if (!placed.current) {
      left.value = x;
      top.value = y;
      placed.current = true;
    } else if (usePath.value === 1 && hopRef.current.trail.length > 0) {
      const rest = resolveHopRest({
        progress: progress.value,
        finished: false,
        trail: hopRef.current.trail,
        anchors: hopRef.current.anchors,
        destination: hopRef.current.destination,
      });
      left.value = rest.x;
      top.value = rest.y;
      usePath.value = 0;
      progress.value = 1;
      if (walkSoundEnabled) stopWalkSfx();
    }

    const currentTrail = trailRef.current;
    const usingTrail = Boolean(currentTrail && currentTrail.length >= 2);
    const destination = { x, y };

    const commit = (finished: boolean, progressNow: number, hop: number) => {
      if (hopId.current !== hop) return;
      const frame = hopRef.current;
      const rest = resolveHopRest({
        progress: progressNow,
        finished,
        trail: frame.trail,
        anchors: frame.anchors,
        destination: frame.destination,
      });
      left.value = rest.x;
      top.value = rest.y;
      usePath.value = 0;
      progress.value = 1;
      if (walkSoundEnabled) stopWalkSfx();
      if (finished) arrivedRef.current?.();
    };

    if (!usingTrail || !currentTrail) {
      left.value = destination.x;
      top.value = destination.y;
      usePath.value = 0;
      progress.value = 1;
      return;
    }

    const from = { x: left.value, y: top.value };
    const points =
      Math.hypot(from.x - currentTrail[0]!.x, from.y - currentTrail[0]!.y) > 1.5
        ? [from, ...currentTrail]
        : [...currentTrail];
    points[points.length - 1] = destination;
    const provided = anchorsRef.current;
    const hopAnchors = provided && provided.length > 0 ? [...provided] : [points[0]!, destination];
    if (!hopAnchors.some((anchor) => anchor.x === destination.x && anchor.y === destination.y)) {
      hopAnchors.push(destination);
    }
    hopRef.current = { trail: points, anchors: hopAnchors, destination };
    xs.value = points.map((point) => point.x);
    ys.value = points.map((point) => point.y);

    if (reducedMotion) {
      left.value = destination.x;
      top.value = destination.y;
      usePath.value = 0;
      progress.value = 1;
      if (walkSoundEnabled) stopWalkSfx();
      arrivedRef.current?.();
      return;
    }

    usePath.value = 1;
    travelFrames.value = Math.max(WALK_FRAME_COUNT, Math.round(duration / 95));
    progress.value = 0;
    if (walkSoundEnabled) startWalkSfx();
    const rush = Math.max(1, Math.round(duration * 0.86));
    const settle = Math.max(1, duration - rush);
    progress.value = withSequence(
      withTiming(WALK_OVERSHOOT, { duration: rush, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: settle, easing: Easing.inOut(Easing.quad) }, (finished) => {
        const progressNow = finished ? 1 : progress.value;
        runOnJS(commit)(Boolean(finished), progressNow, id);
      })
    );
    return () => {
      if (walkSoundEnabled) stopWalkSfx();
    };
  }, [
    duration,
    left,
    progress,
    reducedMotion,
    top,
    trailKey,
    travelFrames,
    usePath,
    walkSoundEnabled,
    x,
    xs,
    y,
    ys,
  ]);

  const positionStyle = useAnimatedStyle(() => {
    const point =
      usePath.value === 1 && xs.value.length > 0
        ? pointAlongXY(xs.value, ys.value, progress.value)
        : { x: left.value, y: top.value };
    const origin = avatarSpriteOrigin(point, MAP_AVATAR_SIZE);
    return {
      transform: [{ translateX: origin.x }, { translateY: origin.y }],
    };
  });

  const facingStyle = useAnimatedStyle(() => {
    const moving = usePath.value === 1;
    const wave = moving ? Math.sin(Math.min(progress.value, 1) * Math.PI * 8) : 0;
    return {
      transform: [
        {
          scaleX:
            (moving ? directionAlongXY(xs.value, ys.value, progress.value) : 1) * (1 - wave * 0.05),
        },
        { scaleY: 1 + wave * 0.08 },
      ],
    };
  });

  const idleVisibility = useAnimatedStyle(() => ({
    opacity: usePath.value === 1 ? 0 : 1,
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.wrap, positionStyle]}>
      <Animated.View style={[styles.spriteStage, facingStyle]}>
        <Animated.View style={[styles.spriteFrame, idleVisibility]}>
          <Image
            source={source}
            style={styles.sprite}
            resizeMode="contain"
            accessible={false}
            accessibilityIgnoresInvertColors
          />
        </Animated.View>
        {WALK_SPRITES.map((walkSource, index) => (
          <WalkFrame
            key={index}
            index={index}
            moving={usePath}
            progress={progress}
            source={walkSource}
            totalFrames={travelFrames}
          />
        ))}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: MAP_AVATAR_SIZE,
    height: MAP_AVATAR_SIZE,
    zIndex: 8,
  },
  spriteStage: {
    width: MAP_AVATAR_SIZE,
    height: MAP_AVATAR_SIZE,
  },
  spriteFrame: {
    ...StyleSheet.absoluteFill,
  },
  sprite: {
    width: MAP_AVATAR_SIZE,
    height: MAP_AVATAR_SIZE,
  },
});
