import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { brand } from '../theme/brand';

type Props = {
  onBack: () => void;
};

/** Temporary next page after splash — real home/calibration comes later in the sprint. */
export function NextScreen({ onBack }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <Text style={styles.title}>You are in</Text>
      <Text style={styles.body}>
        This is a placeholder screen. Next we will build the real flow (auth to calibration to table).
      </Text>
      <Pressable onPress={onBack} style={styles.button} accessibilityRole="button">
        <Text style={styles.buttonText}>Back to splash</Text>
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
  title: {
    color: brand.goldBright,
    fontSize: 34,
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
  button: {
    alignSelf: 'flex-start',
    backgroundColor: brand.teal,
    borderColor: brand.tealNeon,
    borderWidth: 1.5,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: brand.ink,
    fontWeight: '700',
    fontSize: 16,
  },
});
