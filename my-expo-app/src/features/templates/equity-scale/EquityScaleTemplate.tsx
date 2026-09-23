/* eslint-disable react-hooks/immutability -- Reanimated SharedValues are mutable animation state. */
/* eslint-disable react-hooks/set-state-in-effect -- Props drive the template state machine and reset cycle. */
import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { playSfx } from '../../../../lib/audio';
import { resultClipKind } from '../../../../lib/equity-scale/resultPresentation';
import { artStyle } from '../../../../theme/artStyle';
import type { DecisionOutcome } from '../../decision-feedback/types';
import { GestureTutorialOverlay } from '../../gesture-tutorial';
import {
  EQUITY_SCALE_TUTORIAL,
  advanceStep,
  allowedActionsForStep,
  currentStep,
  hasSeenTemplateTutorial,
  isComplete,
  markTemplateTutorialSeen,
  matchesCurrentStep,
} from '../../../../lib/gesture-tutorial';
import type { GestureTutorialAction } from '../../../../lib/gesture-tutorial';
import {
  DEFAULT_EQUITY_SPOT,
  EQUITY_DIAL_MAX,
  EQUITY_DIAL_MIN,
  EQUITY_INITIAL_EQUITY,
  EQUITY_INITIAL_OUTS,
  EQUITY_OUTS_MAX,
  EQUITY_OUTS_MIN,
} from './config';
import { dialValueToTilt, scaleFramePosition } from './components/scaleArmLayout';
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
import { CARD_ROW_SIDE_INSET, equityTableLayout, equityTutorialHits } from './tableLayout';
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
  forceTutorial?: boolean;
};

export function EquityScaleTemplate({
  spot = DEFAULT_EQUITY_SPOT,
  disabled = false,
  resetKey = 0,
  outcome = null,
  grade = null,
  onSubmit,
  onOutcomeAnimationComplete,
  forceTutorial = false,
}: EquityScaleTemplateProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular });
  const display = fontsLoaded ? { fontFamily: 'BebasNeue_400Regular' } : null;
  const [selectedOuts, setSelectedOuts] = useState(EQUITY_INITIAL_OUTS);
  const [selectedEquity, setSelectedEquity] = useState(EQUITY_INITIAL_EQUITY);
  const hosePosition = useSharedValue(
    scaleFramePosition(dialValueToTilt(EQUITY_INITIAL_OUTS, EQUITY_OUTS_MIN, EQUITY_OUTS_MAX))
  );
  const [lockedOuts, setLockedOuts] = useState<number | null>(null);
  const [phase, setPhase] = useState<EquityScalePhase>('entering');
  const submittedRef = useRef(false);
  const animatedOutcomeRef = useRef<DecisionOutcome | null>(null);
  const revealCompleteRef = useRef(false);
  const onOutcomeCompleteRef = useRef(onOutcomeAnimationComplete);
  const [tutorialReady, setTutorialReady] = useState(forceTutorial);
  const [tutorialActive, setTutorialActive] = useState(forceTutorial);
  const [tutorialIndex, setTutorialIndex] = useState(0);
  const [tutorialSuccess, setTutorialSuccess] = useState(false);
  const [rejectTick, setRejectTick] = useState(0);
  const tutorialTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tutorialActiveRef = useRef(false);
  const tutorialIndexRef = useRef(0);
  const tutorialBusyRef = useRef(false);
  const tutorialDoneRef = useRef(false);

  tutorialActiveRef.current = tutorialActive;
  tutorialIndexRef.current = tutorialIndex;

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

  useEffect(() => {
    if (forceTutorial) {
      // Keep a finished/skipped coach off for this mount even if deps re-fire.
      if (tutorialDoneRef.current) {
        setTutorialActive(false);
        setTutorialReady(true);
        return;
      }
      tutorialBusyRef.current = false;
      setTutorialIndex(0);
      setTutorialSuccess(false);
      setTutorialActive(true);
      setTutorialReady(true);
      return;
    }
    if (tutorialDoneRef.current) {
      setTutorialActive(false);
      setTutorialReady(true);
      return;
    }
    let cancelled = false;
    hasSeenTemplateTutorial(EQUITY_SCALE_TUTORIAL.templateId).then((seen) => {
      if (cancelled || tutorialDoneRef.current) {
        return;
      }
      setTutorialActive(!seen);
      setTutorialReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [forceTutorial, resetKey, spot.id]);

  useEffect(() => {
    return () => {
      if (tutorialTimer.current) {
        clearTimeout(tutorialTimer.current);
      }
    };
  }, []);

  const potOdds = requiredEquity(spot.potBeforeCall, spot.priceToCall);
  const showingOuts = phase === 'entering' || phase === 'stage1';
  useEffect(() => {
    const value = showingOuts ? selectedOuts : selectedEquity;
    const min = showingOuts ? EQUITY_OUTS_MIN : EQUITY_DIAL_MIN;
    const max = showingOuts ? EQUITY_OUTS_MAX : EQUITY_DIAL_MAX;
    hosePosition.value = scaleFramePosition(dialValueToTilt(value, min, max));
  }, [hosePosition, resetKey, selectedEquity, selectedOuts, showingOuts]);
  const stage1Live = !disabled && phase === 'stage1';
  const stage2Live = !disabled && phase === 'stage2';
  const revealing =
    phase === 'revealing' || phase === 'correct' || phase === 'incorrect' || phase === 'resolved';
  const holdForResultClip = resultClipKind(grade) !== null;

  const restoreLiveSpot = useCallback(() => {
    setSelectedOuts(EQUITY_INITIAL_OUTS);
    setSelectedEquity(EQUITY_INITIAL_EQUITY);
    setLockedOuts(null);
    submittedRef.current = false;
    setPhase('stage1');
  }, []);

  const endTutorial = useCallback(() => {
    tutorialBusyRef.current = false;
    tutorialDoneRef.current = true;
    setTutorialSuccess(false);
    setTutorialActive(false);
    restoreLiveSpot();
    void markTemplateTutorialSeen(EQUITY_SCALE_TUTORIAL.templateId);
  }, [restoreLiveSpot]);

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
      if (!matchesCurrentStep(EQUITY_SCALE_TUTORIAL.steps, tutorialIndexRef.current, action)) {
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
        const current = currentStep(EQUITY_SCALE_TUTORIAL.steps, tutorialIndexRef.current);
        const next = advanceStep(tutorialIndexRef.current, EQUITY_SCALE_TUTORIAL.steps.length);
        setTutorialSuccess(false);
        if (current?.id === 'lock-in') {
          setPhase('stage2');
        }
        if (isComplete(next, EQUITY_SCALE_TUTORIAL.steps.length)) {
          endTutorial();
          return;
        }
        setTutorialIndex(next);
        tutorialBusyRef.current = false;
      }, 220);
    },
    [endTutorial, rejectTutorial]
  );

  const lockOuts = useCallback(() => {
    if (!stage1Live) return;
    if (tutorialActiveRef.current) {
      if (!matchesCurrentStep(EQUITY_SCALE_TUTORIAL.steps, tutorialIndexRef.current, 'lockIn')) {
        rejectTutorial();
        return;
      }
      playSfx('scaleButton');
      setLockedOuts(selectedOuts);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      completeTutorialAction('lockIn');
      return;
    }
    playSfx('scaleButton');
    setLockedOuts(selectedOuts);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setPhase('stage2');
  }, [completeTutorialAction, rejectTutorial, selectedOuts, stage1Live]);

  const submit = useCallback(
    (decision: EquityDecision) => {
      if (tutorialActiveRef.current) {
        playSfx('scaleButton');
        completeTutorialAction(decision);
        return;
      }
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
    [completeTutorialAction, lockedOuts, onSubmit, selectedEquity, selectedOuts, stage2Live]
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
  const hits = equityTutorialHits(table, { width: windowWidth, height: windowHeight });
  const tutorialStep = currentStep(EQUITY_SCALE_TUTORIAL.steps, tutorialIndex);
  const showTutorial =
    tutorialReady &&
    tutorialActive &&
    Boolean(tutorialStep) &&
    (phase === 'stage1' || phase === 'stage2');
  const tutorialAllowed = showTutorial
    ? allowedActionsForStep(EQUITY_SCALE_TUTORIAL.steps, tutorialIndex)
    : undefined;
  const dialEnabled =
    tutorialReady &&
    (showingOuts ? stage1Live : stage2Live) &&
    (!showTutorial || Boolean(tutorialAllowed?.includes('turnDial')));
  const lockInEnabled =
    tutorialReady && stage1Live && (!showTutorial || Boolean(tutorialAllowed?.includes('lockIn')));
  const foldEnabled =
    tutorialReady && stage2Live && (!showTutorial || Boolean(tutorialAllowed?.includes('fold')));
  const callEnabled =
    tutorialReady && stage2Live && (!showTutorial || Boolean(tutorialAllowed?.includes('call')));
  const showDialHand = !showTutorial || tutorialStep?.hand !== 'turnDial';

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

      <View style={[styles.scaleWrap, { top: scaleTop, height: table.scaleHeight }]}>
        <ScaleScene
          position={hosePosition}
          initialPosition={scaleFramePosition(
            dialValueToTilt(EQUITY_INITIAL_OUTS, EQUITY_OUTS_MIN, EQUITY_OUTS_MAX)
          )}
          outcome={activeOutcome}
          stagesCorrect={grade?.stagesCorrect ?? null}
          width={table.scaleWidth}
          height={table.scaleHeight}
          resetKey={resetKey}
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
            enabled={dialEnabled}
            size={dialSize}
            showHand={showDialHand}
            onChange={setSelectedOuts}
            onAdjustStart={() => {}}
            onAdjustEnd={() => {
              if (tutorialAllowed?.includes('turnDial')) completeTutorialAction('turnDial');
            }}
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
            enabled={dialEnabled}
            size={dialSize}
            showHand={showDialHand}
            onChange={setSelectedEquity}
            onAdjustStart={() => {}}
            onAdjustEnd={() => {
              if (tutorialAllowed?.includes('turnDial')) completeTutorialAction('turnDial');
            }}
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
            enabled={lockInEnabled}
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
            enabled={foldEnabled}
            size={buttonSize}
            onPress={() => submit('fold')}
          />
          <View pointerEvents="none" style={[styles.dialClearance, { minWidth: dialSize }]} />
          <ArtButton
            source={equityScaleArt.buttons.call}
            label={EQUITY_STRINGS.call}
            enabled={callEnabled}
            size={buttonSize}
            onPress={() => submit('call')}
          />
        </View>
      )}

      {revealing ? <StageResultsReveal grade={grade} onComplete={onRevealComplete} /> : null}

      {showTutorial && tutorialStep ? (
        <View style={styles.tutorialHost} pointerEvents="box-none">
          <GestureTutorialOverlay
            config={EQUITY_SCALE_TUTORIAL}
            step={tutorialStep}
            stepIndex={tutorialIndex}
            dialHit={hits.dialHit}
            lockInHit={hits.lockInHit}
            foldHit={hits.foldHit}
            callHit={hits.callHit}
            success={tutorialSuccess}
            rejectTick={rejectTick}
            onSkip={endTutorial}
          />
        </View>
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
    left: CARD_ROW_SIDE_INSET,
    right: CARD_ROW_SIDE_INSET,
    zIndex: 34,
  },
  spotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    columnGap: 8,
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
    zIndex: 38,
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
  tutorialHost: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    elevation: 9999,
    overflow: 'visible',
  },
});
