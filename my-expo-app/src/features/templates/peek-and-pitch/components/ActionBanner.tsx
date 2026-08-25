import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { STRINGS } from '../strings';
import type { HeroPosition, SpotDecision } from '../types';

type ActionBannerProps = {
  position: HeroPosition;
  actionLine: string;
  potLabel: string;
  progressLabel?: string;
  accent: string;
  decision: SpotDecision | null;
  handLabel: string | null;
  onOpenPicker?: () => void;
};

/** Floating banner with the table action, plus the authoring shortcut for pinning cards. */
export function ActionBanner({
  position,
  actionLine,
  potLabel,
  progressLabel,
  accent,
  decision,
  handLabel,
  onOpenPicker,
}: ActionBannerProps) {
  const pickerTap = Gesture.Tap().onEnd((_event, success) => {
    if (success) {
      onOpenPicker?.();
    }
  });

  return (
    <View style={styles.root} pointerEvents="box-none">
      <View style={styles.banner}>
        <View style={[styles.positionPill, { borderColor: accent }]}>
          <Text style={[styles.positionText, { color: accent }]}>{position}</Text>
        </View>

        <View style={styles.copy}>
          <Text style={styles.action} numberOfLines={2}>
            {actionLine}
          </Text>
          <Text style={styles.pot}>
            {STRINGS.potLabel} {potLabel}
            {progressLabel ? ` · ${progressLabel}` : ''}
          </Text>
        </View>

        {onOpenPicker ? (
          <GestureDetector gesture={pickerTap}>
            <View testID="open-card-picker" style={styles.pickerButton}>
              <Text style={styles.pickerButtonText}>{STRINGS.chooseCards}</Text>
            </View>
          </GestureDetector>
        ) : null}
      </View>

      {decision ? (
        <View style={[styles.result, { borderColor: accent }]}>
          <Text style={[styles.resultText, { color: accent }]}>
            {decision === 'fold'
              ? STRINGS.folded
              : decision === 'check'
                ? STRINGS.checked
                : decision === 'call'
                  ? STRINGS.called
                  : STRINGS.raised}
            {handLabel ? ` \u00b7 ${handLabel}` : ''}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    alignItems: 'center',
    rowGap: 10,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(8,10,14,0.66)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.14)',
    maxWidth: '94%',
  },
  positionPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  positionText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  copy: {
    flexShrink: 1,
  },
  action: {
    color: '#f4f4f5',
    fontSize: 13,
    fontWeight: '600',
  },
  pot: {
    color: 'rgba(244,244,245,0.6)',
    fontSize: 11,
    marginTop: 1,
    letterSpacing: 0.4,
  },
  pickerButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  pickerButtonText: {
    color: 'rgba(244,244,245,0.85)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  result: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'rgba(8,10,14,0.72)',
  },
  resultText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
