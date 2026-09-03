import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { artStyle } from '../../../../../theme/artStyle';
import { STRINGS } from '../strings';
import type { HeroPosition, SpotDecision } from '../types';

type ActionBannerProps = {
  position: HeroPosition;
  actionLine: string;
  potLabel: string;
  streetLabel?: string;
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
  streetLabel,
  progressLabel,
  accent,
  decision,
  handLabel,
  onOpenPicker,
}: ActionBannerProps) {
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular });
  const display = fontsLoaded ? { fontFamily: 'BebasNeue_400Regular' } : null;

  const pickerTap = Gesture.Tap().onEnd((_event, success) => {
    if (success) {
      onOpenPicker?.();
    }
  });

  const potLine = `${STRINGS.potLabel} ${potLabel}`;
  const stateLine = [potLine, streetLabel].filter(Boolean).join(' · ');
  const a11yParts = [position, actionLine, stateLine, progressLabel].filter(Boolean);

  return (
    <View
      style={styles.root}
      pointerEvents="box-none"
      accessible
      accessibilityRole="summary"
      accessibilityLabel={a11yParts.join('. ')}>
      <View style={styles.banner}>
        <View style={[styles.positionPill, { borderColor: accent }]}>
          <Text style={[styles.positionText, display, { color: accent }]}>{position}</Text>
        </View>

        <View style={styles.copy}>
          <Text style={styles.action} numberOfLines={2}>
            {actionLine}
          </Text>

          <View style={styles.metaBlock}>
            <Text style={[styles.pot, display]} numberOfLines={1}>
              {stateLine}
            </Text>
            {progressLabel ? (
              <Text style={styles.progress} numberOfLines={1}>
                {progressLabel}
              </Text>
            ) : null}
          </View>
        </View>

        {onOpenPicker ? (
          <GestureDetector gesture={pickerTap}>
            <View
              testID="open-card-picker"
              accessibilityRole="button"
              accessibilityLabel={STRINGS.chooseCards}
              style={styles.pickerButton}>
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
    rowGap: 6,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(17,23,20,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(232,215,167,0.22)',
    maxWidth: '88%',
  },
  positionPill: {
    minWidth: 40,
    minHeight: 28,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(17,23,20,0.55)',
  },
  positionText: {
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 1.4,
    lineHeight: 18,
  },
  copy: {
    flexShrink: 1,
    flexGrow: 1,
    rowGap: 2,
  },
  action: {
    color: artStyle.colors.cream,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
  },
  metaBlock: {
    rowGap: 1,
  },
  pot: {
    color: artStyle.colors.goldBright,
    fontSize: 13,
    letterSpacing: 1,
    lineHeight: 16,
  },
  progress: {
    color: 'rgba(232,215,167,0.88)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    lineHeight: 14,
  },
  pickerButton: {
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(232,215,167,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerButtonText: {
    color: 'rgba(232,215,167,0.9)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  result: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'rgba(17,23,20,0.78)',
  },
  resultText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
});
