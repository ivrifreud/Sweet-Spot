import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  cancelAnimation,
  runOnJS,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { playSfx } from '../../../../lib/audio';
import { artStyle } from '../../../../theme/artStyle';
import { labelForAction } from '../../decision-feedback/copy';
import { ChipToss, type ChipFlight } from '../peek-and-pitch/components/ChipToss';
import type { SpotDecision } from '../peek-and-pitch/types';
import { ArrivalCard } from './ArrivalCard';
import { buildArrivalCopy, positionName } from './arrivalCopy';
import { HotSeatScene, type OpponentReadout } from './HotSeatScene';
import { HotSeatSwapVideo } from './HotSeatSwapVideo';
import { swapRoute } from './hotSeatSwapVideoPlan';
import { layoutHotSeatScene, opponentSeatIndexes, type SceneFrame } from './sceneLayout';
import { REDUCED_FADE_MS, motionPlan } from './seatRail';
import {
  begin,
  cameraLanded,
  cameraReady,
  cardCleared,
  decide,
  gesturesUnlocked,
  type HotSeatPlay,
} from './storyEngine';
import type { HotSeatStory } from './types';

export type HotSeatsTemplateProps = {
  story: HotSeatStory;
  disabled?: boolean;
  onStoryComplete: (play: HotSeatPlay) => void;
};

export function HotSeatsTemplate({
  story,
  disabled = false,
  onStoryComplete,
}: HotSeatsTemplateProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const [play, setPlay] = useState(() => begin(story));
  const [flights, setFlights] = useState<ChipFlight[]>([]);
  const reported = useRef(false);
  const holeFade = useSharedValue(1);
  const fallbackToken = useRef(0);
  const beginFallbackRef = useRef<() => void>(() => {});
  const [stackPressed, setStackPressed] = useState(false);
  const [handAhead, setHandAhead] = useState(false);
  const [presentation, setPresentation] = useState<'idle' | 'video' | 'fallback'>('idle');

  const seat = story.seats[play.seatIndex]!;
  const hand = story.seats[handAhead ? play.seatIndex + 1 : play.seatIndex] ?? seat;
  const unlocked = gesturesUnlocked(play) && !disabled;
  const scene = useMemo(
    () =>
      layoutHotSeatScene({
        width,
        height,
        topInset: insets.top,
        bottomInset: insets.bottom,
        communityCount: story.communityCards.length,
        skin: story.skin,
      }),
    [height, insets.bottom, insets.top, story.communityCards.length, story.skin, width]
  );
  const around = opponentSeatIndexes(play.seatIndex);
  const opponents: OpponentReadout[] = (['left', 'far', 'right'] as const).map((slot) => {
    const body = story.seats[around[slot]]!;
    return {
      slot,
      position: positionName(body.position),
      stack: body.stack,
      action: play.decisions[around[slot]] ?? null,
    };
  });

  useEffect(() => {
    reported.current = false;
    fallbackToken.current += 1;
    holeFade.value = 1;
    setHandAhead(false);
    setPresentation('idle');
    setPlay(begin(story));
  }, [holeFade, story]);

  useEffect(() => {
    if (play.phase === 'explaining' && !reported.current) {
      reported.current = true;
      onStoryComplete(play);
    }
  }, [onStoryComplete, play]);

  const completeSwap = () => {
    fallbackToken.current += 1;
    setHandAhead(false);
    setPresentation('idle');
    setPlay((current) => (current.phase === 'swapping' ? cameraLanded(current) : current));
  };
  beginFallbackRef.current = () => {
    const token = ++fallbackToken.current;
    setPresentation('fallback');
    const half = REDUCED_FADE_MS / 2;
    holeFade.value = withSequence(
      withTiming(0, { duration: half }, (finished) => {
        if (finished) runOnJS(setHandAhead)(true);
      }),
      withTiming(1, { duration: half }, (finished) => {
        if (!finished || token !== fallbackToken.current) return;
        runOnJS(completeSwap)();
      })
    );
  };

  useEffect(() => {
    if (play.phase === 'arriving' && play.seatIndex > 0) {
      setPlay((current) => (current.phase === 'arriving' ? cameraReady(current) : current));
      return;
    }
    if (play.phase === 'arriving') {
      let cancelled = false;
      const plan = motionPlan(Boolean(reduced), true);
      const timer = setTimeout(() => {
        if (cancelled) return;
        setPlay((current) => (current.phase === 'arriving' ? cameraReady(current) : current));
      }, plan.durationMs);
      return () => {
        cancelled = true;
        clearTimeout(timer);
      };
    }
    if (play.phase !== 'swapping') {
      fallbackToken.current += 1;
      cancelAnimation(holeFade);
      holeFade.value = 1;
      setPresentation('idle');
      return;
    }
    const route = swapRoute({
      skin: story.skin,
      reducedMotion: Boolean(reduced),
      videoReady: true,
      phase: 'swapping',
    });
    if (route === 'video') {
      setPresentation('video');
      return () => {
        fallbackToken.current += 1;
      };
    }
    beginFallbackRef.current();
    return () => {
      fallbackToken.current += 1;
      cancelAnimation(holeFade);
      holeFade.value = 1;
    };
  }, [holeFade, play.phase, play.seatIndex, reduced, story.skin]);

  function choose(action: SpotDecision) {
    if (!unlocked || !seat.legalActions.includes(action)) return;
    playSfx(action);
    playSfx(action === seat.scriptedAction ? 'correct' : 'incorrect');
    if (action === 'raise') {
      setFlights([
        {
          id: `${story.id}-${play.seatIndex}`,
          from: {
            x: scene.heroStack.x + scene.heroStack.width / 2,
            y: scene.heroStack.y + scene.heroStack.height / 2,
          },
          to: {
            x: scene.board.x + scene.board.width / 2,
            y: scene.board.y + scene.board.height / 2,
          },
          delayMs: 0,
          durationMs: 420,
          arc: 72,
          spin: 180,
          restRotate: 12,
          lift: 16,
        },
      ]);
    }
    setPlay(decide(play, action));
  }

  return (
    <View style={styles.root}>
      <HotSeatScene
        skin={story.skin}
        layout={scene}
        communityCards={[...story.communityCards]}
        holeCards={[...hand.holeCards]}
        pot={story.pot}
        position={positionName(seat.position)}
        priorAction={seat.priorAction}
        heroStack={seat.stack}
        heroEnabled={unlocked}
        heroPressed={stackPressed}
        opponents={opponents}
        holeFade={holeFade}
      />
      <HotSeatSwapVideo
        active={presentation === 'video' && play.phase === 'swapping'}
        generation={`${story.id}-${play.seatIndex}`}
        skin={story.skin}
        reducedMotion={Boolean(reduced)}
        onCovered={() => setHandAhead(true)}
        onComplete={completeSwap}
        onUnavailable={() => beginFallbackRef.current()}
      />
      <GestureLayer
        legalActions={seat.legalActions}
        unlocked={unlocked}
        cards={scene.heroCards}
        stack={scene.heroStack}
        felt={scene.board}
        onStackActive={setStackPressed}
        onAction={choose}
      />
      <ChipToss flights={flights} onComplete={() => setFlights([])} />
      {play.phase === 'card' ? (
        <ArrivalCard
          copy={buildArrivalCopy(seat)}
          onCleared={() => {
            playSfx('arrive');
            Haptics.selectionAsync().catch(() => {});
            setPlay((current) => cardCleared(current));
          }}
        />
      ) : null}
    </View>
  );
}

function GestureLayer({
  legalActions,
  unlocked,
  cards,
  stack,
  felt,
  onStackActive,
  onAction,
}: {
  legalActions: SpotDecision[];
  unlocked: boolean;
  cards: SceneFrame;
  stack: SceneFrame;
  felt: SceneFrame;
  onStackActive: (active: boolean) => void;
  onAction: (action: SpotDecision) => void;
}) {
  const can = (action: SpotDecision) => unlocked && legalActions.includes(action);
  const fold = useMemo(
    () =>
      Gesture.Pan()
        .enabled(can('fold'))
        .activeOffsetY(-24)
        .onEnd((event) => {
          if (event.translationY < -48) runOnJS(onAction)('fold');
        }),
    [legalActions, onAction, unlocked]
  );
  const check = useMemo(
    () =>
      Gesture.Tap()
        .enabled(can('check'))
        .numberOfTaps(2)
        .onEnd(() => runOnJS(onAction)('check')),
    [legalActions, onAction, unlocked]
  );
  const call = useMemo(
    () =>
      Gesture.Tap()
        .enabled(can('call'))
        .onBegin(() => {
          runOnJS(onStackActive)(true);
        })
        .onFinalize(() => {
          runOnJS(onStackActive)(false);
        })
        .onEnd(() => runOnJS(onAction)('call')),
    [legalActions, onAction, onStackActive, unlocked]
  );
  const raise = useMemo(
    () =>
      Gesture.Pan()
        .enabled(can('raise'))
        .activeOffsetY(-20)
        .onBegin(() => {
          runOnJS(onStackActive)(true);
        })
        .onFinalize(() => {
          runOnJS(onStackActive)(false);
        })
        .onEnd((event) => {
          if (event.translationY < -36) runOnJS(onAction)('raise');
        }),
    [legalActions, onAction, onStackActive, unlocked]
  );

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
      style={StyleSheet.absoluteFill}>
      <GestureDetector gesture={fold}>
        <View accessibilityLabel="Your hole cards" style={hitStyle(cards)} />
      </GestureDetector>
      <GestureDetector gesture={check}>
        <View accessibilityLabel="Community cards" style={hitStyle(felt)} />
      </GestureDetector>
      <GestureDetector gesture={Gesture.Exclusive(raise, call)}>
        <View accessibilityLabel="Your chip stack" style={hitStyle(stack)} />
      </GestureDetector>
    </View>
  );
}

function hitStyle(frame: SceneFrame) {
  return {
    position: 'absolute' as const,
    left: frame.x,
    top: frame.y,
    width: Math.max(frame.width, 44),
    height: Math.max(frame.height, 44),
  };
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: artStyle.colors.projectorBlack,
  },
});
