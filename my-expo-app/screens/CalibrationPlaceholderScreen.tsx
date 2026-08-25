import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { brand } from '../theme/brand';

type Props = {
  onStartTable: () => void;
  onBack: () => void;
};

/**
 * Placeholder until Ivri's calibration spots + routing land.
 * Keeps Guy's vertical-slice UI path moving: Auth → Calibration → Template 1.
 */
export function CalibrationPlaceholderScreen({ onStartTable, onBack }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 28 }]}>
      <Text style={styles.kicker}>Calibration</Text>
      <Text style={styles.title}>Adaptive placement coming next</Text>
      <Text style={styles.body}>
        Stage 1 and Stage 2 spots will live here. For this build, open The Peek and Pitch to finish
        Template 1 gesture QA, then return when spot content is seeded.
      </Text>

      <Pressable
        onPress={onStartTable}
        style={styles.primary}
        accessibilityRole="button"
        accessibilityLabel="Open The Peek and Pitch">
        <Text style={styles.primaryText}>Open The Peek and Pitch</Text>
      </Pressable>

      <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
        <Text style={styles.backText}>Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: brand.nightSoft,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  kicker: {
    color: brand.tealNeon,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  title: {
    color: brand.goldBright,
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 12,
  },
  body: {
    color: brand.ink,
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.9,
    marginBottom: 28,
  },
  primary: {
    alignSelf: 'flex-start',
    backgroundColor: brand.teal,
    borderColor: brand.tealNeon,
    borderWidth: 1.5,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  primaryText: {
    color: brand.ink,
    fontWeight: '800',
    fontSize: 15,
  },
  back: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backText: {
    color: 'rgba(247,241,227,0.7)',
    fontWeight: '600',
    fontSize: 15,
  },
});
