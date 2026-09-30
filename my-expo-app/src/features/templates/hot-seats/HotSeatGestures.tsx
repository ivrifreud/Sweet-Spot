import type { ReactNode } from 'react';
import * as Haptics from 'expo-haptics';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { playSfx } from '../../../../lib/audio';
import { labelForAction } from '../../decision-feedback/copy';
import type { SpotDecision } from '../peek-and-pitch/types';

type HotSeatGesturesProps = {
  legalActions: SpotDecision[];
  unlocked: boolean;
  onPeek: (active: boolean) => void;
  onAction: (action: SpotDecision) => void;
  children: ReactNode;
};

export function HotSeatGestures({
  legalActions,
  unlocked,
  onPeek,
  onAction,
  children,
}: HotSeatGesturesProps) {
  const can = (action: SpotDecision) => unlocked && legalActions.includes(action);

  const peek = Gesture.LongPress()
    .enabled(unlocked)
    .minDuration(180)
    .onStart(() => {
      runOnJS(onPeek)(true);
      runOnJS(playSfx)('peek');
    })
    .onFinalize(() => {
      runOnJS(onPeek)(false);
    });

  const fold = Gesture.Pan()
    .enabled(can('fold'))
    .activeOffsetY(-24)
    .onEnd((event) => {
      if (event.translationY < -48) {
        runOnJS(playSfx)('fold');
        runOnJS(onAction)('fold');
      }
    });

  const check = Gesture.Tap()
    .enabled(can('check'))
    .numberOfTaps(2)
    .onEnd(() => {
      runOnJS(playSfx)('check');
      runOnJS(onAction)('check');
    });

  const call = Gesture.Tap()
    .enabled(can('call'))
    .onEnd(() => {
      runOnJS(playSfx)('call');
      runOnJS(onAction)('call');
    });

  const raise = Gesture.Pan()
    .enabled(can('raise'))
    .activeOffsetY(-20)
    .onEnd((event) => {
      if (event.translationY < -36) {
        runOnJS(Haptics.selectionAsync)();
        runOnJS(playSfx)('raise');
        runOnJS(onAction)('raise');
      }
    });

  return (
    <View
      accessibilityActions={legalActions.map((action) => ({
        name: action,
        label: labelForAction(action),
      }))}
      onAccessibilityAction={(event) => {
        const action = event.nativeEvent.actionName as SpotDecision;
        if (can(action)) onAction(action);
      }}
      style={styles.root}>
      {children}
      <GestureDetector gesture={Gesture.Simultaneous(peek, fold)}>
        <View accessibilityLabel="Hole cards" style={styles.cards} />
      </GestureDetector>
      <GestureDetector gesture={check}>
        <View accessibilityLabel="Felt" style={styles.felt} />
      </GestureDetector>
      <GestureDetector gesture={Gesture.Exclusive(raise, call)}>
        <View accessibilityLabel="Chip stack" style={styles.stack} />
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
  },
  cards: {
    position: 'absolute',
    left: 78,
    right: 110,
    bottom: 28,
    height: 150,
    minHeight: 44,
  },
  felt: {
    position: 'absolute',
    left: 72,
    right: 72,
    top: '34%',
    height: 180,
    minHeight: 44,
  },
  stack: {
    position: 'absolute',
    right: 16,
    bottom: 36,
    width: 88,
    height: 120,
    minWidth: 44,
    minHeight: 44,
  },
});
