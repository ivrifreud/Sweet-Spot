import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Easing, ReduceMotion, runOnJS, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  describeHoleCards,
  formatCard,
  parseHoleCards,
  randomHoleCards,
  type HoleCards as HoleCardsTuple,
} from '@/lib/cards';

import { ActionBanner } from './components/ActionBanner';
import { BarrierHand } from './components/BarrierHand';
import { CardPicker } from './components/CardPicker';
import { ChipStack } from './components/ChipStack';
import { ChipToss, type ChipFlight } from './components/ChipToss';
import { GestureHints } from './components/GestureHints';
import { HeroHand } from './components/HeroHand';
import { CARD_GAP_RATIO, HoleCards } from './components/HoleCards';
import { CARD_ASPECT } from './components/PlayingCard';
import { TableGestures } from './components/TableGestures';
import { TableScene } from './components/TableScene';
import { DEFAULT_SPOT, SKINS, mapBackdropPoint } from './config';
import { STRINGS } from './strings';
import type { PeekAndPitchSpot, SpotDecision, TableSkin, TemplatePhase } from './types';

const PEEK_SPRING = { duration: 400, dampingRatio: 0.8, reduceMotion: ReduceMotion.System } as const;

export type PeekAndPitchTemplateProps = {
  spot?: PeekAndPitchSpot;
  onDecision?: (
    decision: SpotDecision,
    context: { cards: HoleCardsTuple; peeked: boolean }
  ) => void;
  /** Set false to hide the "Set cards" authoring shortcut in production builds. */
  showAuthoringControls?: boolean;
};

/**
 * Template 1 — "The Peek and Pitch".
 *
 * First-person seat at the table: the dealer pitches two cards to the player.
 *   - hold the felt                            -> pinch, lift, and shield the hole cards
 *   - release                                  -> the cards drop flat on the felt
 *   - swipe up from the same grip              -> throw the cards onto the table
 *   - tap your own stack                       -> the glove grabs chips and throws them in
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
  const stackPress = useSharedValue(0);

  const skin = SKINS[activeSpot.skin];

  const stage = Math.min(width, 460);
  const stageLeft = (width - stage) / 2;
  const cardWidth = Math.min(stage * 0.2, 94);
  const cardHeight = cardWidth * CARD_ASPECT;
  const cardGap = cardWidth * CARD_GAP_RATIO;
  const handWidth = stage * 0.78;
  const barrierWidth = stage * 0.72;

  const geometry = useMemo(() => {
    const screen = { width, height };
    const rail = Math.max(88, height * 0.13);

    const restCenter = {
      x: stageLeft + stage * 0.58,
      y: height - insets.bottom - cardHeight * 0.58,
    };

    return {
      dealOrigin: mapBackdropPoint(skin.dealOrigin, skin.backgroundSize, screen),
      tableCenter: mapBackdropPoint(skin.tableCenter, skin.backgroundSize, screen),
      restCenter,
      stackAnchor: {
        x: stageLeft + 88,
        y: height - insets.bottom - rail + 8,
      },
      handContact: {
        x: restCenter.x + cardWidth * 0.22,
        y: restCenter.y + cardHeight * 0.16,
      },
      barrierContact: {
        x: restCenter.x - cardWidth * 0.55,
        y: restCenter.y - cardHeight * 0.22,
      },
    };
  }, [
    cardGap,
    cardHeight,
    cardWidth,
    height,
    insets.bottom,
    skin.backgroundSize,
    skin.dealOrigin,
    skin.tableCenter,
    stage,
    stageLeft,
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
    [commit, deal, muck, peek]
  );

  useEffect(() => {
    dealHand(spot);
  }, [dealHand, spot]);

  useEffect(() => {
    if (phase !== 'dealing') {
      return;
    }
    const timer = setTimeout(() => setPhase('live'), 1100);
    return () => clearTimeout(timer);
  }, [phase]);

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
    const nextFlights: ChipFlight[] = Array.from({ length: 4 }, (_, index) => {
      flightSeed.current += 1;
      const spin = Math.random() > 0.5 ? 1 : -1;
      return {
        id: `chip-${flightSeed.current}`,
        from: {
          x: stackAnchor.x + (Math.random() - 0.5) * 36,
          y: stackAnchor.y - 8 - index * 7,
        },
        to: {
          x: tableCenter.x + (Math.random() - 0.5) * 92,
          y: tableCenter.y + (Math.random() - 0.5) * 48,
        },
        delayMs: 160 + index * 90,
        durationMs: 700,
        arc: 110 + Math.random() * 80,
        spin,
        restRotate: spin * (8 + Math.random() * 22),
      };
    });

    setFlights((current) => [...current, ...nextFlights]);
    setPushedChips((current) => current + 4);
    commit.value = 0;
    commit.value = withSequence(
      withTiming(0.32, { duration: 180, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 720, easing: Easing.inOut(Easing.cubic) })
    );

    peek.value = withSpring(0, PEEK_SPRING);
    resolve('raise');
  }, [commit, geometry, peek, phase, resolve]);

  const completeMuck = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    resolve('fold');
  }, [resolve]);

  const handLabel = describeHoleCards(cards);

  return (
    <View style={[styles.root, { backgroundColor: skin.feltTint }]}>
      <TableScene skin={activeSpot.skin} width={width} height={height} />

      <View
        style={[styles.stackHolder, { bottom: insets.bottom + 18, left: stageLeft + 8 }]}
        pointerEvents="none">
        <ChipStack
          stackLabel={activeSpot.heroStackLabel}
          disabled={phase !== 'live'}
          pushed={pushedChips}
          press={stackPress}
        />
      </View>

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

      <BarrierHand
        contact={geometry.barrierContact}
        handWidth={barrierWidth}
        deal={deal}
        peek={peek}
        muck={muck}
      />

      <HeroHand
        contact={geometry.handContact}
        tableCenter={geometry.tableCenter}
        stackAnchor={geometry.stackAnchor}
        handWidth={handWidth}
        deal={deal}
        peek={peek}
        muck={muck}
        commit={commit}
      />

      <ChipToss flights={flights} />

      <GestureHints peek={peek} peeked={peeked} visible={phase === 'live'} />

      <TableGestures
        live={phase === 'live'}
        width={width}
        height={height}
        peek={peek}
        muck={muck}
        stackPress={stackPress}
        onPeeked={markPeeked}
        onRaise={handleRaise}
        onMuck={completeMuck}
      />

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
        <View
          style={[
            styles.footer,
            { bottom: insets.bottom + 24, left: stageLeft + 128, right: stageLeft + 24 },
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
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
});
