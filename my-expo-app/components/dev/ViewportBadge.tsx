import { StyleSheet, Text, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { artStyle } from '../../theme/artStyle';

/**
 * Dev-only HUD so we can see whether the preview is at phone size.
 * Returns null in production builds.
 */
export function ViewportBadge() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  if (!__DEV__) {
    return null;
  }

  return (
    <Text pointerEvents="none" style={styles.badge}>
      {`${Math.round(width)}×${Math.round(height)} · top ${Math.round(insets.top)} bot ${Math.round(insets.bottom)}`}
    </Text>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    zIndex: 9999,
    overflow: 'hidden',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(17,23,20,0.72)',
    color: artStyle.colors.cream,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
