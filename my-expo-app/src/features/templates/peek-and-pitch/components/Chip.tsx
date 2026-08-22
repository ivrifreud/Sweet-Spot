import { StyleSheet, View } from 'react-native';

export type ChipTone = 'red' | 'green' | 'black' | 'blue';

const TONES: Record<ChipTone, { body: string; edge: string; stripe: string }> = {
  red: { body: '#c0392b', edge: '#8e2a20', stripe: '#f5efe6' },
  green: { body: '#1f7a4d', edge: '#155638', stripe: '#f5efe6' },
  black: { body: '#22252b', edge: '#12141a', stripe: '#d9d2c5' },
  blue: { body: '#1f5f9e', edge: '#154470', stripe: '#f0f4f8' },
};

type ChipProps = {
  tone: ChipTone;
  /** Diameter of the chip face. */
  size: number;
  /** Vertical squash, so the chip reads as if seen from the player's low camera angle. */
  flatten?: number;
};

/** A single casino chip seen at a shallow angle. Drawn in code so it can be animated freely. */
export function Chip({ tone, size, flatten = 0.42 }: ChipProps) {
  const palette = TONES[tone];
  const height = size * flatten;

  return (
    <View
      style={[
        styles.chip,
        {
          width: size,
          height,
          borderRadius: height / 2,
          backgroundColor: palette.body,
          borderColor: palette.edge,
        },
      ]}>
      <View style={[styles.stripe, { backgroundColor: palette.stripe, left: size * 0.16 }]} />
      <View style={[styles.stripe, { backgroundColor: palette.stripe, left: size * 0.47 }]} />
      <View style={[styles.stripe, { backgroundColor: palette.stripe, left: size * 0.78 }]} />
      <View
        style={[
          styles.gloss,
          {
            borderRadius: height / 2,
            height: height * 0.36,
            width: size * 0.72,
            left: size * 0.14,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  stripe: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 4,
    opacity: 0.85,
  },
  gloss: {
    position: 'absolute',
    top: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
});
