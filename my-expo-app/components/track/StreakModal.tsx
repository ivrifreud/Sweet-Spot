import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { artStyle } from '../../theme/artStyle';

type Props = {
  visible: boolean;
  currentStreak: number;
  bestStreak: number;
  onClose: () => void;
};

export function StreakModal({ visible, currentStreak, bestStreak, onClose }: Props) {
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular });
  const display = fontsLoaded ? { fontFamily: 'BebasNeue_400Regular' } : null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close streak modal" />
      <View style={styles.centerWrap} pointerEvents="box-none">
        <View style={styles.card}>
          <Text style={[styles.title, display]}>FIRE STREAK</Text>
          <Text style={styles.subtitle}>Play at least one stage hand each day.</Text>
          <View style={styles.statRow}>
            <Text style={styles.label}>Current</Text>
            <Text style={[styles.value, display]}>{currentStreak} days</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.label}>Best</Text>
            <Text style={[styles.value, display]}>{bestStreak} days</Text>
          </View>
          <Text style={styles.footer}>Keep the fire alive. Come back tomorrow for +1.</Text>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.button, pressed ? styles.pressed : null]}
            accessibilityRole="button"
            accessibilityLabel="Close streak details">
            <Text style={[styles.buttonText, display]}>BACK TO THE TABLE</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17,23,20,0.72)',
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: artStyle.colors.gold,
    backgroundColor: artStyle.colors.projectorBlack,
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 10,
  },
  title: {
    color: artStyle.colors.goldBright,
    fontSize: 34,
    letterSpacing: 1.8,
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(232,215,167,0.82)',
    fontSize: 14,
    textAlign: 'center',
  },
  statRow: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(200,155,60,0.45)',
    backgroundColor: 'rgba(11,95,93,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  label: {
    color: 'rgba(232,215,167,0.75)',
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  value: {
    color: artStyle.colors.cream,
    fontSize: 28,
    letterSpacing: 0.7,
  },
  footer: {
    color: artStyle.colors.cream,
    fontSize: 13,
    textAlign: 'center',
  },
  button: {
    minHeight: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: artStyle.colors.gold,
    backgroundColor: artStyle.colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    paddingHorizontal: 14,
  },
  buttonText: {
    color: artStyle.colors.projectorBlack,
    fontSize: 16,
    letterSpacing: 1,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.97 }],
  },
});

