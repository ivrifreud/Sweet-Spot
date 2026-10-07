import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
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
import { ChipToss, type ChipFlight } from '../peek-and-pitch/components/ChipToss';
import type { SpotDecision } from '../peek-and-pitch/types';
import { ActionBar } from './ActionBar';
import { ArrivalCard } from './ArrivalCard';
import { buildArrivalCopy } from './arrivalCopy';
import { HotSeatScene, type OpponentReadout } from './HotSeatScene';
import { HotSeatSwapVideo } from './HotSeatSwapVideo';
import { swapRoute } from './hotSeatSwapVideoPlan';
import { raiseSizePair } from './raiseSizes';
import { layoutHotSeatScene, opponentSeatIndexes, tagHatForSeat } from './sceneLayout';
import { PlayerSeatTag } from './PlayerSeatTag';
import { REDUCED_FADE_MS, motionPlan } from './seatRail';
import { seatTagLines } from './seatTag';
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
  const [handAhead, setHandAhead] = useState(false);
  const reducedMotion = Boolean(reduced);
  const swapKind = useMemo(() => {
    if (play.phase !== 'swapping') return 'none' as const;
    return swapRoute({
      skin: story.skin,
      reducedMotion,
      videoReady: true,
      phase: 'swapping',
    }) === 'video'
      ? ('video' as const)
      : ('fallback' as const);
  }, [play.phase, reducedMotion, story.skin]);
  const videoPlaying = swapKind === 'video';

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
    return { slot, stack: body.stack };
  });
  const sizes = raiseSizePair({
    storyId: story.id,
    seatIndex: play.seatIndex,
    scriptedAction: seat.scriptedAction,
    raiseSize: seat.raiseSize,
    street: story.street,
  }).sizes;

  useEffect(() => {
    reported.current = false;
    fallbackToken.current += 1;
    holeFade.value = 1;
    setHandAhead(false);
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
    setPlay((current) => (current.phase === 'swapping' ? cameraLanded(current) : current));
  };
  beginFallbackRef.current = () => {
    const token = ++fallbackToken.current;
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
      return;
    }
    if (swapKind === 'video') {
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
  }, [holeFade, play.phase, play.seatIndex, swapKind]);

  function choose(action: SpotDecision, raiseSize: number | null = null) {
    if (!unlocked || !seat.legalActions.includes(action)) return;
    playSfx(action);
    const correct =
      action === seat.scriptedAction &&
      (action !== 'raise' || raiseSize === seat.raiseSize);
    playSfx(correct ? 'correct' : 'incorrect');
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
    setPlay(decide(play, action, raiseSize));
  }

  return (
    <View style={styles.root}>
      <HotSeatScene
        skin={story.skin}
        layout={scene}
        communityCards={[...story.communityCards]}
        holeCards={[...hand.holeCards]}
        pot={story.pot}
        heroStack={seat.stack}
        opponents={opponents}
        holeFade={holeFade}
        showHoleCards={!videoPlaying}
      />
      <HotSeatSwapVideo
        active={videoPlaying}
        generation={`${story.id}-${play.seatIndex}`}
        skin={story.skin}
        reducedMotion={Boolean(reduced)}
        onCovered={() => setHandAhead(true)}
        onComplete={completeSwap}
        onUnavailable={() => beginFallbackRef.current()}
      />
      {videoPlaying ? null : (
        <SeatTagLayer story={story} play={play} hats={scene.hats} />
      )}
      {unlocked ? (
        <ActionBar
          frame={scene.actions}
          legalActions={seat.legalActions}
          sizes={sizes}
          unlocked={unlocked}
          onAction={choose}
        />
      ) : null}
      <ChipToss flights={flights} onComplete={() => setFlights([])} />
      {play.phase === 'card' ? (
        <ArrivalCard
          copy={buildArrivalCopy(seat)}
          frame={scene.arrival}
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

function SeatTagLayer({
  story,
  play,
  hats,
}: {
  story: HotSeatStory;
  play: HotSeatPlay;
  hats: ReturnType<typeof layoutHotSeatScene>['hats'];
}) {
  return (
    <>
      {story.seats.map((body, seatIndex) => {
        if (seatIndex === play.seatIndex) return null;
        const facingRaise = story.seats.slice(0, seatIndex).some((prior) => prior.scriptedAction === 'raise');
        const copy = seatTagLines({
          seatIndex,
          position: body.position,
          stack: body.stack,
          action: play.decisions[seatIndex] ?? null,
          raiseSize: play.chosenSizes[seatIndex] ?? body.raiseSize,
          facingRaise,
          street: story.street,
        });
        const frame = tagHatForSeat(hats, seatIndex, play.seatIndex, 0);
        return (
          <PlayerSeatTag
            key={seatIndex}
            frame={frame}
            title={copy.title}
            actionLabel={copy.actionLabel}
            stackLabel={copy.stackLabel}
            tone={copy.tone}
          />
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: artStyle.colors.projectorBlack,
  },
});
