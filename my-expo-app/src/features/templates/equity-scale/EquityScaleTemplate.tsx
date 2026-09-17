/* eslint-disable react-hooks/immutability -- Reanimated SharedValues are mutable animation state. */
/* eslint-disable react-hooks/set-state-in-effect -- Props drive the template state machine and reset cycle. */
import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { playSfx } from '../../../../lib/audio';
import { resultClipKind } from '../../../../lib/equity-scale/resultPresentation';
import { artStyle } from '../../../../theme/artStyle';
import type { DecisionOutcome } from '../../decision-feedback/types';
import {
  DEFAULT_EQUITY_SPOT,
  EQUITY_DIAL_MAX,
  EQUITY_DIAL_MIN,
  EQUITY_INITIAL_EQUITY,
  EQUITY_INITIAL_OUTS,
  EQUITY_OUTS_MAX,
  EQUITY_OUTS_MIN,
} from './config';
import { dialValueToTilt } from './components/scaleArmLayout';
import { percent, requiredEquity } from './equityMath';
import { equityScaleArt } from './equityScaleArt';
import { EQUITY_STRINGS, equityStreetTitle } from './strings';
import { ArtButton } from './components/ArtButton';
import { BoardCards } from './components/BoardCards';
import { EstimateDial } from './components/EstimateDial';
import { HeroHoleCards } from './components/HeroHoleCards';
import { ScaleScene } from './components/ScaleScene';
import { StageResultsReveal } from './components/StageResultsReveal';
import { TableBackdrop } from './components/TableBackdrop';
import { equityTableLayout } from './tableLayout';
import type {
  EquityDecision,
  EquityGrade,
  EquityScalePhase,
  EquityScaleSpot,
  EquityScaleSubmission,
} from './types';

export type EquityScaleTemplateProps = {
  spot?: EquityScaleSpot;
  disabled?: boolean;
  resetKey?: number;
  outcome?: DecisionOutcome | null;
  grade?: EquityGrade | null;
  onSubmit?: (submission: EquityScaleSubmission) => void;
  onOutcomeAnimationComplete?: () => void;
};

export function EquityScaleTemplate({
  spot = DEFAULT_EQUITY_SPOT,
  disabled = false,
  resetKey = 0,
  outcome = null,
  grade = null,
  onSubmit,
  onOutcomeAnimationComplete,
}: EquityScaleTemplateProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular });
  const display = fontsLoaded ? { fontFamily: 'BebasNeue_400Regular' } : null;
  const [selectedOuts, setSelectedOuts] = useState(EQUITY_INITIAL_OUTS);
  const [selectedEquity, setSelectedEquity] = useState(EQUITY_INITIAL_EQUITY);
  const [lockedOuts, setLockedOuts] = useState<number | null>(null);
  const [phase, setPhase] = useState<EquityScalePhase>('entering');
  const submittedRef = useRef(false);
  const animatedOutcomeRef = useRef<DecisionOutcome | null>(null);
  const revealCompleteRef = useRef(false);
  const onOutcomeCompleteRef = useRef(onOutcomeAnimationComplete);

  useEffect(() => {
    onOutcomeCompleteRef.current = onOutcomeAnimationComplete;
  }, [onOutcomeAnimationComplete]);

  useEffect(() => {
    setSelectedOuts(EQUITY_INITIAL_OUTS);
    setSelectedEquity(EQUITY_INITIAL_EQUITY);
    setLockedOuts(null);
    setPhase('entering');
    submittedRef.current = false;
    animatedOutcomeRef.current = null;
    revealCompleteRef.current = false;
    const timer = setTimeout(() => setPhase('stage1'), 280);
    return () => clearTimeout(timer);
  }, [resetKey, spot.id]);

  const onRevealComplete = useCallback(() => {
    if (!outcome || revealCompleteRef.current) return;
    revealCompleteRef.current = true;
    setPhase(outcome);
    onOutcomeCompleteRef.current?.();
  }, [outcome]);

  useEffect(() => {
    if (!outcome || !submittedRef.current || animatedOutcomeRef.current === outcome) return;
    animatedOutcomeRef.current = outcome;
    setPhase('revealing');
  }, [outcome]);

  const potOdds = requiredEquity(spot.potBeforeCall, spot.priceToCall);
  const showingOuts = phase === 'entering' || phase === 'stage1';
  const tilt = useMemo(
    () =>
      showingOuts
        ? dialValueToTilt(selectedOuts, EQUITY_OUTS_MIN, EQUITY_OUTS_MAX)
        : dialValueToTilt(selectedEquity, EQUITY_DIAL_MIN, EQUITY_DIAL_MAX),
    [selectedEquity, selectedOuts, showingOuts]
  );
  const stage1Live = !disabled && phase === 'stage1';
  const stage2Live = !disabled && phase === 'stage2';
  const revealing =
    phase === 'revealing' || phase === 'correct' || phase === 'incorrect' || phase === 'resolved';
  const holdForResultClip = resultClipKind(grade) !== null;

  const lockOuts = useCallback(() => {
    if (!stage1Live) return;
    playSfx('scaleButton');
    setLockedOuts(selectedOuts);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setPhase('stage2');
  }, [selectedOuts, stage1Live]);

  const submit = useCallback(
    (decision: EquityDecision) => {
      if (!stage2Live || submittedRef.current) return;
      playSfx('scaleButton');
      submittedRef.current = true;
      setPhase('submitting');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      onSubmit?.({
        decision,
        selectedOuts: lockedOuts ?? selectedOuts,
        selectedEquity,
      });
    },
    [lockedOuts, onSubmit, selectedEquity, selectedOuts, stage2Live]
  );

  const activeOutcome =
    phase === 'correct' || phase === 'incorrect' || phase === 'revealing' || phase === 'resolved'
      ? outcome
      : null;

  const table = equityTableLayout({
    width: windowWidth,
    height: windowHeight,
    topInset: insets.top,
    bottomInset: insets.bottom,
    showingOuts,
    boardCount: spot.board.length,
  });
  const { scaleTop, cardsTop, valueTop, streetTop, actionBottom, dialSize, buttonSize, sideInset } =
    table;

  return (
    <View style={styles.root} accessibilityRole="image" accessibilityLabel="Equity Scale table">
      <TableBackdrop skin={spot.skin} />

      <View style={[styles.streetBand, { top: streetTop }]}>
        <Text
          accessibilityRole="header"
          style={[styles.streetTitle, display]}
          maxFontSizeMultiplier={1.2}>
          {equityStreetTitle(spot.street)}
        </Text>
        <Text numberOfLines={1} style={styles.streetCue}>
          {spot.position} · {spot.actionLine}
        </Text>
      </View>

      <View style={[styles.scaleWrap, { top: scaleTop }]}>
        <ScaleScene
          tilt={tilt}
          outcome={activeOutcome}
          stagesCorrect={grade?.stagesCorrect ?? null}
          width={table.scaleWidth}
          height={table.scaleHeight}
        />
      </View>

      {showingOuts ? null : (
        <View style={[styles.valueGrid, { top: valueTop }]}>
          <ValuePlate label={EQUITY_STRINGS.potLabel} value={`${spot.potBeforeCall}bb`} />
          <ValuePlate label={EQUITY_STRINGS.oddsLabel} value={percent(potOdds)} />
          <ValuePlate label={EQUITY_STRINGS.callLabel} value={`${spot.priceToCall}bb`} />
          <ValuePlate
            label={EQUITY_STRINGS.lockedOuts}
            value={lockedOuts !== null ? String(lockedOuts) : '—'}
          />
        </View>
      )}

      <View style={[styles.spotBlock, { top: cardsTop }]}>
        <View style={styles.spotRow}>
          <HeroHoleCards cards={spot.heroCards} cardWidth={table.heroCardWidth} />
          <BoardCards board={spot.board} cardWidth={table.boardCardWidth} gap={table.boardGap} />
        </View>
      </View>

      <View style={[styles.dialWrap, { bottom: actionBottom }]}>
        {showingOuts ? (
          <EstimateDial
            key={`outs-${resetKey}-${spot.id}`}
            value={selectedOuts}
            min={EQUITY_OUTS_MIN}
            max={EQUITY_OUTS_MAX}
            unit={EQUITY_STRINGS.outsUnit}
            label={EQUITY_STRINGS.outsDialLabel}
            accessibilityLabel="Outs dial"
            enabled={stage1Live}
            size={dialSize}
            onChange={setSelectedOuts}
            onAdjustStart={() => {}}
            onAdjustEnd={() => {}}
          />
        ) : (
          <EstimateDial
            key={`equity-${resetKey}-${spot.id}`}
            value={selectedEquity}
            min={EQUITY_DIAL_MIN}
            max={EQUITY_DIAL_MAX}
            unit={EQUITY_STRINGS.equityUnit}
            label={EQUITY_STRINGS.equityDialLabel}
            accessibilityLabel="Equity dial"
            enabled={stage2Live}
            size={dialSize}
            onChange={setSelectedEquity}
            onAdjustStart={() => {}}
            onAdjustEnd={() => {}}
          />
        )}
      </View>

      {showingOuts ? (
        <View style={[styles.actions, { bottom: actionBottom, paddingHorizontal: sideInset }]}>
          <View pointerEvents="none" style={[styles.sideSlot, { width: buttonSize }]} />
          <View pointerEvents="none" style={[styles.dialClearance, { minWidth: dialSize }]} />
          <ArtButton
            source={equityScaleArt.buttons.lockIn}
            label={EQUITY_STRINGS.lockIn}
            enabled={stage1Live}
            size={buttonSize}
            round={false}
            onPress={lockOuts}
          />
        </View>
      ) : (
        <View style={[styles.actions, { bottom: actionBottom, paddingHorizontal: sideInset }]}>
          <ArtButton
            source={equityScaleArt.buttons.fold}
            label={EQUITY_STRINGS.fold}
            enabled={stage2Live}
            size={buttonSize}
            onPress={() => submit('fold')}
          />
          <View pointerEvents="none" style={[styles.dialClearance, { minWidth: dialSize }]} />
          <ArtButton
            source={equityScaleArt.buttons.call}
            label={EQUITY_STRINGS.call}
            enabled={stage2Live}
            size={buttonSize}
            onPress={() => submit('call')}
          />
        </View>
      )}

      {phase === 'submitting' && !holdForResultClip ? (
        <Text accessibilityLiveRegion="polite" style={styles.status}>
          {EQUITY_STRINGS.submitting}
        </Text>
      ) : null}

      {revealing || holdForResultClip ? (
        <StageResultsReveal grade={grade} onComplete={onRevealComplete} />
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'visible',
    backgroundColor: artStyle.colors.projectorBlack,
  },
  streetBand: {
    position: 'absolute',
    left: 12,
    right: 12,
    alignItems: 'center',
    zIndex: 40,
  },
  streetTitle: {
    color: artStyle.colors.goldBright,
    fontSize: 34,
    lineHeight: 36,
    letterSpacing: 2.2,
    textAlign: 'center',
    textShadowColor: 'rgba(17,23,20,0.65)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  streetCue: {
    marginTop: 2,
    color: 'rgba(232,215,167,0.82)',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  spotBlock: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 34,
  },
  spotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  valueGrid: {
    position: 'absolute',
    left: 12,
    right: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
    columnGap: 8,
    zIndex: 36,
  },
  valuePlate: {
    width: '48%',
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: artStyle.colors.gold,
    backgroundColor: 'rgba(17,23,20,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  valueLabel: {
    color: 'rgba(232,215,167,0.78)',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  valueText: {
    color: artStyle.colors.goldBright,
    fontSize: 22,
    fontWeight: '900',
  },
  scaleWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 32,
    overflow: 'visible',
  },
  dialWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 45,
    overflow: 'visible',
  },
  actions: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    zIndex: 50,
    pointerEvents: 'box-none',
  },
  sideSlot: {
    width: 84,
    height: 1,
  },
  dialClearance: {
    flex: 1,
    minWidth: 148,
    height: 1,
  },
  status: {
    position: 'absolute',
    bottom: 250,
    alignSelf: 'center',
    color: artStyle.colors.cream,
    fontWeight: '800',
    zIndex: 60,
  },
});
