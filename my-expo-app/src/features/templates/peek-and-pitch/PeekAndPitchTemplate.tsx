/* eslint-disable react-hooks/immutability, react-hooks/refs, react-hooks/set-state-in-effect -- Reanimated shared values and callback refs. */
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import {
  Easing,
  cancelAnimation,
  runOnJS,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  describeHoleCards,
  formatCard,
  parseHoleCards,
  randomHoleCards,
  type HoleCards as HoleCardsTuple,
} from '@/lib/cards';

import { playSfx, queueCheckSfx, startAmbience, stopAmbience } from '../../../../lib/audio';
import { artStyle } from '../../../../theme/artStyle';
import { CHIP_EDGE_RATIO } from '../../../../theme/chipArt';
import { ActionBanner } from './components/ActionBanner';
import { streetLabelForBoard } from './street';
import { BarrierHand } from './components/BarrierHand';
import { CardPicker } from './components/CardPicker';
import { ChipStack, CHIP_SIZE } from './components/ChipStack';
import { ChipStackTarget } from './components/ChipStackTarget';
import { ChipToss, type ChipFlight } from './components/ChipToss';
import { CommunityCards } from './components/CommunityCards';
import { FeltPlane } from './components/FeltPlane';
import { GestureHints } from './components/GestureHints';
import { HeroHand } from './components/HeroHand';
import { CARD_GAP_RATIO, HoleCards } from './components/HoleCards';
import { PeekHud } from './components/PeekHud';
import { CARD_ASPECT } from './components/PlayingCard';
import { layoutCommunityBoard } from '../../../../lib/peek-and-pitch/communityBoardLayout';
import { TableGestures } from './components/TableGestures';
import { TableScene } from './components/TableScene';
import { DEFAULT_SPOT, SKINS, STACK_HIT, CHIP_CARD_GAP, mapBackdropPoint } from './config';
import { STRINGS } from './strings';
import type { PeekAndPitchSpot, SpotDecision, TableSkin, TemplatePhase } from './types';
import { GestureTutorialOverlay } from '../../gesture-tutorial';
import { shouldApplyDealComplete } from '../../../../lib/peek-and-pitch/handReset';
import {
  PEEK_AND_PITCH_TUTORIAL,
  advanceStep,
  allowedActionsForStep,
  currentStep,
  hasSeenTemplateTutorial,
  isComplete,
  markTemplateTutorialSeen,
  matchesCurrentStep,
} from '../../../../lib/gesture-tutorial';
import type { GestureTutorialAction, GestureTutorialStep } from '../../../../lib/gesture-tutorial';

/** Slower deal/muck throw onto the felt. */
const DEAL_THROW_MS = 1700;
const DEAL_LIVE_FALLBACK_MS = 1920;
/** Hole cards stay large enough that rank and suit (including 10) stay readable. */
const CARD_SCALE = 0.78;
/** Chips stay under card width so stacks read as coins, not one merged stamp. */
const CHIP_TO_CARD = 0.55;
/**
 * TrackHud sits at insets.top + 4 with ~44pt capsules.
 * Extra gap drops the hand-info block into mid-upper felt, clear of the lives pill.
 */
const ACTION_BANNER_BELOW_HUD = 76;

export type PeekAndPitchTemplateProps = {
  spot?: PeekAndPitchSpot;
  onDecision?: (
    decision: SpotDecision,
    context: { cards: HoleCardsTuple; peeked: boolean }
  ) => void;
  /** Set false to hide the "Set cards" authoring shortcut in production builds. */
  showAuthoringControls?: boolean;
  showNextHandControl?: boolean;
  disabled?: boolean;
  resetKey?: number;
  /** Hide gloves, chips, and banners so a feedback overlay can sit on top. */
  suppressTableActors?: boolean;
  /** After Deal Me In, always run the first-time coach even if storage was skipped. */
  forceTutorial?: boolean;
  onTutorialSettled?: () => void;
  /** When false, the parent draws the overlay so it cannot sit under the felt hit layer. */
  embedTutorialOverlay?: boolean;
  onTutorialUi?: (
    state: {
      step: GestureTutorialStep;
      stepIndex: number;
      success: boolean;
      rejectTick: number;
      cardHit: { x: number; y: number; width: number; height: number };
      stackHit: { x: number; y: number; width: number; height: number };
      tableCenter: { x: number; y: number };
      onGesture: (action: GestureTutorialAction) => void;
      onReject: () => void;
      onSkip: () => void;
    } | null
  ) => void;
};

/**
 * Template 1 — "The Peek and Pitch".
 *
 * First-person seat at the table: the dealer pitches two cards to the player.
 *   - hold the hole cards, then pull down        -> pinch, lift, and shield the hole cards
 *   - release                                  -> the cards drop flat on the felt
 *   - swipe up from the same grip              -> throw the cards onto the table
 *   - tap your own stack once                  -> Call
 *   - double-tap anywhere                      -> Check
 *   - drag chips toward the pot                -> Raise
 */
export function PeekAndPitchTemplate({
  spot = DEFAULT_SPOT,
  onDecision,
  showAuthoringControls = true,
  showNextHandControl = true,
  disabled = false,
  resetKey = 0,
  suppressTableActors = false,
  forceTutorial = false,
  onTutorialSettled,
  embedTutorialOverlay = true,
  onTutorialUi,
}: PeekAndPitchTemplateProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [activeSpot, setActiveSpot] = useState<PeekAndPitchSpot>(spot);
  const [cards, setCards] = useState<HoleCardsTuple>(() =>
    spot.heroCards ? parseHoleCards(spot.heroCards) : randomHoleCards()
  );
  const [phase, setPhase] = useState<TemplatePhase>('dealing');
  const [decision, setDecision] = useState<SpotDecision | null>(null);
  const [peeked, setPeeked] = useState(false);
  const [flights, setFlights] = useState<ChipFlight[]>([]);
  const [pushedChips, setPushedChips] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pitching, setPitching] = useState(false);
  const [checkDenied, setCheckDenied] = useState(false);
  const [tutorialReady, setTutorialReady] = useState(forceTutorial);
  const [tutorialActive, setTutorialActive] = useState(forceTutorial);
  const [tutorialIndex, setTutorialIndex] = useState(0);
  const [tutorialSuccess, setTutorialSuccess] = useState(false);
  const [rejectTick, setRejectTick] = useState(0);
  const [gestureEpoch, setGestureEpoch] = useState(0);
  const flightSeed = useRef(0);
  const resolvedRef = useRef(false);
  const pendingChipRef = useRef<'call' | 'raise' | null>(null);
  const chipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tutorialTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tutorialActiveRef = useRef(false);
  const tutorialIndexRef = useRef(0);
  const tutorialBusyRef = useRef(false);
  const tutorialDoneRef = useRef(false);
  const onTutorialSettledRef = useRef(onTutorialSettled);
  onTutorialSettledRef.current = onTutorialSettled;
  const onTutorialUiRef = useRef(onTutorialUi);
  onTutorialUiRef.current = onTutorialUi;
  const dealGenerationRef = useRef(0);
  const applyDealComplete = useCallback((generation: number) => {
    if (shouldApplyDealComplete(generation, dealGenerationRef.current, true)) {
      setPhase('live');
    }
  }, []);

  const deal = useSharedValue(0);
  const peek = useSharedValue(0);
  const muck = useSharedValue(0);
  const commit = useSharedValue(0);
  const stackPress = useSharedValue(0);
  const stackDragX = useSharedValue(0);
  const stackDragY = useSharedValue(0);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  tutorialActiveRef.current = tutorialActive;
  tutorialIndexRef.current = tutorialIndex;

  const skin = SKINS[activeSpot.skin];

  const stage = Math.min(width, 460);
  const stageLeft = (width - stage) / 2;
  const cardWidth = Math.min(stage * 0.19 * CARD_SCALE, 84);
  const cardHeight = cardWidth * CARD_ASPECT;
  const cardGap = cardWidth * CARD_GAP_RATIO;
  const chipSize = Math.round(
    Math.min(Math.max(cardWidth * CHIP_TO_CARD, 32), Math.max(CHIP_SIZE, 42))
  );
  const handWidth = stage * 0.46;
  const barrierWidth = stage * 0.42;
  const stackHitSize = {
    width: Math.max(STACK_HIT.width, chipSize * 3.6 + 28, 56),
    height: Math.max(STACK_HIT.height, chipSize * 2.8 + 44, 56),
  };

  const geometry = useMemo(() => {
    const screen = { width, height };

    const mappedRest = mapBackdropPoint(
      skin.holeRest,
      skin.backgroundSize,
      screen,
      skin.fit,
      skin.coverAnchor
    );
    const restCenter = {
      x: Math.min(Math.max(mappedRest.x, width * 0.54), width * 0.7),
      y: Math.min(Math.max(mappedRest.y, height * 0.68), height - cardHeight * 0.22),
    };

    const cardSpan = cardWidth * 2 + cardGap;
    const stackHitWidth = stackHitSize.width;
    const stackHitHeight = stackHitSize.height;
    const maxStackRight = restCenter.x - cardSpan / 2 - CHIP_CARD_GAP;
    let stackX = Math.max(8, maxStackRight - stackHitWidth);
    if (stackX + stackHitWidth > width - 8) {
      stackX = Math.max(8, width - 8 - stackHitWidth);
    }
    const stackHit = {
      x: stackX,
      y: restCenter.y + cardHeight * 0.08 - stackHitHeight,
      width: stackHitWidth,
      height: stackHitHeight,
    };
    const stackRight = stackHit.x + stackHit.width;
    let cardsLeft = restCenter.x - cardSpan / 2;
    if (cardsLeft - stackRight < CHIP_CARD_GAP) {
      cardsLeft = stackRight + CHIP_CARD_GAP;
      restCenter.x = cardsLeft + cardSpan / 2;
    }

    const dealOrigin = mapBackdropPoint(
      skin.dealOrigin,
      skin.backgroundSize,
      screen,
      skin.fit,
      skin.coverAnchor
    );
    const board = layoutCommunityBoard({
      cardCount: Math.max(activeSpot.board.length, 1),
      viewportWidth: width,
      maxWidth: stage * 0.76,
      farY: dealOrigin.y,
      nearY: restCenter.y,
    });

    return {
      dealOrigin,
      tableCenter: mapBackdropPoint(
        skin.tableCenter,
        skin.backgroundSize,
        screen,
        skin.fit,
        skin.coverAnchor
      ),
      board,
      restCenter,
      cardHit: {
        x: cardsLeft,
        y: restCenter.y - cardHeight / 2,
        width: cardSpan,
        height: cardHeight * 1.45,
      },
      stackHit,
      stackAnchor: {
        x: stackHit.x + stackHit.width * 0.5,
        y: stackHit.y + stackHit.height * 0.82,
      },
      handContact: {
        x: restCenter.x + (cardWidth + cardGap) / 2 + cardWidth / 2,
        y: restCenter.y + cardHeight / 2,
      },
      barrierContact: {
        x: cardsLeft - cardWidth * 0.06,
        y: restCenter.y - cardHeight * 0.08,
      },
    };
  }, [
    cardGap,
    cardHeight,
    cardWidth,
    height,
    skin.backgroundSize,
    skin.coverAnchor,
    skin.dealOrigin,
    skin.fit,
    skin.holeRest,
    skin.tableCenter,
    stackHitSize.height,
    stackHitSize.width,
    stage,
    width,
    activeSpot.board.length,
  ]);

  const dealHand = useCallback(
    (nextSpot: PeekAndPitchSpot) => {
      setActiveSpot(nextSpot);
      setCards(nextSpot.heroCards ? parseHoleCards(nextSpot.heroCards) : randomHoleCards());
      setDecision(null);
      setPeeked(false);
      setFlights([]);
      setPushedChips(0);
      setPitching(false);
      pendingChipRef.current = null;
      if (chipTimer.current) {
        clearTimeout(chipTimer.current);
        chipTimer.current = null;
      }
      setPhase('dealing');
      resolvedRef.current = false;
      playSfx('deal');

      cancelAnimation(deal);
      cancelAnimation(peek);
      cancelAnimation(muck);
      cancelAnimation(commit);
      peek.value = 0;
      muck.value = 0;
      commit.value = 0;
      stackPress.value = 0;
      stackDragX.value = 0;
      stackDragY.value = 0;
      deal.value = 0;
      const generation = dealGenerationRef.current + 1;
      dealGenerationRef.current = generation;
      deal.value = withTiming(
        1,
        { duration: DEAL_THROW_MS, easing: Easing.out(Easing.cubic) },
        (finished) => {
          // Worklets may only pass primitives to JS. Never read a React ref here.
          if (finished) {
            runOnJS(applyDealComplete)(generation);
          }
        }
      );
    },
    [applyDealComplete, commit, deal, muck, peek, stackDragX, stackDragY, stackPress]
  );

  useEffect(() => {
    dealHand(spot);
  }, [dealHand, resetKey, spot]);

  useEffect(() => {
    startAmbience(activeSpot.skin === 'casino' ? 'local-casino' : 'bennys-garden', 'night');
    return () => stopAmbience();
  }, [activeSpot.skin]);

  useEffect(() => {
    queueCheckSfx();
  }, []);

  useEffect(() => {
    return () => {
      if (chipTimer.current) {
        clearTimeout(chipTimer.current);
      }
      if (tutorialTimer.current) {
        clearTimeout(tutorialTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (suppressTableActors) {
      setTutorialReady(true);
      return;
    }
    if (tutorialDoneRef.current) {
      setTutorialActive(false);
      setTutorialReady(true);
      return;
    }
    if (forceTutorial) {
      setTutorialActive(true);
      setTutorialReady(true);
      return;
    }
    let cancelled = false;
    hasSeenTemplateTutorial(PEEK_AND_PITCH_TUTORIAL.templateId).then((seen) => {
      if (cancelled || tutorialDoneRef.current) {
        return;
      }
      setTutorialActive(!seen);
      setTutorialReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [forceTutorial, suppressTableActors]);

  useEffect(() => {
    if (phase !== 'dealing') {
      return;
    }
    const timer = setTimeout(() => setPhase('live'), DEAL_LIVE_FALLBACK_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  const resetTutorialActors = useCallback(() => {
    cancelAnimation(peek);
    cancelAnimation(muck);
    cancelAnimation(commit);
    peek.value = 0;
    muck.value = 0;
    commit.value = 0;
    setPeeked(false);
    setFlights([]);
    setPushedChips(0);
    setPitching(false);
    pendingChipRef.current = null;
    if (chipTimer.current) {
      clearTimeout(chipTimer.current);
      chipTimer.current = null;
    }
    setGestureEpoch((current) => current + 1);
  }, [commit, muck, peek]);

  const endTutorial = useCallback(() => {
    tutorialBusyRef.current = false;
    tutorialDoneRef.current = true;
    setTutorialSuccess(false);
    setTutorialActive(false);
    resetTutorialActors();
    void markTemplateTutorialSeen(PEEK_AND_PITCH_TUTORIAL.templateId);
    onTutorialSettledRef.current?.();
  }, [resetTutorialActors]);

  const rejectTutorial = useCallback(() => {
    if (!tutorialActiveRef.current || tutorialBusyRef.current) {
      return;
    }
    setRejectTick((current) => current + 1);
  }, []);

  const completeTutorialAction = useCallback(
    (action: GestureTutorialAction) => {
      if (!tutorialActiveRef.current || tutorialBusyRef.current) {
        return;
      }
      if (!matchesCurrentStep(PEEK_AND_PITCH_TUTORIAL.steps, tutorialIndexRef.current, action)) {
        rejectTutorial();
        return;
      }
      tutorialBusyRef.current = true;
      setTutorialSuccess(true);
      if (tutorialTimer.current) {
        clearTimeout(tutorialTimer.current);
      }
      tutorialTimer.current = setTimeout(() => {
        tutorialTimer.current = null;
        const next = advanceStep(tutorialIndexRef.current, PEEK_AND_PITCH_TUTORIAL.steps.length);
        resetTutorialActors();
        setTutorialSuccess(false);
        if (isComplete(next, PEEK_AND_PITCH_TUTORIAL.steps.length)) {
          endTutorial();
          return;
        }
        setTutorialIndex(next);
        tutorialBusyRef.current = false;
      }, 220);
    },
    [endTutorial, rejectTutorial, resetTutorialActors]
  );

  const markPeeked = useCallback(() => {
    if (tutorialActiveRef.current) {
      completeTutorialAction('peek');
      return;
    }
    setPeeked((current) => {
      if (!current) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
      return true;
    });
  }, [completeTutorialAction]);

  const resolve = useCallback(
    (nextDecision: SpotDecision) => {
      if (resolvedRef.current) {
        return;
      }
      resolvedRef.current = true;
      setPhase('resolved');
      setDecision(nextDecision);
      onDecision?.(nextDecision, { cards, peeked });
    },
    [cards, onDecision, peeked]
  );

  useEffect(() => {
    if (!checkDenied) return;
    const timer = setTimeout(() => setCheckDenied(false), 2200);
    return () => clearTimeout(timer);
  }, [checkDenied]);

  const finishChipDecision = useCallback(() => {
    if (chipTimer.current) {
      clearTimeout(chipTimer.current);
      chipTimer.current = null;
    }
    const nextDecision = pendingChipRef.current;
    if (!nextDecision) return;
    pendingChipRef.current = null;
    setPitching(false);
    if (tutorialActiveRef.current) {
      completeTutorialAction(nextDecision);
      return;
    }
    resolve(nextDecision);
  }, [completeTutorialAction, resolve]);
  const finishChipDecisionRef = useRef(finishChipDecision);
  finishChipDecisionRef.current = finishChipDecision;
  const onTossComplete = useCallback(() => {
    finishChipDecisionRef.current();
  }, []);

  const handleChipDecision = useCallback(
    (nextDecision: 'call' | 'raise') => {
      if (phaseRef.current !== 'live' || pendingChipRef.current) {
        return;
      }
      if (
        tutorialActiveRef.current &&
        !matchesCurrentStep(PEEK_AND_PITCH_TUTORIAL.steps, tutorialIndexRef.current, nextDecision)
      ) {
        rejectTutorial();
        return;
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      playSfx(nextDecision);
      pendingChipRef.current = nextDecision;
      setPitching(true);

      const { stackAnchor, tableCenter } = geometry;
      const flightCount = nextDecision === 'raise' ? 4 : 1;
      const nextFlights: ChipFlight[] = Array.from({ length: flightCount }, (_, index) => {
        flightSeed.current += 1;
        const spin = Math.random() > 0.5 ? 1 : -1;
        const from = {
          x: stackAnchor.x + (Math.random() - 0.5) * 6,
          y: stackAnchor.y - chipSize * 0.15 - index * (chipSize * CHIP_EDGE_RATIO),
        };
        const scatterX = (Math.random() - 0.5) * chipSize * 1.8;
        const scatterY = (Math.random() - 0.5) * chipSize * 1.1;
        return {
          id: `chip-${flightSeed.current}`,
          from,
          to: {
            x: tableCenter.x + scatterX + index * 3,
            y: tableCenter.y + scatterY + index * 2,
          },
          delayMs: 90 + index * 90,
          durationMs: 1150 + index * 60,
          arc: 88 + Math.random() * 42,
          lift: chipSize * 0.75,
          spin,
          restRotate: spin * (6 + Math.random() * 18),
          size: chipSize,
          landScale: 0.78 + Math.random() * 0.08,
        };
      });

      setFlights(nextFlights);
      setPushedChips((current) => current + (nextDecision === 'raise' ? 3 : 1));
      commit.value = 0;
      commit.value = withSequence(
        withTiming(0.28, { duration: 200, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 980, easing: Easing.inOut(Easing.cubic) })
      );

      cancelAnimation(peek);
      peek.value = 0;

      const waitMs =
        nextFlights.reduce((max, flight) => Math.max(max, flight.delayMs + flight.durationMs), 0) +
        40;
      if (chipTimer.current) clearTimeout(chipTimer.current);
      chipTimer.current = setTimeout(() => finishChipDecisionRef.current(), waitMs);
    },
    [chipSize, commit, geometry, peek, rejectTutorial]
  );

  const denyCheck = useCallback(() => {
    if (phaseRef.current !== 'live') return;
    setCheckDenied(true);
  }, []);

  const handleCheck = useCallback(() => {
    if (phaseRef.current !== 'live') {
      return;
    }
    if (tutorialActiveRef.current) {
      completeTutorialAction('check');
      return;
    }
    if (!activeSpot.canCheck) {
      denyCheck();
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    resolve('check');
  }, [activeSpot.canCheck, completeTutorialAction, denyCheck, resolve]);

  const completeMuck = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (tutorialActiveRef.current) {
      completeTutorialAction('fold');
      return;
    }
    resolve('fold');
  }, [completeTutorialAction, resolve]);

  const tutorialStep = currentStep(PEEK_AND_PITCH_TUTORIAL.steps, tutorialIndex);
  const tutorialPending = !tutorialReady && !suppressTableActors;
  const showTutorial =
    tutorialReady && tutorialActive && Boolean(tutorialStep) && !suppressTableActors;
  const tutorialAllowed = showTutorial
    ? allowedActionsForStep(PEEK_AND_PITCH_TUTORIAL.steps, tutorialIndex)
    : undefined;
  const checkEnabled =
    Boolean(activeSpot.canCheck) || (showTutorial && tutorialStep?.action === 'check');

  useEffect(() => {
    onTutorialUiRef.current?.(
      showTutorial && tutorialStep
        ? {
            step: tutorialStep,
            stepIndex: tutorialIndex,
            success: tutorialSuccess,
            rejectTick,
            cardHit: geometry.cardHit,
            stackHit: geometry.stackHit,
            tableCenter: geometry.tableCenter,
            onGesture: completeTutorialAction,
            onReject: rejectTutorial,
            onSkip: endTutorial,
          }
        : null
    );
  }, [
    completeTutorialAction,
    endTutorial,
    geometry.cardHit,
    geometry.stackHit,
    geometry.tableCenter,
    rejectTick,
    rejectTutorial,
    showTutorial,
    tutorialIndex,
    tutorialStep,
    tutorialSuccess,
  ]);

  const handLabel = describeHoleCards(cards);

  return (
    <View style={[styles.root, { backgroundColor: skin.feltTint }]}>
      <View style={styles.tableLayer} pointerEvents="none">
        <TableScene skin={activeSpot.skin} width={width} height={height} />
        <FeltPlane
          width={width}
          nearY={geometry.restCenter.y}
          farY={geometry.dealOrigin.y}
          plane={skin.feltPlane}
        />
      </View>

      <CommunityCards
        cards={activeSpot.board}
        viewportWidth={width}
        maxWidth={stage * 0.76}
        farY={geometry.dealOrigin.y}
        nearY={geometry.restCenter.y}
      />

      {suppressTableActors ? null : (
        <View
          style={[
            styles.stackHolder,
            {
              left: geometry.stackHit.x,
              top: geometry.stackHit.y,
              width: geometry.stackHit.width,
              height: geometry.stackHit.height,
            },
          ]}
          pointerEvents="none">
          <ChipStack
            stackLabel={activeSpot.heroStackLabel}
            disabled={phase !== 'live'}
            pushed={pushedChips}
            press={stackPress}
            dragX={stackDragX}
            dragY={stackDragY}
            chipSize={chipSize}
          />
        </View>
      )}

      {suppressTableActors ? null : (
        <View
          style={[
            styles.stackHitLayer,
            {
              left: geometry.stackHit.x,
              top: geometry.stackHit.y,
              width: geometry.stackHit.width,
              height: geometry.stackHit.height,
            },
          ]}>
          <ChipStackTarget
            live={phase === 'live' && !disabled && !pitching && !tutorialPending}
            canCheck={checkEnabled}
            stackLabel={activeSpot.heroStackLabel}
            potCenter={geometry.tableCenter}
            stackCenter={{
              x: geometry.stackHit.x + geometry.stackHit.width / 2,
              y: geometry.stackHit.y + geometry.stackHit.height / 2,
            }}
            stackPress={stackPress}
            stackDragX={stackDragX}
            stackDragY={stackDragY}
            onCall={() => handleChipDecision('call')}
            onRaise={() => handleChipDecision('raise')}
            onCheck={handleCheck}
            onIllegalCheck={showTutorial ? rejectTutorial : denyCheck}
            allowedActions={tutorialAllowed}
            onRejected={showTutorial ? rejectTutorial : undefined}
          />
        </View>
      )}

      <View style={styles.playLayer} pointerEvents="box-none">
        <HoleCards
          cards={cards}
          peek={peek}
          muck={muck}
          deal={deal}
          cardWidth={cardWidth}
          dealOrigin={geometry.dealOrigin}
          tableCenter={geometry.tableCenter}
          restCenter={geometry.restCenter}
          plane={skin.feltPlane}
        />

        {suppressTableActors ? null : (
          <>
            <BarrierHand
              contact={geometry.barrierContact}
              stackAnchor={geometry.stackAnchor}
              tableCenter={geometry.tableCenter}
              handWidth={barrierWidth}
              chipSize={chipSize}
              viewportHeight={height}
              deal={deal}
              peek={peek}
              muck={muck}
              commit={commit}
            />

            <HeroHand
              contact={geometry.handContact}
              tableCenter={geometry.tableCenter}
              handWidth={handWidth}
              cardHeight={cardHeight}
              viewportHeight={height}
              plane={skin.feltPlane}
              deal={deal}
              peek={peek}
              muck={muck}
              commit={commit}
            />
          </>
        )}
      </View>

      {suppressTableActors ? null : <ChipToss flights={flights} onComplete={onTossComplete} />}

      <GestureHints
        peek={peek}
        peeked={peeked}
        visible={phase === 'live' && !disabled && !showTutorial}
        canCheck={checkEnabled}
        top={geometry.board.hintTop}
      />

      <TableGestures
        live={phase === 'live' && !disabled && !pitching && !tutorialPending}
        canCheck={checkEnabled}
        height={height}
        stackHit={geometry.stackHit}
        cardHit={geometry.cardHit}
        peek={peek}
        muck={muck}
        allowedActions={tutorialAllowed}
        gestureEpoch={gestureEpoch}
        onPeeked={markPeeked}
        onCheck={handleCheck}
        onMuck={completeMuck}
        onIllegalCheck={showTutorial ? rejectTutorial : denyCheck}
        onRejected={showTutorial ? rejectTutorial : undefined}
      />

      {suppressTableActors ? null : (
        <View
          style={[styles.bannerHolder, { top: insets.top + ACTION_BANNER_BELOW_HUD }]}
          pointerEvents="box-none">
          <ActionBanner
            position={activeSpot.position}
            actionLine={activeSpot.actionLine}
            potLabel={activeSpot.potLabel}
            streetLabel={streetLabelForBoard(activeSpot.board.length)}
            progressLabel={activeSpot.progressLabel}
            accent={skin.accent}
            decision={decision}
            handLabel={decision ? handLabel : null}
            onOpenPicker={showAuthoringControls ? () => setPickerOpen(true) : undefined}
          />
        </View>
      )}

      {suppressTableActors ? null : (
        <PeekHud
          cards={cards}
          peek={peek}
          muck={muck}
          restCenter={geometry.restCenter}
          cardHeight={cardHeight}
        />
      )}

      {checkDenied ? (
        <View
          accessible
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
          style={[styles.toast, { bottom: insets.bottom + 28 }]}>
          <Text style={styles.toastText}>{STRINGS.cannotCheck}</Text>
        </View>
      ) : null}

      {phase === 'resolved' && showNextHandControl ? (
        <View
          style={[
            styles.footer,
            { bottom: insets.bottom + 24, left: geometry.restCenter.x + 12, right: stageLeft + 20 },
          ]}
          pointerEvents="box-none">
          <Pressable
            testID="deal-next-hand"
            style={styles.nextButton}
            onPress={() => dealHand(activeSpot)}>
            <Text style={styles.nextButtonText}>{STRINGS.nextHand}</Text>
          </Pressable>
        </View>
      ) : null}

      {pickerOpen ? (
        <CardPicker
          visible
          cards={cards}
          skin={activeSpot.skin}
          onClose={() => setPickerOpen(false)}
          onApply={(nextCards, nextSkin: TableSkin) => {
            setPickerOpen(false);
            dealHand({
              ...activeSpot,
              skin: nextSkin,
              heroCards: nextCards ? [formatCard(nextCards[0]), formatCard(nextCards[1])] : null,
            });
          }}
        />
      ) : null}

      {embedTutorialOverlay && showTutorial && tutorialStep ? (
        <GestureTutorialOverlay
          config={PEEK_AND_PITCH_TUTORIAL}
          step={tutorialStep}
          stepIndex={tutorialIndex}
          cardHit={geometry.cardHit}
          stackHit={geometry.stackHit}
          tableCenter={geometry.tableCenter}
          success={tutorialSuccess}
          rejectTick={rejectTick}
          onGesture={completeTutorialAction}
          onReject={rejectTutorial}
          onSkip={endTutorial}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'visible',
  },
  tableLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 0,
    elevation: 0,
  },
  playLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 20,
    elevation: 20,
    overflow: 'visible',
  },
  stackHolder: {
    position: 'absolute',
    zIndex: 8,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  stackHitLayer: {
    position: 'absolute',
    zIndex: 55,
    elevation: 55,
  },
  bannerHolder: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 25,
  },
  footer: {
    position: 'absolute',
    alignItems: 'center',
  },
  nextButton: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#C89B3C',
  },
  nextButtonText: {
    color: '#111714',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.4,
  },
  toast: {
    position: 'absolute',
    left: 24,
    right: 24,
    zIndex: 80,
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: artStyle.colors.oxblood,
    backgroundColor: 'rgba(17,23,20,0.94)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastText: {
    color: artStyle.colors.cream,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
});
