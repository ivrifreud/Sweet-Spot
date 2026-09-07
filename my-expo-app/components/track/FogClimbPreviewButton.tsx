import { Pressable, StyleSheet, Text } from 'react-native';

import { artStyle } from '../../theme/artStyle';

/**
 * TEMPORARY DEV PREVIEW — DELETE THIS FILE when fog/camera motion is signed off.
 *
 * Why it exists: lets us queue the Benny's Garden fog-part + camera-climb
 * sequence from the map without finishing four real nodes. It is not a
 * product control. Remove the import and JSX in `screens/TrackMapScreen.tsx`
 * at the same time as this file.
 */
type Props = {
  onPress: () => void;
  label?: string;
  accessibilityLabel?: string;
};

export function FogClimbPreviewButton({
  onPress,
  label = 'FOG UP',
  accessibilityLabel = 'Preview fog parting and camera climb. Development only.',
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    zIndex: 50,
    elevation: 16,
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: artStyle.colors.gold,
    backgroundColor: 'rgba(17,23,20,0.92)',
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.94 }],
  },
  label: {
    color: artStyle.colors.goldBright,
    fontSize: 12,
    letterSpacing: 1.2,
    fontWeight: '700',
  },
});
