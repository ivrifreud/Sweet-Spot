/* eslint-disable react-hooks/immutability -- Reanimated SharedValues are mutable animation state. */
/* eslint-disable react-hooks/set-state-in-effect -- Props drive the template state machine and reset cycle. */
import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { startAmbience, stopAmbience } from '../../../../lib/audio';
import { artStyle } from '../../../../theme/artStyle';
import type { DecisionOutcome } from '../../decision-feedback/types';
import { DEFAULT_EQUITY_SPOT, OUTCOME_ANIMATION_MS, REDUCED_OUTCOME_MS } from './config';
import { scaleTilt } from './dialMath';
import { equityScaleArt } from './equityScaleArt';
import { percent, requiredEquity } from './equityMath';
import { EQUITY_STRINGS } from './strings';
import { HeroChipStack } from './components/HeroChipStack';
import { HeroHoleCards } from './components/HeroHoleCards';
import { OutsDial } from './components/OutsDial';
import { ScaleScene } from './components/ScaleScene';
import type {
  EquityDecision,
  EquityScalePhase,
  EquityScaleSpot,
  EquityScaleSubmission,
} from './types';

export type EquityScaleTemplateProps = {
  spot?: EquityScaleSpot;
  disabled?: boolean;
  resetKey?: number;
  outcome?: DecisionOutcome | null;
  onSubmit?: (submission: EquityScaleSubmission) => void;
  onOutcomeAnimationComplete?: () => void;
};

export function EquityScaleTemplate({
  spot = DEFAULT_EQUITY_SPOT,
  disabled = false,
  resetKey = 0,
  outcome = null,
  onSubmit,
  onOutcomeAnimationComplete,
}: EquityScaleTemplateProps) {
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular });
  const [selectedOuts, setSelectedOuts] = useState(8);
  const [phase, setPhase] = useState<EquityScalePhase>('entering');
  const submittedRef = useRef(false);
  const animatedOutcomeRef = useRef<DecisionOutcome | null>(null);
  const onOutcomeCompleteRef = useRef(onOutcomeAnimationComplete);
  const reaction = useSharedValue(0);

  useEffect(() => {
    onOutcomeCompleteRef.current = onOutcomeAnimationComplete;
  }, [onOutcomeAnimationComplete]);

  useEffect(() => {
    setSelectedOuts(8);
    setPhase('entering');
    submittedRef.current = false;
    animatedOutcomeRef.current = null;
    reaction.value = 0;
    const timer = setTimeout(() => setPhase('deciding'), reducedMotion ? 80 : 360);
    return () => clearTimeout(timer);
  }, [reaction, reducedMotion, resetKey, spot.id]);

  useEffect(() => {
    if (spot.skin !== 'garden') return;
    startAmbience('bennys-garden', 'night');
    return () => stopAmbience();
  }, [spot.skin]);

  useEffect(() => {
    if (!outcome || !submittedRef.current || animatedOutcomeRef.current === outcome) return;
    animatedOutcomeRef.current = outcome;
    setPhase(outcome);
    reaction.value = reducedMotion
      ? 1
      : withSequence(
          withTiming(1, { duration: 210, easing: Easing.out(Easing.cubic) }),
          withTiming(0.88, { duration: 180 }),
          withTiming(1, { duration: 180 })
        );
    const timer = setTimeout(
      () => {
        setPhase('resolved');
        onOutcomeCompleteRef.current?.();
      },
      reducedMotion ? REDUCED_OUTCOME_MS : OUTCOME_ANIMATION_MS
    );
    return () => clearTimeout(timer);
  }, [outcome, reaction, reducedMotion]);

  const tilt = useMemo(
    () =>
      scaleTilt({
        selectedOuts,
        street: spot.street,
        potBeforeCall: spot.potBeforeCall,
        priceToCall: spot.priceToCall,
      }),
    [selectedOuts, spot.potBeforeCall, spot.priceToCall, spot.street]
  );
  const needed = percent(requiredEquity(spot.potBeforeCall, spot.priceToCall));
  const display = fontsLoaded ? styles.displayLoaded : null;
  const live = !disabled && (phase === 'deciding' || phase === 'dialing');

  const submit = useCallback(
    (decision: EquityDecision) => {
      if (!live || submittedRef.current) return;
      submittedRef.current = true;
      setPhase('submitting');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      onSubmit?.({ decision, selectedOuts });
    },
    [live, onSubmit, selectedOuts]
  );

  const gloveStyle = useAnimatedStyle(() => ({
    opacity: reaction.value,
    transform: [{ translateY: (1 - reaction.value) * 24 }, { scale: 0.9 + reaction.value * 0.1 }],
  }));

  const activeOutcome =
    phase === 'correct' || phase === 'incorrect' || phase === 'resolved' ? outcome : null;

  return (
    <View style={styles.root}>
      <View style={[styles.header, { top: insets.top + 64 }]}>
        <View>
          <Text style={[styles.title, display]}>{EQUITY_STRINGS.title}</Text>
          <Text style={styles.action}>
            {spot.position} · {spot.actionLine}
          </Text>
        </View>
        <Text style={styles.progress}>{spot.progressLabel}</Text>
      </View>

      <View style={[styles.valueRow, { top: insets.top + 116 }]}>
        <ValuePlate label={EQUITY_STRINGS.potLabel} value={`${spot.potBeforeCall}bb`} />
        <ValuePlate label="Equity needed" value={needed} />
        <ValuePlate label={EQUITY_STRINGS.callLabel} value={`${spot.priceToCall}bb`} />
      </View>

      <View style={[styles.scaleWrap, { top: insets.top + 108 }]}>
        <ScaleScene tilt={tilt} outcome={activeOutcome} />
      </View>

      <HeroChipStack bottom={insets.bottom + 8} />
      <HeroHoleCards cards={spot.heroCards} bottom={insets.bottom + 8} />

      <View style={[styles.dialWrap, { bottom: insets.bottom + 52 }]}>
        <Text style={styles.instruction}>{EQUITY_STRINGS.instruction}</Text>
        <OutsDial
          value={selectedOuts}
          enabled={live}
          onChange={setSelectedOuts}
          onAdjustStart={() => setPhase('dialing')}
          onAdjustEnd={() => setPhase((current) => (current === 'dialing' ? 'deciding' : current))}
        />
      </View>

      <View style={[styles.actions, { bottom: insets.bottom + 116 }]}>
        <DecisionButton
          label={EQUITY_STRINGS.call}
          decision="call"
          enabled={live}
          onPress={submit}
          display={display}
        />
        <View pointerEvents="none" style={styles.dialClearance} />
        <DecisionButton
          label={EQUITY_STRINGS.fold}
          decision="fold"
          enabled={live}
          onPress={submit}
          display={display}
        />
      </View>

      {phase === 'submitting' ? (
        <Text accessibilityLiveRegion="polite" style={styles.status}>
          {EQUITY_STRINGS.submitting}
        </Text>
      ) : null}
      {activeOutcome ? (
        <>
          <Animated.View pointerEvents="none" style={[styles.reaction, gloveStyle]}>
            <Image
              source={
                activeOutcome === 'correct'
                  ? equityScaleArt.gloveCelebrate
                  : equityScaleArt.gloveSurprise
              }
              resizeMode="contain"
              style={styles.reactionImage}
            />
          </Animated.View>
          <Text accessibilityLiveRegion="polite" style={styles.outcomeText}>
            {activeOutcome === 'correct' ? EQUITY_STRINGS.correct : EQUITY_STRINGS.incorrect}
          </Text>
        </>
      ) : null}
    </View>
  );
}

function ValuePlate({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.valuePlate}>
      <Text style={styles.valueLabel}>{label}</Text>
      <Text style={styles.valueText}>{value}</Text>
    </View>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function DecisionButton({
  label,
  decision,
  enabled,
  onPress,
  display,
}: {
  label: string;
  decision: EquityDecision;
  enabled: boolean;
  onPress: (decision: EquityDecision) => void;
  display: object | null;
}) {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pressIn = () => {
    if (!enabled) return;
    scale.value = reducedMotion ? 0.96 : withTiming(0.96, { duration: 100 });
  };

  const pressOut = () => {
    scale.value = reducedMotion
      ? 1
      : withSequence(
          withTiming(1.04, { duration: 90 }),
          withTiming(1, { duration: 110, easing: Easing.out(Easing.cubic) })
        );
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={`${label.toLowerCase()} and lock in`}
      disabled={!enabled}
      onPress={() => onPress(decision)}
      onPressIn={pressIn}
      onPressOut={pressOut}
      style={[
        styles.actionButton,
        decision === 'call' ? styles.callButton : styles.foldButton,
        !enabled && styles.actionDisabled,
        pressStyle,
      ]}>
      <Text style={[styles.actionText, display]}>{label}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: artStyle.colors.projectorBlack,
  },
  header: {
    position: 'absolute',
    left: 16,
    right: 16,
    minHeight: 44,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 30,
  },
  title: {
    color: artStyle.colors.goldBright,
    fontSize: 25,
    letterSpacing: 1.8,
    fontWeight: '900',
  },
  displayLoaded: {
    fontFamily: 'BebasNeue_400Regular',
  },
  action: {
    color: artStyle.colors.cream,
    fontSize: 12,
    fontWeight: '700',
    marginTop: -2,
  },
  progress: {
    color: artStyle.colors.cream,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 7,
  },
  valueRow: {
    position: 'absolute',
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    zIndex: 32,
  },
  valuePlate: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: artStyle.colors.gold,
    backgroundColor: 'rgba(17,23,20,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  valueLabel: {
    color: 'rgba(232,215,167,0.78)',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  valueText: {
    color: artStyle.colors.goldBright,
    fontSize: 17,
    fontWeight: '900',
  },
  scaleWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  dialWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 45,
    overflow: 'visible',
  },
  instruction: {
    color: artStyle.colors.cream,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    textAlign: 'center',
    width: 290,
    marginBottom: 4,
    zIndex: 6,
  },
  actions: {
    position: 'absolute',
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 50,
  },
  dialClearance: {
    flex: 1,
    minWidth: 132,
    height: 1,
  },
  actionButton: {
    width: 104,
    minHeight: 64,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: artStyle.colors.projectorBlack,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.78,
    shadowRadius: 12,
    elevation: 8,
  },
  callButton: {
    backgroundColor: artStyle.colors.feltGreen,
    shadowColor: artStyle.colors.feltGreen,
  },
  foldButton: {
    backgroundColor: artStyle.colors.oxblood,
    shadowColor: artStyle.colors.oxblood,
  },
  actionDisabled: {
    opacity: 0.48,
  },
  actionText: {
    color: artStyle.colors.cream,
    fontSize: 32,
    letterSpacing: 2.2,
    fontWeight: '900',
    textShadowColor: artStyle.colors.projectorBlack,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 0,
  },
  status: {
    position: 'absolute',
    bottom: 250,
    alignSelf: 'center',
    color: artStyle.colors.cream,
    fontWeight: '800',
    zIndex: 60,
  },
  reaction: {
    position: 'absolute',
    right: 8,
    top: 196,
    width: 90,
    height: 90,
    zIndex: 55,
  },
  reactionImage: {
    width: '100%',
    height: '100%',
  },
  outcomeText: {
    position: 'absolute',
    left: 40,
    right: 40,
    top: 244,
    color: artStyle.colors.cream,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
    zIndex: 56,
    textShadowColor: '#171713',
    textShadowRadius: 4,
  },
});
