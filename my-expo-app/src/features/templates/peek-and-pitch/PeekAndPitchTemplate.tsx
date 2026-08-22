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
import { DEFAULT_SPOT, GESTURES, SKINS } from './config';
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

function clampWorklet(value: number, min: number, max: number) {
  'worklet';
  return Math.min(Math.max(value, min), max);
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

  const skin = SKINS[activeSpot.skin];

  const cardWidth = Math.min(width * 0.3, 128);
  const cardHeight = cardWidth * CARD_ASPECT;

  const geometry = useMemo(() => {
    const stackAnchor = {
      x: width - 92,
      y: height - insets.bottom - 78,
    };

    return {
      dealOrigin: { x: width * skin.dealOrigin.x, y: height * skin.dealOrigin.y },
      tableCenter: { x: width * skin.tableCenter.x, y: height * skin.tableCenter.y },
      restCenter: {
        x: width * 0.36,
        y: height - insets.bottom - 56 - cardHeight / 2,
      },
      stackAnchor,
    };
  }, [
    cardHeight,
    height,
    insets.bottom,
    skin.dealOrigin.x,
    skin.dealOrigin.y,
    skin.tableCenter.x,
    skin.tableCenter.y,
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
          x: stackAnchor.x + (Math.random() - 0.5) * 18,
          y: stackAnchor.y - index * 5,
        },
        to: {
          x: tableCenter.x + (Math.random() - 0.5) * 66,
          y: tableCenter.y + (Math.random() - 0.5) * 34,
        },
        delayMs: index * 55,
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

      <GestureHints peek={peek} peeked={peeked} visible={phase === 'live'} />

      <GestureDetector gesture={pan}>
        <Animated.View style={StyleSheet.absoluteFill} collapsable={false} />
      </GestureDetector>

      <View
        style={[styles.stackHolder, { bottom: insets.bottom + 14, right: 16 }]}
        pointerEvents="box-none">
        <ChipStack
          stackLabel={activeSpot.heroStackLabel}
          disabled={phase !== 'live'}
          pushed={pushedChips}
          onRaise={handleRaise}
        />
      </View>

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
        <View style={[styles.footer, { bottom: insets.bottom + 18 }]} pointerEvents="box-none">
          <Pressable style={styles.nextButton} onPress={() => dealHand(activeSpot)}>
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
    left: 0,
    right: 0,
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
