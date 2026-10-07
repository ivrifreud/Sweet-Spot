import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { artStyle } from '../../../../theme/artStyle';
import type { SceneFrame } from './sceneLayout';
import type { SeatTagTone } from './seatTag';

const TAG_FACE: Record<SeatTagTone, { colors: [string, string]; ink: string; rim: string }> = {
  idle: {
    colors: [artStyle.colors.tagPaper, artStyle.colors.tagAsh],
    ink: artStyle.colors.projectorBlack,
    rim: artStyle.colors.tagRim,
  },
  fold: {
    colors: [artStyle.colors.oxblood, artStyle.colors.oxblood],
    ink: artStyle.colors.cream,
    rim: artStyle.colors.tobacco,
  },
  call: {
    colors: [artStyle.colors.teal, artStyle.colors.teal],
    ink: artStyle.colors.cream,
    rim: artStyle.colors.tobacco,
  },
  raise: {
    colors: [artStyle.colors.goldBright, artStyle.colors.gold],
    ink: artStyle.colors.projectorBlack,
    rim: artStyle.colors.tobacco,
  },
};

type PlayerSeatTagProps = {
  frame: SceneFrame;
  title: string;
  actionLabel: string | null;
  stackLabel: string;
  tone?: SeatTagTone;
  opacity?: number;
};

export function PlayerSeatTag({
  frame,
  title,
  actionLabel,
  stackLabel,
  tone = 'idle',
  opacity = 1,
}: PlayerSeatTagProps) {
  const face = TAG_FACE[tone];
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={actionLabel ? `${actionLabel}. ${stackLabel}` : `${title}. ${stackLabel}`}
      style={[
        styles.rim,
        {
          left: frame.x,
          top: frame.y,
          width: frame.width,
          height: frame.height,
          opacity,
          backgroundColor: face.rim,
        },
      ]}>
      <LinearGradient
        colors={face.colors}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.face}>
        <Text
          style={[actionLabel ? styles.action : styles.title, { color: face.ink }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.72}>
          {actionLabel ?? title}
        </Text>
        <Text style={[styles.detail, { color: face.ink }]} numberOfLines={1}>
          {stackLabel}
        </Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  rim: {
    position: 'absolute',
    zIndex: 40,
    borderRadius: 12,
    padding: 2,
  },
  face: {
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    overflow: 'hidden',
  },
  title: {
    color: artStyle.colors.projectorBlack,
    fontSize: 15,
    lineHeight: 17,
    fontWeight: '800',
  },
  detail: {
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '700',
  },
  action: {
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '800',
  },
});
