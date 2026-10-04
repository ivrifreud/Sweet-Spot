import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import {
  formatSpotPercent,
  nodeProgressFraction,
  nodeRingPhase,
  type StageStatus,
} from '../../lib/track/tree';
import { ChipSprite } from '../../src/features/templates/peek-and-pitch/components/ChipSprite';
import { artStyle } from '../../theme/artStyle';
import { PadlockIcon, PlayPlateIcon } from '../hud/HudIcons';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const TRACK_WIDTH = 5;
const OPEN_HAIRLINE = 2.5;
const FILL_MS = 640;

type Props = {
  status: StageStatus;
  spotsCompleted: number;
  chipSize: number;
  ringSize: number;
  labelHeight: number;
  /** Moves the percent above the hero without shifting the ring. */
  labelClearance?: number;
};

/**
 * Chip medallion with a true circular stage ring.
 * Locked is unlit. Open is a felt-green hairline. Progress lights only the
 * outer ring, by the percent of the level that is done.
 */
export function MapNodeMedallion({
  status,
  spotsCompleted,
  chipSize,
  ringSize,
  labelHeight,
  labelClearance = 0,
}: Props) {
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular });
  const display = fontsLoaded ? { fontFamily: 'BebasNeue_400Regular' } : null;
  const reducedMotion = useReducedMotion();
  const phase = nodeRingPhase(status, spotsCompleted);
  const target =
    phase === 'complete' ? 1 : phase === 'progress' ? nodeProgressFraction(spotsCompleted) : 0;
  const showLabel = phase === 'progress' || phase === 'complete';
  const current = status === 'current';

  const cx = ringSize / 2;
  const cy = ringSize / 2;
  const ringRadius = (ringSize - TRACK_WIDTH) / 2;
  const ringLength = 2 * Math.PI * ringRadius;
  const chipRadius = chipSize / 2;
  const chipInset = (ringSize - chipSize) / 2;

  // Completed nodes load full; partial ones fill in so leaving mid-level reads on return.
  const fill = useSharedValue(phase === 'complete' ? 1 : 0);

  useEffect(() => {
    fill.value = reducedMotion
      ? target
      : withTiming(target, { duration: FILL_MS, easing: Easing.out(Easing.cubic) });
  }, [fill, reducedMotion, target]);

  const arcProps = useAnimatedProps(() => ({
    strokeDashoffset: ringLength * (1 - fill.value),
    strokeOpacity: fill.value > 0.005 ? 1 : 0,
  }));

  return (
    <View style={[styles.wrap, { width: ringSize }]}>
      {showLabel ? (
        <Text
          style={[
            styles.percent,
            display,
            {
              height: labelHeight,
              lineHeight: labelHeight,
              fontSize: Math.max(14, Math.round(chipSize * 0.3)),
              marginTop: labelClearance > 0 ? -labelClearance : 0,
              marginBottom: labelClearance > 0 ? labelClearance : 0,
            },
          ]}
          numberOfLines={1}
          allowFontScaling={false}>
          {formatSpotPercent(spotsCompleted)}
        </Text>
      ) : null}
      <View
        style={[
          styles.ring,
          { width: ringSize, height: ringSize, borderRadius: ringSize / 2 },
          phase === 'locked' && styles.ringLocked,
        ]}>
        <View
          style={[
            styles.chipClip,
            {
              width: chipSize,
              height: chipSize,
              borderRadius: chipRadius,
              left: chipInset,
              top: chipInset,
            },
            phase === 'locked' && styles.lockedChip,
          ]}>
          <ChipSprite size={chipSize} view="face" style={{ width: chipSize, height: chipSize }} />
        </View>
        <Svg width={ringSize} height={ringSize} style={styles.ringSvg} pointerEvents="none">
          <Circle
            cx={cx}
            cy={cy}
            r={ringRadius}
            stroke={phase === 'locked' ? artStyle.colors.projectorBlack : artStyle.colors.tobacco}
            strokeWidth={TRACK_WIDTH}
            fill="none"
          />
          {phase === 'open' ? (
            <Circle
              cx={cx}
              cy={cy}
              r={ringRadius}
              stroke={artStyle.colors.feltGreen}
              strokeWidth={OPEN_HAIRLINE}
              fill="none"
            />
          ) : null}
          {phase === 'progress' || phase === 'complete' ? (
            <AnimatedCircle
              cx={cx}
              cy={cy}
              r={ringRadius}
              originX={cx}
              originY={cy}
              rotation={-90}
              stroke={artStyle.colors.feltGreenLit}
              strokeWidth={TRACK_WIDTH}
              strokeLinecap={phase === 'complete' ? 'butt' : 'round'}
              strokeDasharray={`${ringLength} ${ringLength}`}
              fill="none"
              animatedProps={arcProps}
            />
          ) : null}
        </Svg>
        {phase === 'locked' ? (
          <View style={styles.lockBadge}>
            <PadlockIcon size={Math.round(chipSize * 0.38)} />
          </View>
        ) : null}
      </View>
      {current && phase !== 'complete' ? (
        <View style={styles.playPlate} accessibilityElementsHidden>
          <PlayPlateIcon width={64} height={24} />
          <Text style={[styles.playLabel, display]}>PLAY</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'visible',
  },
  percent: {
    minWidth: 44,
    color: artStyle.colors.cream,
    letterSpacing: 1.2,
    textAlign: 'center',
    textShadowColor: artStyle.colors.projectorBlack,
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 0,
  },
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  ringLocked: {
    backgroundColor: 'transparent',
  },
  ringSvg: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  chipClip: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  lockedChip: {
    opacity: 0.78,
  },
  lockBadge: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPlate: {
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playLabel: {
    position: 'absolute',
    color: artStyle.colors.projectorBlack,
    fontSize: 13,
    letterSpacing: 1.4,
  },
});
