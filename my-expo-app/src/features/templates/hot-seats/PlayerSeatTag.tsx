import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { artStyle } from '../../../../theme/artStyle';
import type { SceneFrame } from './sceneLayout';

type PlayerSeatTagProps = {
  frame: SceneFrame;
  title: string;
  actionLabel: string | null;
  stackLabel: string;
  opacity?: number;
};

export function PlayerSeatTag({ frame, title, actionLabel, stackLabel, opacity = 1 }: PlayerSeatTagProps) {
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
        },
      ]}>
      <LinearGradient
        colors={[artStyle.colors.cream, artStyle.colors.goldBright]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.face}>
        <Text
          style={actionLabel ? styles.action : styles.title}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.72}>
          {actionLabel ?? title}
        </Text>
        <Text style={styles.detail} numberOfLines={1}>
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
    backgroundColor: artStyle.colors.tobacco,
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
    color: artStyle.colors.projectorBlack,
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '700',
  },
  action: {
    color: artStyle.colors.teal,
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '800',
  },
});
