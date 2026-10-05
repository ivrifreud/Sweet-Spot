import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { artStyle } from '../../../../theme/artStyle';
import { labelForAction } from '../../decision-feedback/copy';
import type { SpotDecision } from '../peek-and-pitch/types';
import type { SceneFrame } from './sceneLayout';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Tone = 'fold' | 'call' | 'raise';

const TONES: Record<Tone, { face: string; edge: string; ink: string }> = {
  fold: {
    face: artStyle.colors.oxblood,
    edge: artStyle.colors.cream,
    ink: artStyle.colors.cream,
  },
  call: {
    face: artStyle.colors.teal,
    edge: artStyle.colors.tealFaded,
    ink: artStyle.colors.cream,
  },
  raise: {
    face: artStyle.colors.gold,
    edge: artStyle.colors.goldBright,
    ink: artStyle.colors.projectorBlack,
  },
};

type ActionBarProps = {
  frame: SceneFrame;
  legalActions: SpotDecision[];
  sizes: [number, number];
  unlocked: boolean;
  onAction: (action: SpotDecision, raiseSize?: number | null) => void;
};

export function ActionBar({ frame, legalActions, sizes, unlocked, onAction }: ActionBarProps) {
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular });
  const [sizesOpen, setSizesOpen] = useState(false);
  const callOrCheck: SpotDecision = legalActions.includes('check') ? 'check' : 'call';
  const canRaise = unlocked && legalActions.includes('raise');
  const canFold = unlocked && legalActions.includes('fold');
  const canMatch = unlocked && legalActions.includes(callOrCheck);
  const display = fontsLoaded ? styles.display : null;

  function choose(action: SpotDecision, raiseSize?: number | null) {
    setSizesOpen(false);
    onAction(action, raiseSize);
  }

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { left: frame.x, top: frame.y, width: frame.width, height: frame.height }]}>
      {sizesOpen && canRaise ? (
        <View style={styles.sizes}>
          <View style={styles.spacer} />
          {sizes.map((size) => (
            <BlobButton
              key={size}
              label={`${size} BB`}
              enabled
              tone="raise"
              display={display}
              onPress={() => choose('raise', size)}
            />
          ))}
        </View>
      ) : (
        <View style={styles.sizes} />
      )}
      <View style={styles.row}>
        <BlobButton
          label={labelForAction('fold')}
          enabled={canFold}
          tone="fold"
          display={display}
          onPress={() => choose('fold')}
        />
        <BlobButton
          label={labelForAction(callOrCheck)}
          enabled={canMatch}
          tone="call"
          display={display}
          onPress={() => choose(callOrCheck)}
        />
        <BlobButton
          label={labelForAction('raise')}
          enabled={canRaise}
          tone="raise"
          display={display}
          pressed={sizesOpen}
          onPress={() => {
            if (!canRaise) return;
            setSizesOpen((open) => !open);
          }}
        />
      </View>
    </View>
  );
}

function BlobButton({
  label,
  enabled,
  tone,
  display,
  pressed = false,
  onPress,
}: {
  label: string;
  enabled: boolean;
  tone: Tone;
  display: { fontFamily: string } | null;
  pressed?: boolean;
  onPress: () => void;
}) {
  const reduced = useReducedMotion();
  const sink = useSharedValue(0);
  const faceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sink.value * 7 }],
  }));
  const colors = TONES[tone];

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !enabled, expanded: pressed }}
      disabled={!enabled}
      hitSlop={6}
      onPress={() => {
        if (!enabled) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        onPress();
      }}
      onPressIn={() => {
        if (!enabled) return;
        sink.value = reduced ? 1 : withTiming(1, { duration: 90 });
      }}
      onPressOut={() => {
        sink.value = reduced
          ? 0
          : withSequence(
              withTiming(-0.2, { duration: 80 }),
              withTiming(0, { duration: 110, easing: Easing.out(Easing.cubic) })
            );
      }}
      style={[styles.slot, { opacity: enabled ? 1 : 0.4 }]}>
      <View style={styles.socket}>
        <Animated.View
          style={[
            styles.face,
            { backgroundColor: colors.face, borderTopColor: colors.edge },
            faceStyle,
          ]}>
          <Text style={[styles.label, { color: colors.ink }, display]} numberOfLines={1}>
            {label}
          </Text>
        </Animated.View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    zIndex: 35,
    justifyContent: 'flex-end',
    gap: 8,
  },
  sizes: {
    flexDirection: 'row',
    gap: 8,
    minHeight: 48,
    alignItems: 'stretch',
  },
  spacer: {
    flex: 2,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    minHeight: 56,
  },
  slot: {
    flex: 1,
    minHeight: 52,
    minWidth: 44,
  },
  socket: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: artStyle.colors.projectorBlack,
    borderWidth: 2,
    borderColor: artStyle.colors.tobacco,
    paddingHorizontal: 3,
    paddingTop: 3,
    overflow: 'hidden',
  },
  face: {
    flex: 1,
    marginBottom: 7,
    borderRadius: 12,
    borderTopWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  label: {
    fontSize: 20,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontWeight: '800',
  },
  display: {
    fontFamily: 'BebasNeue_400Regular',
    fontWeight: '400',
  },
});
