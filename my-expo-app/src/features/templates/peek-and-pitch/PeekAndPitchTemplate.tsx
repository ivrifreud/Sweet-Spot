import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useSharedValue,
  withSpring,
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

import { ActionBanner } from './components/ActionBanner';
import { CardPicker } from './components/CardPicker';
import { ChipStack } from './components/ChipStack';
import { ChipToss, type ChipFlight } from './components/ChipToss';
import { GestureHints } from './components/GestureHints';
import { HoleCards } from './components/HoleCards';
import { CARD_ASPECT } from './components/PlayingCard';
import { TableScene } from './components/TableScene';
import { DEFAULT_SPOT, GESTURES, SKINS, mapBackdropPoint } from './config';
import { STRINGS } from './strings';
import type { PeekAndPitchSpot, SpotDecision, TableSkin, TemplatePhase } from './types';

/** Peek gesture direction lock. */
const MODE_UNDECIDED = 0;
const MODE_PEEK = 1;
const MODE_MUCK = 2;

export type PeekAndPitchTemplateProps = {
  spot?: PeekAndPitchSpot;
  onDecision?: (
    decision: SpotDecision,
    context: { cards: HoleCardsTuple; peeked: boolean }
  ) => void;
  /** Set false to hide the "Set cards" authoring shortcut in production builds. */
  showAuthoringControls?: boolean;
};

type Rect = { x: number; y: number; width: number; height: number };

function clampWorklet(value: number, min: number, max: number) {
  'worklet';
  return Math.min(Math.max(value, min), max);
}

/** Generous hit test so the stack is easy to hit with a thumb. */
function insideStack(x: number, y: number, rect: Rect) {
  'worklet';
  const pad = 12;
  return (
    rect.width > 0 &&
    x >= rect.x - pad &&
    x <= rect.x + rect.width + pad &&
    y >= rect.y - pad &&
    y <= rect.y + rect.height + pad
  );
}

/**
 * Template 1 — "The Peek and Pitch".
 *
 * First-person seat at the table: the dealer pitches two cards to the player, the rest of
 * the table stays out of focus behind the smoke. Three gestures resolve the spot:
 *   - drag down from the middle of the screen  -> peek at the hole cards
 *   - swipe up from the bottom rail            -> muck the hand
 *   - tap your own stack                       -> push chips in and raise
 */
export function PeekAndPitchTemplate({
  spot = DEFAULT_SPOT,
  onDecision,
  showAuthoringControls = true,
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
  const flightSeed = useRef(0);
  const resolvedRef = useRef(false);

  const deal = useSharedValue(0);
  const peek = useSharedValue(0);
  const muck = useSharedValue(0);
  const commit = useSharedValue(0);
  const peekBase = useSharedValue(0);
  const gestureMode = useSharedValue(MODE_UNDECIDED);
  const startedLow = useSharedValue(0);
  const stackPress = useSharedValue(0);
  const stackRect = useSharedValue<Rect>({ x: 0, y: 0, width: 0, height: 0 });

  const skin = SKINS[activeSpot.skin];

  const cardWidth = Math.min(width * 0.27, 118);
  const cardHeight = cardWidth * CARD_ASPECT;

  const geometry = useMemo(() => {
    const screen = { width, height };
    // Room kept below the cards for the rail: the muck swipe and the next-hand button.
    const rail = Math.max(88, height * 0.12);

    return {
      dealOrigin: mapBackdropPoint(skin.dealOrigin, skin.backgroundSize, screen),
      tableCenter: mapBackdropPoint(skin.tableCenter, skin.backgroundSize, screen),
      restCenter: {
        x: width * 0.34,
        y: height - insets.bottom - rail - cardHeight / 2,
      },
      stackAnchor: {
        x: width - 74,
        y: height - insets.bottom - rail + 20,
      },
    };
  }, [
    cardHeight,
    height,
    insets.bottom,
    skin.backgroundSize,
    skin.dealOrigin,
    skin.tableCenter,
    width,
  ]);

  const dealHand = useCallback(
    (nextSpot: PeekAndPitchSpot) => {
      setActiveSpot(nextSpot);
      setCards(nextSpot.heroCards ? parseHoleCards(nextSpot.heroCards) : randomHoleCards());
      setDecision(null);
      setPeeked(false);
      setFlights([]);
      setPushedChips(0);
      setPhase('dealing');
      resolvedRef.current = false;

      peek.value = 0;
      muck.value = 0;
      commit.value = 0;
      peekBase.value = 0;
      gestureMode.value = MODE_UNDECIDED;
      deal.value = 0;
      deal.value = withTiming(
        1,
        { duration: 950, easing: Easing.out(Easing.cubic) },
        (finished) => {
          if (finished) {
            runOnJS(setPhase)('live');
          }
        }
      );
    },
    [commit, deal, gestureMode, muck, peek, peekBase]
  );

  useEffect(() => {
    dealHand(spot);
  }, [dealHand, spot]);

  const markPeeked = useCallback(() => {
    setPeeked((current) => {
      if (!current) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
      return true;
    });
  }, []);

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

  const handleRaise = useCallback(() => {
    if (phase !== 'live') {
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    const { stackAnchor, tableCenter } = geometry;
    const tones: ChipFlight['tone'][] = ['red', 'red', 'blue', 'black', 'blue'];
    const nextFlights: ChipFlight[] = tones.map((tone, index) => {
      flightSeed.current += 1;
      return {
        id: `chip-${flightSeed.current}`,
        tone,
        from: {
          x: stackAnchor.x + (Math.random() - 0.5) * 26,
          y: stackAnchor.y - index * 6,
        },
        to: {
          x: tableCenter.x + (Math.random() - 0.5) * 78,
          y: tableCenter.y + (Math.random() - 0.5) * 40,
        },
        delayMs: index * 85 + Math.random() * 40,
        durationMs: 480 + Math.random() * 200,
        arc: 55 + Math.random() * 70,
        spin: Math.random() > 0.5 ? 1 : -1,
      };
    });

    setFlights((current) => [...current, ...nextFlights]);
    setPushedChips((current) => current + 3);
    commit.value = withSpring(1, { damping: 14, stiffness: 140 });

    // Show what the player just committed with, even if they raised blind.
    peek.value = withTiming(1, { duration: 320, easing: Easing.out(Easing.quad) });
    resolve('raise');
  }, [commit, geometry, peek, phase, resolve]);

  const completeMuck = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    resolve('fold');
  }, [resolve]);

  const peekTravel = height * GESTURES.peekTravel;
  const muckTravel = height * GESTURES.muckTravel;
  const muckZoneTop = height * GESTURES.muckZoneTop;

  const pan = Gesture.Pan()
    .enabled(phase === 'live')
    .minDistance(3)
    .onBegin((event) => {
      gestureMode.value = MODE_UNDECIDED;
      peekBase.value = peek.value;
      startedLow.value = event.y > muckZoneTop ? 1 : 0;
    })
    .onUpdate((event) => {
      if (gestureMode.value === MODE_UNDECIDED) {
        if (Math.abs(event.translationY) < GESTURES.directionLock) {
          return;
        }
        gestureMode.value =
          startedLow.value === 1 && event.translationY < 0 ? MODE_MUCK : MODE_PEEK;
      }

      if (gestureMode.value === MODE_PEEK) {
        peek.value = clampWorklet(peekBase.value + event.translationY / peekTravel, 0, 1);
      } else {
        muck.value = clampWorklet(-event.translationY / muckTravel, 0, 0.98);
      }
    })
    .onEnd((event) => {
      if (gestureMode.value === MODE_MUCK) {
        const committed =
          muck.value > GESTURES.muckCommit || event.velocityY < -GESTURES.flickVelocity;

        if (committed) {
          peek.value = withTiming(0, { duration: 180 });
          muck.value = withTiming(
            1,
            { duration: 460, easing: Easing.out(Easing.quad) },
            (finished) => {
              if (finished) {
                runOnJS(completeMuck)();
              }
            }
          );
        } else {
          muck.value = withSpring(0, { damping: 18, stiffness: 190 });
        }
        return;
      }

      if (gestureMode.value === MODE_PEEK) {
        const open = peek.value > GESTURES.peekCommit || event.velocityY > GESTURES.flickVelocity;
        peek.value = withSpring(open ? 1 : 0, { damping: 20, stiffness: 170 });
        if (open) {
          runOnJS(markPeeked)();
        }
      }
    });

  // The stack tap lives on the same layer as the drags, otherwise the chips would swallow
  // muck swipes that start on top of them.
  const tapStack = Gesture.Tap()
    .enabled(phase === 'live')
    .maxDistance(14)
    .onBegin((event) => {
      stackPress.value = insideStack(event.x, event.y, stackRect.value) ? 1 : 0;
    })
    .onEnd((event, success) => {
      if (success && insideStack(event.x, event.y, stackRect.value)) {
        runOnJS(handleRaise)();
      }
    })
    .onFinalize(() => {
      stackPress.value = 0;
    });

  const tableGestures = Gesture.Race(tapStack, pan);

  const handLabel = describeHoleCards(cards);

  return (
    <View style={[styles.root, { backgroundColor: skin.feltTint }]}>
      <TableScene skin={activeSpot.skin} focus={peek} width={width} height={height} />

      <ChipToss flights={flights} />

      <HoleCards
        cards={cards}
        peek={peek}
        muck={muck}
        deal={deal}
        commit={commit}
        cardWidth={cardWidth}
        dealOrigin={geometry.dealOrigin}
        tableCenter={geometry.tableCenter}
        restCenter={geometry.restCenter}
      />

      <View
        style={[styles.stackHolder, { bottom: insets.bottom + 10, right: 12 }]}
        pointerEvents="none"
        onLayout={(event) => {
          const { x, y, width: w, height: h } = event.nativeEvent.layout;
          stackRect.value = { x, y, width: w, height: h };
        }}>
        <ChipStack
          stackLabel={activeSpot.heroStackLabel}
          disabled={phase !== 'live'}
          pushed={pushedChips}
          press={stackPress}
        />
      </View>

      <GestureHints peek={peek} peeked={peeked} visible={phase === 'live'} />

      <GestureDetector gesture={tableGestures}>
        <Animated.View style={StyleSheet.absoluteFill} collapsable={false} />
      </GestureDetector>

      <View style={[styles.bannerHolder, { top: insets.top + 10 }]} pointerEvents="box-none">
        <ActionBanner
          position={activeSpot.position}
          actionLine={activeSpot.actionLine}
          potLabel={activeSpot.potLabel}
          accent={skin.accent}
          decision={decision}
          handLabel={decision ? handLabel : null}
          onOpenPicker={showAuthoringControls ? () => setPickerOpen(true) : undefined}
        />
      </View>

      {phase === 'resolved' ? (
        <View style={[styles.footer, { bottom: insets.bottom + 24 }]} pointerEvents="box-none">
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  stackHolder: {
    position: 'absolute',
  },
  bannerHolder: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  footer: {
    position: 'absolute',
    left: 16,
    // Keeps clear of the chip stack in the bottom-right corner.
    right: 148,
    alignItems: 'center',
  },
  nextButton: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(240,193,92,0.94)',
  },
  nextButtonText: {
    color: '#171412',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.4,
  },
});
